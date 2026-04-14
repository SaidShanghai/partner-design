-- Create product status enum
CREATE TYPE public.product_status AS ENUM ('brouillon', 'en_traitement', 'valide', 'publie');

-- Add status column
ALTER TABLE public.products ADD COLUMN status public.product_status NOT NULL DEFAULT 'brouillon';

-- Update existing products to 'publie' so current site content stays visible
UPDATE public.products SET status = 'publie' WHERE status = 'brouillon';

-- Replace public SELECT policy: only show published products to public
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Public can view published products" ON public.products
FOR SELECT TO public
USING (status = 'publie');

-- Backoffice can update products (already exists, keep it)
-- Add policy: backoffice can view ALL products
DROP POLICY IF EXISTS "Backoffice can view all products" ON public.products;
CREATE POLICY "Backoffice can view all products" ON public.products
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'backoffice'::app_role));

-- Superadmin can do everything (already covered by admin policies)
-- Add superadmin explicit policies
CREATE POLICY "Superadmin can manage products" ON public.products
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Team can view their own products
CREATE POLICY "Team can view own products" ON public.products
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'team'::app_role) AND created_by = auth.uid());