-- Migration: fix_superadmin_security
-- Date:      2026-04-23
--
-- Hardens the superadmin role with defense-in-depth at the SQL layer.
-- The superadmin role must ONLY be granted to a user that satisfies ALL THREE:
--   1. role='superadmin' row in public.user_roles
--   2. auth.users.email = 's.elkharrouai@gmail.com'
--   3. 'google' is present in auth.users.raw_app_meta_data->'providers'
--      (the array of linked identity providers — NOT the scalar
--      `->>'provider'` which only reflects the most recent login method
--      and flips to 'email' after any email/password sign-in).
--
-- Layers introduced by this migration:
--   A. is_superadmin(uuid) helper function (for use in RLS and app code)
--   B. Tightened assign_superadmin_on_signup trigger (adds provider='google')
--   C. guard_superadmin_user_roles BEFORE INSERT trigger (blocks hand-rolled
--      inserts that don't meet conditions 2 + 3)
--   D. Defensive cleanup of any pre-existing bad superadmin rows
--   E. Partial UNIQUE index: at most one superadmin row in the whole DB
--
-- Idempotent: safe to replay (CREATE OR REPLACE, DROP IF EXISTS, IF NOT EXISTS).
-- This migration deliberately does NOT touch existing RLS policies on other
-- tables; that surface is addressed in a later migration once is_superadmin()
-- is available to callers.

-- ─────────────────────────────────────────────────────────────────────────────
-- A. Function: is_superadmin(uuid)
-- ─────────────────────────────────────────────────────────────────────────────
-- SECURITY DEFINER so it can read auth.users even when called by the
-- authenticated role (RLS on auth.users is owned by supabase_auth_admin).
-- Returns true only if ALL three conditions hold for the given user_id.
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN auth.users u ON u.id = ur.user_id
    WHERE ur.user_id = _user_id
      AND ur.role    = 'superadmin'::app_role
      AND u.email    = 's.elkharrouai@gmail.com'
      AND (u.raw_app_meta_data->'providers') ? 'google'
  );
$$;

COMMENT ON FUNCTION public.is_superadmin(uuid) IS
  'Defense-in-depth superadmin check: user_roles row + exact email + Google '
  'listed in the linked providers array. The scalar ->>''provider'' is NOT used '
  'because it reflects the latest login method and flips to ''email'' after any '
  'email/password sign-in. Session-level "currently signed in via Google" is '
  'enforced at the app/edge layer.';

-- ─────────────────────────────────────────────────────────────────────────────
-- B. Tighten the attribution trigger on auth.users insert
-- ─────────────────────────────────────────────────────────────────────────────
-- Superadmin now requires provider='google' at signup. Without this check,
-- anyone who signs up with the email s.elkharrouai@gmail.com (even via plain
-- email/password) would auto-escalate to superadmin — that was the original
-- flaw. Backoffice attribution is unchanged (low blast radius).
--
-- The trigger `on_auth_user_created_assign_superadmin` was created in
-- migration 20260413165528 and already binds to this function; CREATE OR
-- REPLACE is enough to swap the body.
CREATE OR REPLACE FUNCTION public.assign_superadmin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Superadmin: email must match AND this specific signup must be via Google.
  -- At signup moment, GoTrue sets both scalar ->>'provider' and the
  -- ->'providers' array to the single method used, so the scalar check here
  -- is equivalent to "the user is being created via Google OAuth" and
  -- rejects any concurrent email/password signup attempt on the same email.
  IF NEW.email = 's.elkharrouai@gmail.com'
     AND NEW.raw_app_meta_data->>'provider' = 'google'
  THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Backoffice: unchanged (email-based).
  IF NEW.email = 'backoffice@asialinkltd.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'backoffice')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- C. Guard trigger: BEFORE INSERT on public.user_roles
-- ─────────────────────────────────────────────────────────────────────────────
-- Belt-and-suspenders. Even if a future migration weakens the attribution
-- trigger (step B), or if someone attempts a direct INSERT (compromised edge
-- function, SQL injection), this guard refuses any user_roles INSERT of
-- role='superadmin' unless the target user matches the triple condition.
CREATE OR REPLACE FUNCTION public.guard_superadmin_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email        text;
  v_providers    jsonb;
  v_has_google   boolean;
BEGIN
  IF NEW.role = 'superadmin'::app_role THEN
    SELECT u.email,
           u.raw_app_meta_data->'providers'
      INTO v_email, v_providers
      FROM auth.users u
      WHERE u.id = NEW.user_id;

    v_has_google := coalesce(v_providers ? 'google', false);

    IF v_email       IS DISTINCT FROM 's.elkharrouai@gmail.com'
       OR NOT v_has_google THEN
      RAISE EXCEPTION
        'superadmin role can only be assigned to s.elkharrouai@gmail.com with Google linked as a provider (got email=%, providers=%)',
        coalesce(v_email,            '<null>'),
        coalesce(v_providers::text,  '<null>')
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_superadmin_user_roles_trg ON public.user_roles;
CREATE TRIGGER guard_superadmin_user_roles_trg
  BEFORE INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_superadmin_user_roles();

-- ─────────────────────────────────────────────────────────────────────────────
-- D. Defensive cleanup of existing user_roles rows
-- ─────────────────────────────────────────────────────────────────────────────
-- Remove any pre-existing superadmin row that doesn't satisfy the three
-- conditions. Covers the historical case where the old (email-only)
-- attribution trigger could have granted superadmin to an email/password
-- signup of s.elkharrouai@gmail.com, or where the row was inserted manually.
--
-- Safe when there is nothing to clean: the DELETE is a no-op.
-- MUST run BEFORE the partial unique index in step E.
DELETE FROM public.user_roles ur
WHERE ur.role = 'superadmin'::app_role
  AND NOT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = ur.user_id
      AND u.email = 's.elkharrouai@gmail.com'
      AND (u.raw_app_meta_data->'providers') ? 'google'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- E. Partial UNIQUE index: at most one superadmin in the entire database
-- ─────────────────────────────────────────────────────────────────────────────
-- Even if a bug or escalation bypasses the guard, this index causes a unique
-- violation on any attempt to insert a second superadmin row.
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_single_superadmin_idx
  ON public.user_roles (role)
  WHERE role = 'superadmin'::app_role;
