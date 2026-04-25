-- Migration: drop_admin_policies (2.b — retrait des policies admin)
-- Date:      2026-04-24
--
-- Deuxième étape du plan "drop admin role". La première (20260424000001)
-- a migré les users role='admin' vers role='backoffice'. Celle-ci retire
-- toutes les policies RLS qui référencent 'admin'::app_role.
--
-- La valeur 'admin' reste présente dans l'enum public.app_role (choix
-- délibéré : PostgreSQL ne supporte pas DROP VALUE proprement sans
-- recréer l'enum, et laisser 'admin' orphelin est plus safe).
--
-- Structure :
--   Catégorie 1 — 13 DROP purs (superadmin FOR ALL couvre déjà)
--   Catégorie 2 —  3 DROP + CREATE simplifiées (admin OR superadmin → superadmin)
--   Catégorie 3 —  4 DROP + CREATE recomposées (union multi-rôles sans admin)
--   Catégorie 4 —  4 DROP + CREATE storage (ARRAY sans 'admin')
--
-- Idempotence : tous les DROP utilisent IF EXISTS. Les CREATE sont
-- précédés d'un DROP IF EXISTS du même nom pour permettre replay.
--
-- ─────────────────────────────────────────────────────────────────────────
-- ⚠️ CATÉGORIE 4 (storage.objects) — OWNERSHIP WARNING
-- ─────────────────────────────────────────────────────────────────────────
-- Les 4 policies storage.objects ont probablement été créées via le
-- dashboard Storage → Policies (naming "Staff can ...", "Team+ can ..."
-- correspond aux templates du dashboard). Dans ce cas, elles peuvent être
-- détenues par supabase_storage_admin au lieu de postgres.
--
-- Sur les versions récentes de Supabase Cloud (2024+), postgres peut gérer
-- ces policies via SQL, donc la section Cat.4 devrait passer. Si le
-- `supabase db push` échoue avec "must be owner of relation objects", il
-- faut appliquer cette section manuellement :
--   - Soit via Dashboard → Storage → Policies : supprimer puis recréer
--     chaque policy sans la branche 'admin' dans l'ARRAY
--   - Soit via un client psql connecté avec un rôle privilégié
--
-- Les catégories 1 à 3 (20 policies) passent indépendamment même si la
-- Cat.4 échoue : elles sont placées avant dans le fichier.


-- ═════════════════════════════════════════════════════════════════════════
-- CATÉGORIE 1 — DROP purs (13 policies)
-- ═════════════════════════════════════════════════════════════════════════
-- Superadmin a déjà FOR ALL sur user_roles (via guard indirect), products,
-- et toutes les tables CRM via migration 20260422000001, donc aucun besoin
-- de recréer quoi que ce soit.

-- CRM (6)
DROP POLICY IF EXISTS "Admins can manage customers"        ON public.customers;
DROP POLICY IF EXISTS "Admins can manage invoices"         ON public.invoices;
DROP POLICY IF EXISTS "Admins can manage order_items"      ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage orders"           ON public.orders;
DROP POLICY IF EXISTS "Admins can manage product_pricing"  ON public.product_pricing;
DROP POLICY IF EXISTS "Admins can manage suppliers"        ON public.suppliers;

-- products (3)
DROP POLICY IF EXISTS "Admins can delete products"         ON public.products;
DROP POLICY IF EXISTS "Admins can insert products"         ON public.products;
DROP POLICY IF EXISTS "Admins can update products"         ON public.products;

-- profiles (1)
DROP POLICY IF EXISTS "Admins can view all profiles"       ON public.profiles;

-- user_roles (3)
DROP POLICY IF EXISTS "Admins can delete roles"            ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles"            ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles"          ON public.user_roles;


-- ═════════════════════════════════════════════════════════════════════════
-- CATÉGORIE 2 — DROP + CREATE simplifiées (3 policies)
-- ═════════════════════════════════════════════════════════════════════════
-- Pattern : qual `has_role(admin) OR has_role(superadmin)`
--        → qual `has_role(superadmin)` seul
-- Renommage : "Admins … " (et variantes) → "Superadmin … "

-- shipping_tax_rules
DROP POLICY IF EXISTS "Admins and superadmin can manage shipping_tax_rules" ON public.shipping_tax_rules;
DROP POLICY IF EXISTS "Superadmin can manage shipping_tax_rules"            ON public.shipping_tax_rules;
CREATE POLICY "Superadmin can manage shipping_tax_rules"
ON public.shipping_tax_rules FOR ALL
TO authenticated
USING      (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- shipping_zones
DROP POLICY IF EXISTS "Admins can manage shipping zones"     ON public.shipping_zones;
DROP POLICY IF EXISTS "Superadmin can manage shipping zones" ON public.shipping_zones;
CREATE POLICY "Superadmin can manage shipping zones"
ON public.shipping_zones FOR ALL
TO authenticated
USING      (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- wechat_qrcodes
DROP POLICY IF EXISTS "Admins can manage qrcodes"     ON public.wechat_qrcodes;
DROP POLICY IF EXISTS "Superadmin can manage qrcodes" ON public.wechat_qrcodes;
CREATE POLICY "Superadmin can manage qrcodes"
ON public.wechat_qrcodes FOR ALL
TO authenticated
USING      (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));


-- ═════════════════════════════════════════════════════════════════════════
-- CATÉGORIE 3 — DROP + CREATE recomposées (4 policies)
-- ═════════════════════════════════════════════════════════════════════════
-- Union multi-rôles, retirer la branche 'admin' sans toucher aux autres.

-- exchange_rates : SELECT, nom préservé
-- team OR backoffice OR admin OR superadmin  →  team OR backoffice OR superadmin
DROP POLICY IF EXISTS "Authenticated roles can view exchange rates" ON public.exchange_rates;
CREATE POLICY "Authenticated roles can view exchange rates"
ON public.exchange_rates FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'team'::app_role)
  OR has_role(auth.uid(), 'backoffice'::app_role)
  OR has_role(auth.uid(), 'superadmin'::app_role)
);

-- photo_daily_counter : 3 policies renommées "and admins" → "and superadmin"
-- team OR admin OR superadmin  →  team OR superadmin

-- INSERT (with_check only)
DROP POLICY IF EXISTS "Team and admins can insert counter"     ON public.photo_daily_counter;
DROP POLICY IF EXISTS "Team and superadmin can insert counter" ON public.photo_daily_counter;
CREATE POLICY "Team and superadmin can insert counter"
ON public.photo_daily_counter FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'team'::app_role)
  OR has_role(auth.uid(), 'superadmin'::app_role)
);

-- SELECT (using only)
DROP POLICY IF EXISTS "Team and admins can select counter"     ON public.photo_daily_counter;
DROP POLICY IF EXISTS "Team and superadmin can select counter" ON public.photo_daily_counter;
CREATE POLICY "Team and superadmin can select counter"
ON public.photo_daily_counter FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'team'::app_role)
  OR has_role(auth.uid(), 'superadmin'::app_role)
);

-- UPDATE (using only — iso-comportemental avec l'original)
DROP POLICY IF EXISTS "Team and admins can update counter"     ON public.photo_daily_counter;
DROP POLICY IF EXISTS "Team and superadmin can update counter" ON public.photo_daily_counter;
CREATE POLICY "Team and superadmin can update counter"
ON public.photo_daily_counter FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'team'::app_role)
  OR has_role(auth.uid(), 'superadmin'::app_role)
);


-- ═════════════════════════════════════════════════════════════════════════
-- CATÉGORIE 4 — storage.objects (4 policies) ← risque d'ownership
-- ═════════════════════════════════════════════════════════════════════════
-- Cf. header du fichier : si le push échoue ici, c'est un souci
-- supabase_storage_admin ownership — appliquer via dashboard dans ce cas.
-- Les catégories 1-3 sont déjà appliquées à ce stade donc aucun rollback
-- forcé côté RLS public.

-- product-images DELETE
DROP POLICY IF EXISTS "Staff can delete from product-images" ON storage.objects;
CREATE POLICY "Staff can delete from product-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['backoffice'::app_role, 'superadmin'::app_role])
  )
);

-- product-images UPDATE
DROP POLICY IF EXISTS "Staff can update product-images" ON storage.objects;
CREATE POLICY "Staff can update product-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['backoffice'::app_role, 'superadmin'::app_role])
  )
)
WITH CHECK (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['backoffice'::app_role, 'superadmin'::app_role])
  )
);

-- product-images INSERT (upload)
DROP POLICY IF EXISTS "Staff can upload to product-images" ON storage.objects;
CREATE POLICY "Staff can upload to product-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['backoffice'::app_role, 'superadmin'::app_role])
  )
);

-- wechat-qrcodes INSERT (upload)
-- team OR backoffice OR admin OR superadmin  →  team OR backoffice OR superadmin
DROP POLICY IF EXISTS "Team+ can upload to wechat-qrcodes" ON storage.objects;
CREATE POLICY "Team+ can upload to wechat-qrcodes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'wechat-qrcodes'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['team'::app_role, 'backoffice'::app_role, 'superadmin'::app_role])
  )
);
