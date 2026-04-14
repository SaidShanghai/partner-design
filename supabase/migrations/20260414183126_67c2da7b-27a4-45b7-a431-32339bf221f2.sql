CREATE POLICY "Backoffice can view qrcodes"
ON public.wechat_qrcodes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'backoffice'::app_role));