-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_xaf NUMERIC NOT NULL,
  brand TEXT,
  specs JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  stock_status TEXT DEFAULT 'in_stock',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read products" ON products
FOR SELECT TO public USING (true);

-- Allow authenticated inserts/updates
CREATE POLICY "Allow authenticated manage products" ON products
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert existing products (only if table is empty)
INSERT INTO products (id, name, description, price_xaf, brand, specs, images, stock_status, featured)
SELECT 
  id::TEXT,
  name,
  description,
  price_xaf,
  brand,
  specs::JSONB,
  images,
  stock_status,
  featured
FROM (
  VALUES 
    ('1', 'Logitech MX Master 3S', 'Advanced wireless mouse with 8K DPI sensor, quiet clicks, and 70-day battery life.', 85802, 'Logitech', '{"sensor": "8,000 DPI", "battery": "70 days", "connectivity": "Bluetooth, USB Receiver"}'::JSONB, ARRAY['/images/logitech-mx-master-3s.png'], 'out_of_stock', true),
    ('2', 'Logitech MX Keys S', 'Smart illuminated wireless keyboard with perfect stroke keys and smart shortcuts.', 5950, 'Logitech', '{"keys": "Perfect Stroke", "battery": "10 days (backlight on)", "connectivity": "Bluetooth, USB Receiver"}'::JSONB, ARRAY['/images/logitech-mx-keys-s.png'], 'out_of_stock', true),
    ('3', 'Keychron K2 Pro', 'Wireless mechanical keyboard with QMK/VIA support and hot-swappable switches.', 32000, 'Keychron', '{"switches": "Hot-swappable Brown", "battery": "80 hours", "connectivity": "Bluetooth, USB-C"}'::JSONB, ARRAY['/images/keychron-k2-pro.png'], 'in_stock', true),
    ('4', 'Logitech G502 Hero', 'High-performance gaming mouse with 25,600 DPI sensor and 11 programmable buttons.', 46407, 'Logitech', '{"sensor": "25,600 DPI", "buttons": "11 programmable", "weight": "121g (adjustable)"}'::JSONB, ARRAY['/images/logitech-g502-hero.png'], 'in_stock', true),
    ('5', 'Logitech Pebble Mouse 2 M350s', 'Slim, quiet, and portable wireless mouse with customizable middle button.', 26710, 'Logitech', '{"sensor": "4000 DPI", "battery": "24 months", "connectivity": "Bluetooth, USB Receiver"}'::JSONB, ARRAY['/images/logitech-pebble-mouse-2.png'], 'in_stock', false),
    ('6', 'Anker PowerCore 20000', '20000mAh portable charger with PowerIQ and fast charging support.', 18000, 'Anker', '{"capacity": "20000mAh", "output": "20W USB-C", "weight": "345g"}'::JSONB, ARRAY['/images/placeholder.svg'], 'out_of_stock', false),
    ('7', 'Anker 737 Power Bank', '24000mAh high-capacity power bank with 140W total output.', 42000, 'Anker', '{"capacity": "24000mAh", "output": "140W total", "display": "Smart IPS"}'::JSONB, ARRAY['/images/anker-737.png'], 'out_of_stock', false),
    ('8', 'Keychron Q1 Pro', 'Premium mechanical keyboard with 2.4G wireless, QMK/VIA, and all-metal body.', 48000, 'Keychron', '{"switches": "Hot-swappable Red", "battery": "100 hours (wireless)", "connectivity": "2.4G, Bluetooth, USB-C"}'::JSONB, ARRAY['/images/keychron-q1-pro.png'], 'out_of_stock', false)
) AS data(id, name, description, price_xaf, brand, specs, images, stock_status, featured)
WHERE NOT EXISTS (SELECT 1 FROM products);
