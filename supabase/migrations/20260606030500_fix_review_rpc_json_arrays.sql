CREATE OR REPLACE FUNCTION pg_temp.lumiere_reviews_array(p_reviews jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  parsed_reviews jsonb;
BEGIN
  IF jsonb_typeof(p_reviews) = 'array' THEN
    RETURN p_reviews;
  END IF;

  IF jsonb_typeof(p_reviews) = 'string' THEN
    BEGIN
      parsed_reviews := (p_reviews #>> '{}')::jsonb;

      IF jsonb_typeof(parsed_reviews) = 'array' THEN
        RETURN parsed_reviews;
      END IF;
    EXCEPTION WHEN others THEN
      RETURN '[]'::jsonb;
    END;
  END IF;

  RETURN '[]'::jsonb;
END;
$$;

UPDATE public.products
SET reviews = pg_temp.lumiere_reviews_array(reviews)
WHERE jsonb_typeof(reviews) = 'string';

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
  v_uid           uuid := auth.uid();
  caller_name     text;
  stored_reviews  jsonb;
  current_reviews jsonb;
  new_review      jsonb;
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

  SELECT reviews
  INTO stored_reviews
  FROM public.products
  WHERE id = p_product_id
    AND active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found or inactive';
  END IF;

  current_reviews := stored_reviews;

  IF jsonb_typeof(current_reviews) <> 'array' THEN
    current_reviews := '[]'::jsonb;

    IF jsonb_typeof(stored_reviews) = 'string' THEN
      BEGIN
        current_reviews := (stored_reviews #>> '{}')::jsonb;

        IF jsonb_typeof(current_reviews) <> 'array' THEN
          current_reviews := '[]'::jsonb;
        END IF;
      EXCEPTION WHEN others THEN
        current_reviews := '[]'::jsonb;
      END;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(current_reviews) AS r
    WHERE r->>'reviewer_id' = v_uid::text
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
  SET reviews = current_reviews || jsonb_build_array(new_review)
  WHERE id = p_product_id
    AND active = true;

  RETURN new_review;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.add_review(uuid, text, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_review(uuid, text, int) TO authenticated;
