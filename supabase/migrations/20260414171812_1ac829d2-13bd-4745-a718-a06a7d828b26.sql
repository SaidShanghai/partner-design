
CREATE TABLE public.exchange_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL UNIQUE,
  rate_cny_eur numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated roles can view exchange rates"
ON public.exchange_rates
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'team'::app_role)
  OR has_role(auth.uid(), 'backoffice'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Service role can insert exchange rates"
ON public.exchange_rates
FOR INSERT
TO service_role
WITH CHECK (true);
