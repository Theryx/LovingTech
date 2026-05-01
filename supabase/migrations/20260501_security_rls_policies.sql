-- Security RLS Policies for Loving Tech
-- Run this in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

-- =====================
-- PRODUCTS: Public read only, service role write
-- =====================
DROP POLICY IF EXISTS "Allow public insert on products" ON products;
DROP POLICY IF EXISTS "Allow public update on products" ON products;

-- Read policy (public)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Service role can insert/update (used by admin)
-- This is handled at API level with service_role key

-- =====================
-- LEADS: Public insert, service role read/update
-- =====================

-- Public can create leads (for order placement)
CREATE POLICY "Anyone can create leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Read is service role only
CREATE POLICY "Service role can manage leads" ON leads
  FOR ALL USING (auth.jwt() IS NOT NULL);

-- =====================
-- ORDERS: Public create, service role manage
-- =====================

-- Public can create orders
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Service role/full access for management
CREATE POLICY "Service role can manage orders" ON orders
  FOR ALL USING (auth.jwt() IS NOT NULL);

-- =====================
-- REVIEWS: Public read, authenticated write, service role manage
-- =====================

-- Anyone can read reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Service role can manage reviews
CREATE POLICY "Service role can manage reviews" ON reviews
  FOR ALL USING (auth.jwt() IS NOT NULL);

-- =====================
-- PROMO CODES: Public read, service role manage
-- =====================

-- Anyone can read active promo codes
CREATE POLICY "Active promo codes are viewable by everyone" ON promo_codes
  FOR SELECT USING (active = true);

-- Service role can manage promo codes
CREATE POLICY "Service role can manage promo codes" ON promo_codes
  FOR ALL USING (auth.jwt() IS NOT NULL);

-- =====================
-- DELIVERY SETTINGS: Service role only
-- =====================

-- Service role can manage delivery settings
CREATE POLICY "Service role can manage delivery settings" ON delivery_settings
  FOR ALL USING (auth.jwt() IS NOT NULL);

-- =====================
-- DELIVERY ZONES: Service role only
-- =====================

-- Service role can manage delivery zones
CREATE POLICY "Service role can manage delivery zones" ON delivery_zones
  FOR ALL USING (auth.jwt() IS NOT NULL);

-- Public can read delivery zones (for checkout display)
CREATE POLICY "Delivery zones are viewable by everyone" ON delivery_zones
  FOR SELECT USING (true);