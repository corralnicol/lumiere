ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS city text;
