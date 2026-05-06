import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'

const updateSchema = z.object({
  image_url: z.string().nullable().optional(),
  label_en: z.string().optional(),
  label_fr: z.string().optional(),
  description_en: z.string().optional(),
  description_fr: z.string().optional(),
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = params

  const { error } = await getSupabaseServer()
    .from('categories')
    .delete()
    .eq('slug', slug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = params

  try {
    const body = await request.json()
    const parsed = updateSchema.parse(body)

    const validUpdates = Object.fromEntries(
      Object.entries({ ...parsed, updated_at: new Date().toISOString() }).filter(([, v]) => v !== undefined)
    )

    const { data, error } = await getSupabaseServer()
      .from('categories')
      .update(validUpdates)
      .eq('slug', slug)
      .select()
      .single()

    if (error) {
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
