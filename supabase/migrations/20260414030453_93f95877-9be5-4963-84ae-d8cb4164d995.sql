-- Update the signup trigger to also handle backoffice user
CREATE OR REPLACE FUNCTION public.assign_superadmin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email = 's.elkharrouai@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  IF NEW.email = 'backoffice@asialinkltd.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'backoffice')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;