CREATE POLICY "Backoffice can view qrcode files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'wechat-qrcodes'
  AND public.has_role(auth.uid(), 'backoffice'::public.app_role)
);