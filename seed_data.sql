INSERT INTO products (name, description, price_xaf, brand, specs, images, stock_status)
VALUES 
(
  'Logitech MX Master 3S', 
  'The ultimate performance mouse, remastered for even more precision and comfort.', 
  65000, 
  'Logitech', 
  '{"DPI": "8000", "Sensor": "Darkfield", "Connectivity": "Bluetooth, Logi Bolt"}', 
  '{"https://images.unsplash.com/photo-1625773453127-b5236f42f6bd"}', 
  'in_stock'
),
(
  'Keychron K2 V2', 
  'A versatile wireless mechanical keyboard with Gateron switches.', 
  55000, 
  'Keychron', 
  '{"Switches": "Gateron Brown", "Backlight": "RGB", "Layout": "75%"}', 
  '{"https://images.unsplash.com/photo-1595225405013-98993547f35b"}', 
  'in_stock'
),
(
  'Anker 735 Charger (65W, 3 Ports, GaN)', 
  'Power 3 devices at once with this compact GaNPrime charger. Features 2 USB-C ports, 1 USB-A port, ActiveShield 2.0, PowerIQ 4.0, and travel-friendly design.', 
  35000, 
  'Anker', 
  '{"Wattage": "65W Max", "Ports": "2x USB-C, 1x USB-A", "Tech": "GaNPrime", "PowerIQ": "4.0", "Safety": "ActiveShield 2.0", "Input": "100V - 240V", "Weight": "132g", "Dimensions": "38.26 x 29.12 x 66.10 mm"}', 
  '{"https://images.unsplash.com/photo-1619139304037-41a690740994"}', 
  'in_stock'
);

UPDATE products
SET
  name = 'Anker 735 Charger (65W, 3 Ports, GaN)',
  name_fr = 'Anker 735 Chargeur (65W, 3 ports, GaN)',
  name_en = 'Anker 735 Charger (65W, 3 Ports, GaN)',
  description = 'Power 3 devices at once with this compact GaNPrime charger. Features 2 USB-C ports, 1 USB-A port, ActiveShield 2.0, PowerIQ 4.0, and travel-friendly design.',
  description_fr = 'Chargeur GaNPrime compact pour alimenter 3 appareils en même temps. Dispose de 2 ports USB-C, 1 port USB-A, ActiveShield 2.0, PowerIQ 4.0 et d’un format pratique pour les déplacements.',
  description_en = 'Power 3 devices at once with this compact GaNPrime charger. Features 2 USB-C ports, 1 USB-A port, ActiveShield 2.0, PowerIQ 4.0, and travel-friendly design.',
  specs = '{"Wattage": "65W Max", "Ports": "2x USB-C, 1x USB-A", "Tech": "GaNPrime", "PowerIQ": "4.0", "Safety": "ActiveShield 2.0", "Input": "100V - 240V", "Weight": "132g", "Dimensions": "38 x 29 x 66 mm"}',
  stock_status = 'out_of_stock',
  condition = 'new',
  category = 'cable',
  stock_qty = 0,
  low_stock_threshold = 3,
  warranty_info = '24 months / 24 months',
  tags = ARRAY['anker', 'charger', 'ganprime', '65w', 'usb-c']
WHERE name ILIKE 'Anker 735 Charger%'
   OR name ILIKE '%A2668%';
