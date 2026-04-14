-- Add utilisation field and sell_price to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS utilisation text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sell_price numeric;

-- Allow backoffice role to read all products
CREATE POLICY "Backoffice can view all products"
ON public.products
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'backoffice'));

-- Allow backoffice role to update products
CREATE POLICY "Backoffice can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'backoffice'))
WITH CHECK (public.has_role(auth.uid(), 'backoffice'));

-- Allow backoffice to read categories
CREATE POLICY "Backoffice can view categories"
ON public.categories
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'backoffice'));