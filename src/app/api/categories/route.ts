import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'

export async function GET() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('slug', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { slug, label_en, label_fr } = body

    if (!slug || !label_en || !label_fr) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, label_en, label_fr' },
        { status: 400 }
      )
    }

    const { data, error } = await getSupabaseServer()
      .from('categories')
      .insert({
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        label_en,
        label_fr,
        image_url: null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
