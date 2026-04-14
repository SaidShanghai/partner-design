
-- Table wechat_qrcodes
CREATE TABLE public.wechat_qrcodes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subcategory_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  supplier_code text NOT NULL UNIQUE,
  image_path text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '72 hours')
);

ALTER TABLE public.wechat_qrcodes ENABLE ROW LEVEL SECURITY;

-- Team can insert
CREATE POLICY "Team can insert qrcodes"
ON public.wechat_qrcodes FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'team'::app_role));

-- Team can view
CREATE POLICY "Team can view qrcodes"
ON public.wechat_qrcodes FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'team'::app_role));

-- Admin/superadmin full access
CREATE POLICY "Admins can manage qrcodes"
ON public.wechat_qrcodes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'superadmin'::app_role));

-- Anon can select by supplier_code (for the public view page)
CREATE POLICY "Anyone can view by supplier_code"
ON public.wechat_qrcodes FOR SELECT
TO anon
USING (true);

-- Private storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('wechat-qrcodes', 'wechat-qrcodes', false);

-- Storage: team can upload
CREATE POLICY "Team can upload wechat qrcodes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wechat-qrcodes' AND public.has_role(auth.uid(), 'team'::app_role));

-- Storage: team can read their uploads
CREATE POLICY "Team can read wechat qrcodes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'wechat-qrcodes' AND public.has_role(auth.uid(), 'team'::app_role));

-- Storage: service role handles deletion (no user delete policy needed)
