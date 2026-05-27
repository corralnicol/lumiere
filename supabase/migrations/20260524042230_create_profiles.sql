-- Reusable trigger function: stamp updated_at on any row update
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
SET search_path = ''
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- One profile per Supabase Auth user.
-- organization_id is the *primary* org a user belongs to (the one they created
-- or were first invited to). Full membership is tracked in organization_members.

CREATE TABLE public.profiles (
  id           uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email        text        NOT NULL UNIQUE,
  first_name   text,
  last_name    text,
  avatar_url   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create a profile row when a new Auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SET search_path = ''
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.avatar_url->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync email changes from Auth to profiles
CREATE OR REPLACE FUNCTION public.handle_user_email_updated()
RETURNS trigger
SET search_path = ''
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_user_email_updated() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_user_email_updated();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read profiles (needed to display names/avatars).
-- Only the owner can update their own profile.
-- No INSERT policy: profiles are created exclusively by handle_new_user() (SECURITY DEFINER).
-- No DELETE policy: deletion cascades from auth.users via ON DELETE CASCADE (service_role only).

CREATE POLICY "profiles: authenticated users can read all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles: users can update their own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);