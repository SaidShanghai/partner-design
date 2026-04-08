
CREATE SEQUENCE IF NOT EXISTS public.unb_seq START 1;

ALTER TABLE public.products
ADD COLUMN unb TEXT UNIQUE DEFAULT 'UNB-' || nextval('public.unb_seq')::TEXT;
