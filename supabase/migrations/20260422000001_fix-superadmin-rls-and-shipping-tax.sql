-- Migration: 20260422000001_fix-superadmin-rls-and-shipping-tax.sql
-- Idempotente : DROP POLICY IF EXISTS avant chaque CREATE POLICY
--
-- 0.2 — Étendre RLS CRM à superadmin (customers, orders, order_items,
--         invoices, suppliers, product_pricing)
-- 0.3 — Ajouter policy d'écriture sur shipping_tax_rules (admin + superadmin)

-- ─────────────────────────────────────────────
-- customers
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Superadmin can manage customers" ON public.customers;
CREATE POLICY "Superadmin can manage customers"
ON public.customers FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- ─────────────────────────────────────────────
-- orders
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Superadmin can manage orders" ON public.orders;
CREATE POLICY "Superadmin can manage orders"
ON public.orders FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- ─────────────────────────────────────────────
-- order_items
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Superadmin can manage order_items" ON public.order_items;
CREATE POLICY "Superadmin can manage order_items"
ON public.order_items FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- ─────────────────────────────────────────────
-- invoices
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Superadmin can manage invoices" ON public.invoices;
CREATE POLICY "Superadmin can manage invoices"
ON public.invoices FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- ─────────────────────────────────────────────
-- suppliers
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Superadmin can manage suppliers" ON public.suppliers;
CREATE POLICY "Superadmin can manage suppliers"
ON public.suppliers FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- ─────────────────────────────────────────────
-- product_pricing
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Superadmin can manage product_pricing" ON public.product_pricing;
CREATE POLICY "Superadmin can manage product_pricing"
ON public.product_pricing FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- ─────────────────────────────────────────────
-- shipping_tax_rules (0.3) — ajout policy écriture
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins and superadmin can manage shipping_tax_rules" ON public.shipping_tax_rules;
CREATE POLICY "Admins and superadmin can manage shipping_tax_rules"
ON public.shipping_tax_rules FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));
