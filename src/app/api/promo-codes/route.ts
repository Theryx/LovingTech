import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/api-auth'

const createPromoSchema = z.object({
  code: z.string().min(1),
  type: z.enum(['percent', 'fixed']),
  value: z.number().int().min(1),
  min_order_amount: z.number().int().min(0).optional(),
  max_uses: z.number().int().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true),
})

const updatePromoSchema = createPromoSchema.partial()

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createPromoSchema.parse(body)

    const { data, error } = await supabase
      .from('promo_codes')
      .insert([{ ...parsed, code: parsed.code.toUpperCase(), uses_count: 0 }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A promo code with this name already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
