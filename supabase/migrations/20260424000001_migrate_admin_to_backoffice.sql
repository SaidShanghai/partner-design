-- Migration: migrate_admin_to_backoffice (2.a — data preservation)
-- Date:      2026-04-24
--
-- Part of the "drop admin role" plan. Before dropping the policies that
-- reference 'admin'::app_role (migration 20260424000002), migrate every
-- user_roles row with role='admin' to role='backoffice' so those users
-- don't lose access entirely.
--
-- Sanity check run on bvnxxijorhtucxhymaqo on 2026-04-24 returned 0 rows
-- with role='admin', so on the current production database this migration
-- is a no-op. It is kept idempotent and defensive so it remains correct if
-- the migration file is replayed on a different environment (staging,
-- fresh checkout, fork, etc.) that does have admin users.
--
-- Note: the guard trigger guard_superadmin_user_roles_trg (migration
-- 20260423000001) fires only on INSERT of role='superadmin', so neither
-- the INSERT nor the DELETE below triggers a RAISE EXCEPTION.

-- 1. Promote every admin to backoffice (ON CONFLICT handles the edge case
--    where a user already has both rows in user_roles).
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'backoffice'::app_role
FROM public.user_roles
WHERE role = 'admin'::app_role
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Remove the orphan admin rows.
DELETE FROM public.user_roles
WHERE role = 'admin'::app_role;
