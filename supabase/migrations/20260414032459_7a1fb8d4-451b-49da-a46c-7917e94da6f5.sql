
-- Add badge columns to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS badge_nouveaute boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS badge_oekotex boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS badge_gots boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS badge_bio boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS badge_promo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS badge_exclusivite boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS badge_stock_limite boolean NOT NULL DEFAULT false;

-- Add viewed column to wechat_qrcodes
ALTER TABLE public.wechat_qrcodes
  ADD COLUMN IF NOT EXISTS viewed boolean NOT NULL DEFAULT false;
