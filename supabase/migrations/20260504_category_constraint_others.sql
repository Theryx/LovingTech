-- Drop and recreate the category check constraint to include 'others'
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check 
  CHECK (category = ANY (ARRAY['keyboard'::text, 'mouse'::text, 'cable'::text, 'speaker'::text, 'solar_lamp'::text, 'others'::text]));
