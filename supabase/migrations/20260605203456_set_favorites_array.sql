-- Convert profiles.favorites from jsonb to uuid[]
-- ALTER COLUMN TYPE USING cannot use subqueries, so we use add/update/drop/rename.
ALTER TABLE public.profiles
  ADD COLUMN favorites_new uuid[] NOT NULL DEFAULT '{}';

UPDATE public.profiles
SET favorites_new = CASE
  WHEN favorites IS NULL OR favorites = '[]'::jsonb THEN '{}'::uuid[]
  ELSE ARRAY(SELECT jsonb_array_elements_text(favorites)::uuid)
END;

ALTER TABLE public.profiles DROP COLUMN favorites;
ALTER TABLE public.profiles RENAME COLUMN favorites_new TO favorites;

-- Replace jsonb-based toggle with uuid[]-based version
DROP FUNCTION IF EXISTS public.toggle_favorite(uuid);

CREATE OR REPLACE FUNCTION public.toggle_favorite(p_product_id uuid)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_uid        uuid := auth.uid();
  current_favs uuid[];
  new_favs     uuid[];
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT favorites INTO current_favs
  FROM public.profiles WHERE id = v_uid;

  IF current_favs @> ARRAY[p_product_id] THEN
    new_favs := array_remove(current_favs, p_product_id);
  ELSE
    new_favs := current_favs || p_product_id;
  END IF;

  UPDATE public.profiles SET favorites = new_favs WHERE id = v_uid;
  RETURN new_favs;
END;
$$;
