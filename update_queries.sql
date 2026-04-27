-- Update existing Anker 735 product instead of inserting a duplicate
UPDATE products
SET
  name = 'Anker 735 Charger (65W, 3 Ports, GaN)',
  description = 'Power 3 devices at once with this compact GaNPrime charger. Features 2 USB-C ports, 1 USB-A port, ActiveShield 2.0, PowerIQ 4.0, and travel-friendly design.',
  price_xaf = 35000,
  brand = 'Anker',
  specs = '{"Wattage": "65W Max", "Ports": "2x USB-C, 1x USB-A", "Tech": "GaNPrime", "PowerIQ": "4.0", "Safety": "ActiveShield 2.0", "Input": "100V - 240V", "Weight": "132g", "Dimensions": "38.26 x 29.12 x 66.10 mm"}',
  stock_status = 'in_stock'
WHERE name ILIKE 'Anker 735 Charger%'
   OR name ILIKE '%A2668%';
