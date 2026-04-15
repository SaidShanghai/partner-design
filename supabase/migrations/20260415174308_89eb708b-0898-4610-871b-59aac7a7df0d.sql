
-- Table des zones de livraison avec tarifs
CREATE TABLE public.shipping_zones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_name text NOT NULL,
  countries text[] NOT NULL DEFAULT '{}',
  base_fee_rmb numeric NOT NULL DEFAULT 150,
  extra_per_500g_rmb numeric NOT NULL DEFAULT 45,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les zones (nécessaire pour le calcul côté panier)
CREATE POLICY "Anyone can view shipping zones"
ON public.shipping_zones FOR SELECT
TO public
USING (true);

-- Seuls les admins/superadmins peuvent gérer les zones
CREATE POLICY "Admins can manage shipping zones"
ON public.shipping_zones FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE TRIGGER update_shipping_zones_updated_at
BEFORE UPDATE ON public.shipping_zones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
