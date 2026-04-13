
-- Create categories table
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Superadmin can insert categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can update categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can delete categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

-- Seed top-level categories
INSERT INTO public.categories (name, position) VALUES
  ('Nouveau', 0),
  ('Mercerie', 1),
  ('Tissu ameublement', 2),
  ('Tissu habillement', 3),
  ('Tissus enfants', 4),
  ('Imprimés', 5),
  ('Sacs', 6),
  ('Patrons de couture', 7),
  ('Tricot et crochet', 8);

-- Trigger: auto-assign superadmin role to s.elkharrouai@gmail.com on sign-up
CREATE OR REPLACE FUNCTION public.assign_superadmin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email = 's.elkharrouai@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_superadmin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_superadmin_on_signup();
