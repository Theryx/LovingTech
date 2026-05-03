-- Migration: Add product detail page fields
-- Created: 2026-05-03

-- Add key_specs array for highlighting important specifications (max 4)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS key_specs TEXT[] DEFAULT '{}';

-- Add box_contents array for "What's in the Box" section (English)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS box_contents TEXT[] DEFAULT '{}';

-- Add box_contents_fr array for "What's in the Box" section (French)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS box_contents_fr TEXT[] DEFAULT '{}';

-- Add comment to document the fields
COMMENT ON COLUMN products.key_specs IS 'Array of spec keys to highlight on product page (max 4)';
COMMENT ON COLUMN products.box_contents IS 'Array of items included in the box (English)';
COMMENT ON COLUMN products.box_contents_fr IS 'Array of items included in the box (French)';
