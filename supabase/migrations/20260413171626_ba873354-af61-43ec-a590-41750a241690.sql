-- Allow team role to insert products
CREATE POLICY "Team can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'team'::app_role));

-- Allow team role to upload to product-images bucket
CREATE POLICY "Team can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'team'::app_role)
);

-- Allow team to read their uploaded images
CREATE POLICY "Team can view product images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'team'::app_role)
);