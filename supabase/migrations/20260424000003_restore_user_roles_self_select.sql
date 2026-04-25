-- Migration: restore_user_roles_self_select (correctif post-admin-removal)
-- Date:      2026-04-24
--
-- BUG FIX : la migration 20260424000002_drop_admin_policies a retiré les
-- 3 policies admin sur public.user_roles (Cat.1) sans en recréer aucune
-- équivalente, ce qui a laissé la table SANS policies du tout.
--
-- Conséquence : les policies storage (Cat.4) qui font un sous-EXISTS sur
-- user_roles ne peuvent plus lire la table en contexte authenticated, donc
-- le check role IN ('team', 'backoffice', 'superadmin') retourne toujours
-- false → upload storage refusé pour TOUS les users (même superadmin).
--
-- Le rôle authenticated avait besoin d'au moins UNE policy SELECT pour que
-- les sous-EXISTS marchent. Cette migration la restaure de façon minimale
-- et sécurisée :
--   - Chaque user peut SELECT ses propres rôles (pas ceux des autres)
--   - Superadmin peut SELECT/INSERT/UPDATE/DELETE tous les rôles
--     (équivalent fonctionnel des anciennes policies admin, scope superadmin)
--
-- Note : la fonction has_role() est SECURITY DEFINER, donc elle bypass RLS
-- et continuera à fonctionner partout où elle est appelée. Cette migration
-- ne change rien pour has_role(). Elle ne fait qu'ajouter ce qui manquait
-- pour les sous-EXISTS direct sur user_roles (notamment dans les policies
-- storage Cat.4 et dans le hook useAuth.tsx fetchRole côté frontend).
--
-- Idempotent : DROP IF EXISTS avant chaque CREATE.

-- ─────────────────────────────────────────────────────────────────────
-- 1. Self-SELECT : un user peut lire ses propres rôles
-- ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────
-- 2. Superadmin FOR ALL sur user_roles
-- ─────────────────────────────────────────────────────────────────────
-- Reproduit l'équivalent fonctionnel des anciennes "Admins can …"
-- mais limité à superadmin (cohérent avec drop admin role).
DROP POLICY IF EXISTS "Superadmin can manage all roles" ON public.user_roles;
CREATE POLICY "Superadmin can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING      (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));
