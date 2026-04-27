-- Update existing Anker 735 product instead of inserting a duplicate
UPDATE products
SET
  name = 'Anker 735 Charger (65W, 3 Ports, GaN)',
  name_fr = 'Anker 735 Chargeur (65W, 3 ports, GaN)',
  name_en = 'Anker 735 Charger (65W, 3 Ports, GaN)',
  description = 'Power 3 devices at once with this compact GaNPrime charger. Features 2 USB-C ports, 1 USB-A port, ActiveShield 2.0, PowerIQ 4.0, and travel-friendly design.',
  description_fr = 'Chargeur GaNPrime compact pour alimenter 3 appareils en même temps. Dispose de 2 ports USB-C, 1 port USB-A, ActiveShield 2.0, PowerIQ 4.0 et d’un format pratique pour les déplacements.',
  description_en = 'Power 3 devices at once with this compact GaNPrime charger. Features 2 USB-C ports, 1 USB-A port, ActiveShield 2.0, PowerIQ 4.0, and travel-friendly design.',
  price_xaf = 35000,
  brand = 'Anker',
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
