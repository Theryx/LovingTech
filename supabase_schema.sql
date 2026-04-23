-- Products Table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_xaf INTEGER NOT NULL,
  brand TEXT NOT NULL,
  specs JSONB DEFAULT '{}'::jsonb,
  images TEXT[] DEFAULT '{}',
  stock_status TEXT DEFAULT 'in_stock',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE handle_updated_at();

-- Leads Table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  whatsapp_number TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policies for products (Public Read)
CREATE POLICY "Allow public read on products" ON products
  FOR SELECT USING (true);

-- Policies for leads (Public Insert)
CREATE POLICY "Allow public insert on leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Policies for leads (Service Role Read)
-- (Default service role has access, but we can add specific ones if needed)
