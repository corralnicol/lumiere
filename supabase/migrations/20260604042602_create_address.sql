ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS state text;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS city text;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address text;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS zip text;