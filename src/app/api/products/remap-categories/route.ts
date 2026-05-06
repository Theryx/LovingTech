import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'

const REMAP: Record<string, string> = {
  keyboard: 'keyboards',
  mouse: 'mice',
  cable: 'charging-power',
  speaker: 'audio',
  solar_lamp: 'accessories',
  others: 'accessories',
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseServer()
    const updates: { slug: string; count: number }[] = []

    for (const [oldValue, newValue] of Object.entries(REMAP)) {
      // Count products with old category
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', oldValue)

      if (count && count > 0) {
        const { error } = await supabase
          .from('products')
          .update({ category: newValue, updated_at: new Date().toISOString() })
          .eq('category', oldValue)

        if (error) {
          return NextResponse.json(
            { error: `Failed to update ${oldValue} → ${newValue}: ${error.message}`, code: error.code, hint: error.hint, details: error.details },
            { status: 500 }
          )
        }

        updates.push({ slug: `${oldValue} → ${newValue}`, count })
      }
    }

    return NextResponse.json({
      success: true,
      updated: updates.length ? updates : 'All products already have new categories',
      totalUpdated: updates.reduce((sum, u) => sum + u.count, 0),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
