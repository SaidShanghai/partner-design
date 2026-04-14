ALTER TABLE public.wechat_qrcodes ALTER COLUMN subcategory_id DROP NOT NULL;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS qrcode_id uuid REFERENCES public.wechat_qrcodes(id) ON DELETE SET NULL;