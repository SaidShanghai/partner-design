-- Migration 1.A — Cleanup whitelist
-- Idempotente : CASCADE supprime automatiquement la policy RLS associée
DROP TABLE IF EXISTS public.allowed_admin_emails CASCADE;
