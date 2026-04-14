
CREATE TABLE public.photo_daily_counter (
  date date NOT NULL PRIMARY KEY DEFAULT CURRENT_DATE,
  count integer NOT NULL DEFAULT 0
);

ALTER TABLE public.photo_daily_counter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team and admins can select counter"
  ON public.photo_daily_counter FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'team'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "Team and admins can insert counter"
  ON public.photo_daily_counter FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'team'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "Team and admins can update counter"
  ON public.photo_daily_counter FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'team'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'superadmin'::app_role)
  );

-- Function to atomically get next photo number for today
CREATE OR REPLACE FUNCTION public.next_photo_number()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count integer;
BEGIN
  INSERT INTO photo_daily_counter (date, count)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET count = photo_daily_counter.count + 1
  RETURNING count INTO _count;
  RETURN _count;
END;
$$;
