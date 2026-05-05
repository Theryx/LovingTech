import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, product_name } = body

    if (!product_id) {
      return NextResponse.json({ error: 'product_id required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('out_of_stock_interactions')
      .insert([{
        product_id,
        product_name: product_name || '',
        clicked_at: new Date().toISOString(),
      }])

    if (error) {
      console.error('Failed to record OOS interaction:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const dateFrom = searchParams.get('from')
  const dateTo = searchParams.get('to')
  const sortDir = searchParams.get('sort') || 'desc'

  let query = getSupabaseServer()
    .from('out_of_stock_interactions')
    .select('*')

  if (dateFrom) {
    query = query.gte('clicked_at', dateFrom)
  }
  if (dateTo) {
    query = query.lte('clicked_at', dateTo + 'T23:59:59Z')
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Aggregate by product_id
  const aggregated = new Map<string, { product_id: string; product_name: string; total_clicks: number; last_clicked: string }>()

  for (const row of data || []) {
    const existing = aggregated.get(row.product_id)
    if (existing) {
      existing.total_clicks++
      if (row.clicked_at > existing.last_clicked) {
        existing.last_clicked = row.clicked_at
      }
    } else {
      aggregated.set(row.product_id, {
        product_id: row.product_id,
        product_name: row.product_name,
        total_clicks: 1,
        last_clicked: row.clicked_at,
      })
    }
  }

  const results = Array.from(aggregated.values()).sort((a, b) => {
    return sortDir === 'asc'
      ? a.total_clicks - b.total_clicks
      : b.total_clicks - a.total_clicks
  })

  return NextResponse.json(results)
}
