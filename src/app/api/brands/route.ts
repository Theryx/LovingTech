import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'

const createBrandSchema = z.object({
  name: z.string().min(1),
  logo_url: z.string().nullable().optional(),
  sort_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
})

const updateBrandSchema = createBrandSchema.partial()

export async function GET() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createBrandSchema.parse(body)

    const { data, error } = await getSupabaseServer()
      .from('brands')
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
