-- Migration: add_image_path_to_products
-- Date:      2026-04-25
--
-- Adds image_path column to store relative storage paths instead of
-- absolute URLs. Enables resilience to bucket privacy changes and
-- allows signed URL generation at render time, mirroring the pattern
-- used for wechat-qrcodes.
--
-- Phase 1.2 of the product-images bucket migration:
--   1. ADD COLUMN image_path TEXT NULL  (this migration)
--   2. backfill image_path from existing image_url   (next migration)
--   3. refactor frontend uploads to write image_path  (code change)
--   4. refactor frontend renders to use createSignedUrl  (code change)
--   5. flip bucket public=false + tighten SELECT policy  (later migration)
--   6. drop image_url column                            (final migration)
--
-- We keep image_url intact during the transition window so the existing
-- code paths keep working until every consumer is migrated.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_path TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_products_image_path
  ON public.products(image_path);
