import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { supabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'

const createZoneSchema = z.object({
  city_name_fr: z.string().min(1),
  city_name_en: z.string().min(1),
  delivery_fee: z.number().int().min(0),
  estimated_days: z.string().optional().default('2-3 jours / 2-3 days'),
  is_available: z.boolean().optional().default(true),
  agencies: z.array(z.string()).optional().default([]),
  sort_order: z.number().int().optional().default(0),
})

const updateZoneSchema = createZoneSchema.partial()

export async function GET(request: NextRequest) {
  const isAuthenticated = await isAdmin(request)

  const query = (isAuthenticated ? supabaseServer : supabase)
    .from('delivery_zones')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('city_name_fr', { ascending: true })

  if (!isAuthenticated) {
    query.eq('is_available', true)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createZoneSchema.parse(body)

    const { data, error } = await supabaseServer
      .from('delivery_zones')
      .insert([parsed])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
