import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/api-auth'

const SQL = `
-- Drop old constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- Remap old categories to new ones
UPDATE products SET category = 'keyboards' WHERE category = 'keyboard';
UPDATE products SET category = 'mice' WHERE category = 'mouse';
UPDATE products SET category = 'charging-power' WHERE category = 'cable';
UPDATE products SET category = 'audio' WHERE category = 'speaker';
UPDATE products SET category = 'accessories' WHERE category IN ('solar_lamp', 'others');

-- Add new constraint
ALTER TABLE products ADD CONSTRAINT products_category_check CHECK (category IN ('keyboards', 'mice', 'audio', 'charging-power', 'gaming', 'accessories'));
`.trim()

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    sql: SQL,
    instructions:
      'Copy the SQL above and run it in your Supabase project dashboard → SQL Editor → New Query → Paste → Run. This will drop the old constraint, remap all categories, and add the new constraint in one step.',
  })
}
