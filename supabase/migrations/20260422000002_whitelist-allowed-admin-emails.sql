-- Migration 1.1 — Table whitelist allowed_admin_emails
-- Idempotente : CREATE TABLE IF NOT EXISTS + ON CONFLICT + DROP POLICY IF EXISTS

CREATE TABLE IF NOT EXISTS public.allowed_admin_emails (
  email      text        PRIMARY KEY,
  role       app_role    NOT NULL,
  invited_by uuid        REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT allowed_admin_emails_role_check
    CHECK (role::text IN ('team', 'backoffice', 'admin', 'superadmin'))
);

ALTER TABLE public.allowed_admin_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin can manage allowed_admin_emails"
  ON public.allowed_admin_emails;

CREATE POLICY "Superadmin can manage allowed_admin_emails"
ON public.allowed_admin_emails FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Seed : migration des 2 emails hardcodés vers la whitelist
INSERT INTO public.allowed_admin_emails (email, role) VALUES
  ('s.elkharrouai@gmail.com',    'superadmin'),
  ('backoffice@asialinkltd.com', 'backoffice')
ON CONFLICT (email) DO NOTHING;
