import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { supabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  price_xaf: z.number().int().min(0),
  brand: z.string().optional().default(''),
  specs: z.record(z.string(), z.string()).optional().default({}),
  images: z.array(z.string()).optional().default([]),
  stock_status: z.enum(['in_stock', 'out_of_stock', 'pre_order']).optional().default('in_stock'),
  featured: z.boolean().optional().default(false),
  condition: z.enum(['new', 'refurbished', 'second_hand']).optional(),
  category: z.enum(['keyboard', 'mouse', 'cable', 'speaker', 'solar_lamp']).optional(),
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

const updateProductSchema = createProductSchema.partial()

export async function GET() {
  const { data, error } = await supabase
    .from('products')
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
    const parsed = createProductSchema.parse(body)

    const isUUID = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
    const id = crypto.randomUUID()

    const { data, error } = await supabaseServer
      .from('products')
      .insert([{ ...parsed, id }])
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
