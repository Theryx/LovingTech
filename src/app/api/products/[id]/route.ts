import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price_xaf: z.number().int().min(0).optional(),
  brand: z.string().optional(),
  specs: z.record(z.string(), z.string()).optional(),
  images: z.array(z.string()).optional(),
  stock_status: z.enum(['in_stock', 'out_of_stock', 'pre_order']).optional(),
  featured: z.boolean().optional(),
  condition: z.enum(['new', 'refurbished', 'second_hand']).nullable().optional(),
  category: z.enum(['keyboard', 'mouse', 'cable', 'speaker', 'solar_lamp', 'others']).nullable().optional(),
  name_fr: z.string().nullable().optional(),
  name_en: z.string().nullable().optional(),
  description_fr: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  stock_qty: z.number().int().min(0).nullable().optional(),
  low_stock_threshold: z.number().int().min(0).nullable().optional(),
  compare_at_price: z.number().int().nullable().optional(),
  warranty_info: z.string().nullable().optional(),
  variants: z
    .array(
      z.object({
        label: z.string(),
        options: z.array(
          z.object({
            name: z.string(),
            stock_qty: z.number().int().min(0),
            price_delta: z.number().int(),
          })
        ),
      })
    )
    .optional(),
  tags: z.array(z.string()).optional(),
  key_specs: z.array(z.string()).optional(),
  box_contents: z.array(z.string()).optional(),
  box_contents_fr: z.array(z.string()).optional(),
})

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabase.from('products').select('*').eq('id', params.id).single()

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = updateProductSchema.parse(body)

    const updates = Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== undefined))

    const { data, error } = await getSupabaseServer()
      .from('products')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('Could not find')) {
        delete updates.box_contents
        delete updates.box_contents_fr
        delete updates.key_specs
        const { data: retryData, error: retryError } = await getSupabaseServer()
          .from('products')
          .update(updates)
          .eq('id', params.id)
          .select()
          .single()
        if (retryError) return NextResponse.json({ error: retryError.message }, { status: 500 })
        return NextResponse.json(retryData)
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
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

  const { error } = await getSupabaseServer().from('products').delete().eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
