import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/api-auth'

const updateSettingsSchema = z.object({
  free_delivery_threshold: z.number().int().min(0),
})

export async function GET() {
  const { data } = await supabase
    .from('delivery_settings')
    .select('free_delivery_threshold')
    .single()
  return NextResponse.json(data || { free_delivery_threshold: 50000 })
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { free_delivery_threshold } = updateSettingsSchema.parse(body)

    const { data: existing } = await supabase.from('delivery_settings').select('id').single()

    if (existing?.id) {
      const { error } = await supabase
        .from('delivery_settings')
        .update({ free_delivery_threshold, updated_at: new Date().toISOString() })
        .eq('id', existing.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await supabase
        .from('delivery_settings')
        .insert([{ free_delivery_threshold }])

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ free_delivery_threshold })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
