
CREATE OR REPLACE FUNCTION public.find_or_create_product(
  _name text,
  _price numeric,
  _image_url text DEFAULT NULL,
  _category text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  SELECT id INTO _id FROM products WHERE name = _name LIMIT 1;
  IF _id IS NOT NULL THEN
    RETURN _id;
  END IF;

  INSERT INTO products (name, price, image_url, category)
  VALUES (_name, _price, _image_url, _category)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;
