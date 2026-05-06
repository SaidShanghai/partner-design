-- Migration: backfill_image_path
-- Date:      2026-04-25
--
-- Backfills the image_path column from existing image_url values for
-- products that were created before the image_path column existed.
--
-- Strategy: extract the relative path (after '/product-images/') from
-- the absolute URL and write it to image_path. The image_url column
-- is left intact for rollback safety.
--
-- Scope verification (executed before writing this migration):
--   - 3 products currently have image_url IS NOT NULL
--   - 1 distinct URL prefix, all matching the expected format
--     'https://bvnxxijorhtucxhymaqo.supabase.co/storage/v1/object/public/product-images/...'
--
-- Idempotent: only updates rows where image_path IS NULL and image_url
-- contains the expected substring, so it can be re-run safely.

UPDATE public.products
SET image_path = SUBSTRING(image_url FROM POSITION('/product-images/' IN image_url) + LENGTH('/product-images/'))
WHERE image_url IS NOT NULL
  AND image_path IS NULL
  AND image_url LIKE '%/product-images/%';
