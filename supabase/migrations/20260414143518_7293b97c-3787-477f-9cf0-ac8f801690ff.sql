CREATE POLICY "Team can delete own brouillon products" ON public.products
FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'team'::app_role)
  AND created_by = auth.uid()
  AND status = 'brouillon'::product_status
);