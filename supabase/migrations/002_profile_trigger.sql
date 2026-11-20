-- Level Up Planner: Phase 4.3 - Automatic Profile Creation Trigger
-- Automatically creates a profile record in public.profiles when a new user signs up in auth.users

-- ============================================================================
-- 1. TRIGGER FUNCTION: handle_new_user()
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_display_name TEXT;
BEGIN
  -- Extract display name from user metadata if provided, otherwise fallback to default
  v_display_name := NULLIF(TRIM(COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  )), '');

  IF v_display_name IS NULL THEN
    v_display_name := 'Planner User';
  END IF;

  -- Insert new profile tied directly to the auth user ID
  -- ON CONFLICT ensures idempotent behavior if profile was already created
  INSERT INTO public.profiles (
    id,
    display_name,
    week_start,
    theme_preference,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_display_name,
    1,
    'light',
    0,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Revoke direct execution privileges from client roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- 2. TRIGGER DEFINITION
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
