-- Create categories table for managing category images and labels
CREATE TABLE IF NOT EXISTS public.categories (
  slug text PRIMARY KEY,
  label_en text NOT NULL,
  label_fr text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access to categories"
  ON public.categories
  FOR SELECT
  USING (true);

-- Service role write access (for admin API)
CREATE POLICY "Allow service role full access to categories"
  ON public.categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default categories
INSERT INTO public.categories (slug, label_en, label_fr) VALUES
  ('keyboard', 'Keyboards', 'Claviers'),
  ('mouse', 'Mice', 'Souris'),
  ('cable', 'Cables', 'Câbles'),
  ('speaker', 'Speakers', 'Enceintes'),
  ('solar_lamp', 'Solar Lamps', 'Lampes Solaires')
ON CONFLICT (slug) DO NOTHING;
