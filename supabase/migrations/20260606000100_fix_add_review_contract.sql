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
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_rating NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  IF NULLIF(trim(p_text), '') IS NULL THEN
    RAISE EXCEPTION 'Review text is required';
  END IF;

  PERFORM 1
  FROM public.products
  WHERE id = p_product_id
    AND active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found or inactive';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.products, jsonb_array_elements(reviews) AS r
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
    'text',          trim(p_text),
    'created_at',    now()
  );

  UPDATE public.products
  SET reviews = reviews || new_review
  WHERE id = p_product_id
    AND active = true;

  RETURN new_review;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.add_review(uuid, text, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_review(uuid, text, int) TO authenticated;
