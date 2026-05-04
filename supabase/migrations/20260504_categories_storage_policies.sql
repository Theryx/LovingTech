-- Storage bucket policies for categories
-- Run this in Supabase SQL Editor if the bucket already exists.
-- Note: the bucket must be created first via Supabase Dashboard > Storage or API.

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read from categories" ON storage.objects;
CREATE POLICY "Allow public read from categories"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'categories');

-- Allow public insert (upload)
DROP POLICY IF EXISTS "Allow public upload to categories" ON storage.objects;
CREATE POLICY "Allow public upload to categories"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'categories');

-- Allow public update (for upsert/replace)
DROP POLICY IF EXISTS "Allow public update on categories" ON storage.objects;
CREATE POLICY "Allow public update on categories"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'categories')
  WITH CHECK (bucket_id = 'categories');
