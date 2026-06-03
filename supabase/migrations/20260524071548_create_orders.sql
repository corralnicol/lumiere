ALTER TABLE public.profiles
  ADD COLUMN cart jsonb NOT NULL DEFAULT '[]';

CREATE TYPE public.order_status AS ENUM ('pending', 'completed', 'cancelled');

CREATE TABLE public.orders (
  id          uuid                PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ON DELETE RESTRICT: orders preserve history; deleting a buyer with orders is blocked
  buyer_id    uuid                NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  seller_ids  uuid[]              NOT NULL,
  status      public.order_status NOT NULL DEFAULT 'pending',
  created_at  timestamptz         NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid          NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  uuid          NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  seller_id   uuid          NOT NULL REFERENCES public.profiles(id),
  quantity    int           NOT NULL CHECK (quantity > 0),
  unit_price  numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  created_at  timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT unique_product_per_order UNIQUE (order_id, product_id)
);

CREATE INDEX idx_orders_buyer_id    ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller_ids  ON public.orders USING gin(seller_ids);

CREATE INDEX idx_order_items_order_id   ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_order_items_seller_id  ON public.order_items(seller_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Buyers see their own orders; sellers see orders that include them
-- INSERT/UPDATE only via place_order RPC (SECURITY DEFINER)
CREATE POLICY "orders: participant read"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = buyer_id
    OR seller_ids @> ARRAY[(select auth.uid())]
  );

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Visible if the parent order is visible to the calling user
-- INSERT only via place_order RPC (SECURITY DEFINER)
CREATE POLICY "order_items: participant read"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE public.orders.id = order_items.order_id
        AND (
          public.orders.buyer_id = (select auth.uid())
          OR public.orders.seller_ids @> ARRAY[(select auth.uid())]
        )
    )
  );

-- RPC: atomic checkout from profiles.cart
CREATE OR REPLACE FUNCTION public.place_order()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_buyer_id    uuid := auth.uid();
  v_cart        jsonb;
  v_item        record;
  v_product     record;
  v_items       jsonb  := '[]'::jsonb;
  v_seller_ids  uuid[] := '{}';
  v_order_id    uuid;
BEGIN
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Read cart
  SELECT cart INTO v_cart FROM public.profiles WHERE id = v_buyer_id;

  IF v_cart IS NULL OR jsonb_array_length(v_cart) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- 2 & 3. Aggregate cart by product, then lock, validate, and snapshot in one pass.
  -- Aggregating first makes a duplicated product collapse into one correct line
  -- (and avoids the unique_product_per_order violation / double-decrement bug).
  FOR v_item IN
    SELECT (elem->>'product_id')::uuid   AS product_id,
           SUM((elem->>'quantity')::int) AS quantity
    FROM jsonb_array_elements(v_cart) AS elem
    GROUP BY 1
  LOOP
    IF v_item.quantity IS NULL OR v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity for product %', v_item.product_id;
    END IF;

    SELECT id, seller_id, price, stock, active
    INTO v_product
    FROM public.products
    WHERE id = v_item.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_item.product_id;
    END IF;

    IF NOT v_product.active THEN
      RAISE EXCEPTION 'Product % is no longer available', v_product.id;
    END IF;

    IF v_product.stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_product.id;
    END IF;

    v_items := v_items || jsonb_build_object(
      'product_id', v_product.id,
      'seller_id',  v_product.seller_id,
      'unit_price', v_product.price,
      'quantity',   v_item.quantity
    );

    IF NOT (v_seller_ids @> ARRAY[v_product.seller_id]) THEN
      v_seller_ids := v_seller_ids || v_product.seller_id;
    END IF;
  END LOOP;

  -- 4. Insert order header
  INSERT INTO public.orders (buyer_id, seller_ids)
  VALUES (v_buyer_id, v_seller_ids)
  RETURNING id INTO v_order_id;

  -- 5. Insert line items (set-based from snapshot)
  INSERT INTO public.order_items (order_id, product_id, seller_id, quantity, unit_price)
  SELECT
    v_order_id,
    (i->>'product_id')::uuid,
    (i->>'seller_id')::uuid,
    (i->>'quantity')::int,
    (i->>'unit_price')::numeric
  FROM jsonb_array_elements(v_items) AS i;

  -- 6. Decrement stock (set-based from snapshot)
  UPDATE public.products p
  SET stock = p.stock - i.quantity
  FROM (
    SELECT (j->>'product_id')::uuid AS product_id,
           (j->>'quantity')::int    AS quantity
    FROM jsonb_array_elements(v_items) AS j
  ) AS i
  WHERE p.id = i.product_id;

  -- 7. Clear cart
  UPDATE public.profiles SET cart = '[]' WHERE id = v_buyer_id;

  RETURN v_order_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.place_order() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order() TO authenticated;

CREATE OR REPLACE VIEW public.buyer_analytics
  WITH (security_invoker = true)
AS
SELECT
  o.buyer_id                                AS profile_id,
  COUNT(DISTINCT o.id)                      AS total_orders,
  SUM(oi.unit_price * oi.quantity)          AS total_spent,
  SUM(oi.unit_price * oi.quantity)
    / COUNT(DISTINCT o.id)                  AS avg_order_value,
  MAX(o.created_at)                         AS last_order_at,
  (
    SELECT oi2.product_id
    FROM public.order_items oi2
    JOIN public.orders o2 ON o2.id = oi2.order_id
    WHERE o2.buyer_id = o.buyer_id
    GROUP BY oi2.product_id
    ORDER BY SUM(oi2.quantity) DESC
    LIMIT 1
  )                                         AS top_product_id
FROM public.orders o
JOIN public.order_items oi ON oi.order_id = o.id
WHERE o.buyer_id = (select auth.uid())
GROUP BY o.buyer_id;

CREATE OR REPLACE VIEW public.seller_analytics
  WITH (security_invoker = true)
AS
SELECT
  oi.seller_id                              AS profile_id,
  COUNT(DISTINCT oi.order_id)               AS total_orders,
  SUM(oi.unit_price * oi.quantity)          AS total_revenue,
  SUM(oi.unit_price * oi.quantity)
    / COUNT(DISTINCT oi.order_id)           AS avg_order_value,
  (
    SELECT oi2.product_id
    FROM public.order_items oi2
    WHERE oi2.seller_id = oi.seller_id
    GROUP BY oi2.product_id
    ORDER BY SUM(oi2.quantity) DESC
    LIMIT 1
  )                                         AS top_product_by_units,
  (
    SELECT oi2.product_id
    FROM public.order_items oi2
    WHERE oi2.seller_id = oi.seller_id
    GROUP BY oi2.product_id
    ORDER BY SUM(oi2.unit_price * oi2.quantity) DESC
    LIMIT 1
  )                                         AS top_product_by_revenue
FROM public.order_items oi
WHERE oi.seller_id = (select auth.uid())
GROUP BY oi.seller_id;
