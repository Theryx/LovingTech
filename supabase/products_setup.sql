-- =====================================================
-- PRODUCTS TABLE SETUP FOR LOVING TECH SHOP
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Drop existing tables (leads first due to foreign key)
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- 2. Create products table with TEXT id
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price_xaf NUMERIC NOT NULL DEFAULT 0,
  brand TEXT DEFAULT '',
  specs JSONB DEFAULT '{}',
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  stock_status TEXT DEFAULT 'in_stock',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Disable RLS for public access (change this for production)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 3. Insert sample products
INSERT INTO products (id, name, description, price_xaf, brand, specs, images, stock_status, featured)
VALUES 
  (
    '1', 
    'Logitech MX Master 3S', 
    'Advanced wireless mouse with 8K DPI sensor, quiet clicks, and 70-day battery life.', 
    85802, 
    'Logitech', 
    '{"sensor": "8,000 DPI", "battery": "70 days", "connectivity": "Bluetooth, USB Receiver"}'::JSONB,
    ARRAY['/images/logitech-mx-master-3s.png'],
    'out_of_stock',
    true
  ),
  (
    '2', 
    'Logitech MX Keys S', 
    'Smart illuminated wireless keyboard with perfect stroke keys and smart shortcuts.', 
    5950, 
    'Logitech', 
    '{"keys": "Perfect Stroke", "battery": "10 days (backlight on)", "connectivity": "Bluetooth, USB Receiver"}'::JSONB,
    ARRAY['/images/logitech-mx-keys-s.png'],
    'out_of_stock',
    true
  ),
  (
    '3', 
    'Keychron K2 Pro', 
    'Wireless mechanical keyboard with QMK/VIA support and hot-swappable switches.', 
    32000, 
    'Keychron', 
    '{"switches": "Hot-swappable Brown", "battery": "80 hours", "connectivity": "Bluetooth, USB-C"}'::JSONB,
    ARRAY['/images/keychron-k2-pro.png'],
    'in_stock',
    true
  ),
  (
    '4', 
    'Logitech G502 Hero', 
    'High-performance gaming mouse with 25,600 DPI sensor and 11 programmable buttons.', 
    46407, 
    'Logitech', 
    '{"sensor": "25,600 DPI", "buttons": "11 programmable", "weight": "121g (adjustable)"}'::JSONB,
    ARRAY['/images/logitech-g502-hero.png'],
    'in_stock',
    false
  ),
  (
    '5', 
    'Logitech Pebble Mouse 2 M350s', 
    'Slim, quiet, and portable wireless mouse with customizable middle button.', 
    26710, 
    'Logitech', 
    '{"sensor": "4000 DPI", "battery": "24 months", "connectivity": "Bluetooth, USB Receiver"}'::JSONB,
    ARRAY['/images/logitech-pebble-mouse-2.png'],
    'in_stock',
    false
  ),
  (
    '6', 
    'Anker PowerCore 20000', 
    '20000mAh portable charger with PowerIQ and fast charging support.', 
    18000, 
    'Anker', 
    '{"capacity": "20000mAh", "output": "20W USB-C", "weight": "345g"}'::JSONB,
    ARRAY['/images/placeholder.svg'],
    'out_of_stock',
    false
  ),
  (
    '7', 
    'Anker 737 Power Bank', 
    '24000mAh high-capacity power bank with 140W total output.', 
    42000, 
    'Anker', 
    '{"capacity": "24000mAh", "output": "140W total", "display": "Smart IPS"}'::JSONB,
    ARRAY['/images/anker-737.png'],
    'out_of_stock',
    false
  ),
  (
    '8', 
    'Keychron Q1 Pro', 
    'Premium mechanical keyboard with 2.4G wireless, QMK/VIA, and all-metal body.', 
    48000, 
    'Keychron', 
    '{"switches": "Hot-swappable Red", "battery": "100 hours (wireless)", "connectivity": "2.4G, Bluetooth, USB-C"}'::JSONB,
    ARRAY['/images/keychron-q1-pro.png'],
    'out_of_stock',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Verify setup
SELECT 'Products table created successfully!' as status;
SELECT COUNT(*) as total_products FROM products;