import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'

const updateZoneSchema = z.object({
  city_name_fr: z.string().min(1).optional(),
  city_name_en: z.string().min(1).optional(),
  delivery_fee: z.number().int().min(0).optional(),
  estimated_days: z.string().optional(),
  is_available: z.boolean().optional(),
  agencies: z.array(z.string()).optional(),
  sort_order: z.number().int().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = updateZoneSchema.parse(body)

    const updates = Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== undefined))

    const { data, error } = await getSupabaseServer()
      .from('delivery_zones')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await getSupabaseServer().from('delivery_zones').delete().eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
