import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/api-auth'

const SQL = `
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check CHECK (category IN ('keyboards', 'mice', 'audio', 'charging-power', 'gaming', 'accessories'));
`.trim()

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    sql: SQL,
    instructions:
      'Run this SQL in your Supabase project dashboard → SQL Editor → New Query.',
  })
}
