import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { supabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled']).optional(),
  admin_notes: z.string().optional(),
  note: z.string().optional(),
})

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(_request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseServer
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = updateOrderSchema.parse(body)

    const updates: Record<string, any> = {}

    if (parsed.admin_notes !== undefined) {
      updates.admin_notes = parsed.admin_notes
    }

    if (parsed.status) {
      updates.status = parsed.status

      const { data: order } = await supabaseServer
        .from('orders')
        .select('status_history')
        .eq('id', params.id)
        .single()

      const history = (order?.status_history || []) as any[]
      history.push({ status: parsed.status, at: new Date().toISOString(), note: parsed.note || '' })
      updates.status_history = history
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabaseServer
      .from('orders')
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
