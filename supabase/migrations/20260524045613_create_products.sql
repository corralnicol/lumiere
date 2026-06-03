-- profiles.favorites is needed by the toggle_favorite RPC defined below
ALTER TABLE public.profiles
  ADD COLUMN favorites jsonb NOT NULL DEFAULT '[]';

CREATE TABLE public.products (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   uuid          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        text          NOT NULL,
  description text,
  price       numeric(12,2) NOT NULL CHECK (price >= 0),
  stock       int           NOT NULL DEFAULT 0 CHECK (stock >= 0),
  active      boolean       NOT NULL DEFAULT true,
  image_url   text,
  reviews     jsonb         NOT NULL DEFAULT '[]',
  created_at  timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_active    ON public.products(active) WHERE active = true;
CREATE INDEX idx_products_fts
  ON public.products USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')));

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Unauthenticated visitors can browse active listings
CREATE POLICY "products: anon read active"
  ON public.products FOR SELECT
  TO anon
  USING (active = true);

-- Authenticated users see active products + sellers see their own inactive ones
CREATE POLICY "products: authenticated read"
  ON public.products FOR SELECT
  TO authenticated
  USING (active = true OR (select auth.uid()) = seller_id);

-- Only the owning seller can create products under their profile
CREATE POLICY "products: seller insert"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = seller_id);

-- Only the owning seller can update their products
CREATE POLICY "products: seller update"
  ON public.products FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = seller_id)
  WITH CHECK ((select auth.uid()) = seller_id);

-- No DELETE policy: use active = false for soft-delete

-- RPC: toggle a product in/out of profiles.favorites
CREATE OR REPLACE FUNCTION public.toggle_favorite(p_product_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_uid        uuid := auth.uid();
  current_favs jsonb;
  new_favs     jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT favorites INTO current_favs
  FROM public.profiles WHERE id = v_uid;

  IF current_favs @> to_jsonb(p_product_id) THEN
    SELECT jsonb_agg(elem) INTO new_favs
    FROM jsonb_array_elements(current_favs) AS elem
    WHERE elem <> to_jsonb(p_product_id);
    new_favs := COALESCE(new_favs, '[]');
  ELSE
    new_favs := current_favs || to_jsonb(p_product_id);
  END IF;

  UPDATE public.profiles SET favorites = new_favs WHERE id = v_uid;
  RETURN new_favs;
END;
$$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "products: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "products: authenticated write"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

-- RPC: append a review to products.reviews (one per user)
CREATE OR REPLACE FUNCTION public.add_review(
  p_product_id uuid,
  p_text       text,
  p_rating     int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid       uuid := auth.uid();
  caller_name text;
  new_review  jsonb;
  updated     jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_rating NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM public.products
    WHERE id = p_product_id
      AND active = true
  ) THEN
    RAISE EXCEPTION 'Product not found or inactive';
  END IF;

  PERFORM 1
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF EXISTS (
    SELECT 1 FROM public.products, jsonb_array_elements(reviews) AS r
    WHERE id = p_product_id
      AND (r->>'reviewer_id')::uuid = v_uid
  ) THEN
    RAISE EXCEPTION 'User has already reviewed this product';
  END IF;

  SELECT NULLIF(trim(concat_ws(' ', first_name, last_name)), '')
  INTO caller_name
  FROM public.profiles
  WHERE id = v_uid;

  new_review := jsonb_build_object(
    'reviewer_id',   v_uid,
    'reviewer_name', caller_name,
    'rating',        p_rating,
    'text',          p_text,
    'created_at',    now()
  );

  UPDATE public.products
  SET reviews = reviews || new_review
  WHERE id = p_product_id
  AND active = true
  RETURNING reviews INTO updated;

  RETURN updated;
END;
$$;