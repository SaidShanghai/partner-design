-- Table
CREATE TABLE public.shipping_tax_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL UNIQUE,
  country_name text NOT NULL,
  zone text NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  threshold_value numeric NOT NULL,
  threshold_currency text NOT NULL DEFAULT 'EUR',
  scheme_name text,
  scheme_enabled boolean NOT NULL DEFAULT false,
  vat_rate numeric NOT NULL DEFAULT 0,
  customs_fixed_fee numeric NOT NULL DEFAULT 0,
  duty_rate numeric NOT NULL DEFAULT 0,
  display_note text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.shipping_tax_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shipping_tax_rules_public_read"
ON public.shipping_tax_rules
FOR SELECT
TO anon, authenticated
USING (active = true);

-- Index
CREATE INDEX idx_shipping_tax_rules_country_active
ON public.shipping_tax_rules (country_code)
WHERE active = true;

-- Trigger updated_at
CREATE TRIGGER update_shipping_tax_rules_updated_at
BEFORE UPDATE ON public.shipping_tax_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed (16 lignes)
INSERT INTO public.shipping_tax_rules
(country_code, country_name, zone, currency, threshold_value, threshold_currency, scheme_name, scheme_enabled, vat_rate, customs_fixed_fee, duty_rate, display_note) VALUES
('FR','France','EU','EUR',150,'EUR','IOSS',false,0.20,15,0.08,'TVA française 20%. Sous 150€ de marchandise avec IOSS : rien à payer à la livraison. Au-dessus : TVA et frais de dédouanement à payer au livreur.'),
('DE','Allemagne','EU','EUR',150,'EUR','IOSS',false,0.19,15,0.08,'TVA allemande 19%. Même règle IOSS sous 150€.'),
('BE','Belgique','EU','EUR',150,'EUR','IOSS',false,0.21,15,0.08,'TVA belge 21%. Même règle IOSS sous 150€.'),
('ES','Espagne','EU','EUR',150,'EUR','IOSS',false,0.21,15,0.08,'TVA espagnole 21%. Même règle IOSS sous 150€.'),
('IT','Italie','EU','EUR',150,'EUR','IOSS',false,0.22,15,0.08,'TVA italienne 22%. Même règle IOSS sous 150€.'),
('NL','Pays-Bas','EU','EUR',150,'EUR','IOSS',false,0.21,15,0.08,'TVA néerlandaise 21%. Même règle IOSS sous 150€.'),
('LU','Luxembourg','EU','EUR',150,'EUR','IOSS',false,0.17,15,0.08,'TVA luxembourgeoise 17%. Même règle IOSS sous 150€.'),
('PT','Portugal','EU','EUR',150,'EUR','IOSS',false,0.23,15,0.08,'TVA portugaise 23%. Même règle IOSS sous 150€.'),
('AT','Autriche','EU','EUR',150,'EUR','IOSS',false,0.20,15,0.08,'TVA autrichienne 20%. Même règle IOSS sous 150€.'),
('IE','Irlande','EU','EUR',150,'EUR','IOSS',false,0.23,15,0.08,'TVA irlandaise 23%. Même règle IOSS sous 150€.'),
('GB','Royaume-Uni','UK','GBP',135,'GBP','UK_VAT',false,0.20,12,0.08,'TVA UK 20%. Sous £135 de marchandise : inclus à l''achat. Au-dessus : TVA + frais à la livraison.'),
('NO','Norvège','NO','NOK',3000,'NOK','VOEC',false,0.25,150,0.08,'TVA norvégienne 25%. Sous NOK 3000 avec VOEC : inclus à l''achat. Au-dessus : TVA + frais à la livraison.'),
('CH','Suisse','CH','CHF',0,'CHF',NULL,false,0.081,20,0.08,'TVA suisse 8.1% applicable dès CHF 65. Frais de dédouanement par DHL à la livraison, environ CHF 20.'),
('US','États-Unis','US','USD',800,'USD',NULL,true,0,0,0,'Franchise de minimis $800. Pas de TVA ni douane pour la grande majorité des commandes.'),
('CA','Canada','CA','CAD',20,'CAD',NULL,false,0.05,15,0.08,'TPS 5% plus taxes provinciales. Seuil de minimis bas ($20 CAD). Frais de dédouanement probables à la livraison.'),
('MA','Maroc','ROW','MAD',0,'MAD',NULL,false,0.20,30,0.08,'TVA marocaine 20%. Dédouanement local obligatoire. Nous contacter pour les commandes vers le Maroc.');