import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'
import { ALLOWED_STATUS_TRANSITIONS } from '@/lib/order-constants'

const patchSchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'])
    .optional(),
  admin_notes: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = params.id
  if (!id || id.length < 10) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
  }

  const { data, error } = await getSupabaseServer()
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    const message = status === 404 ? 'Not found' : error.message
    return NextResponse.json({ error: message }, { status })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = params.id

  try {
    const body = await request.json()
    const parsed = patchSchema.parse(body)

    if (!parsed.status && parsed.admin_notes === undefined) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    // Fetch current order state
    const { data: order, error: fetchError } = await getSupabaseServer()
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const currentStatus = (order.status || 'pending') as typeof parsed.status extends string ? string : string

    // Validate status transition
    if (parsed.status && parsed.status !== currentStatus) {
      const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus as keyof typeof ALLOWED_STATUS_TRANSITIONS]
      if (!allowed || !allowed.includes(parsed.status as any)) {
        return NextResponse.json(
          { error: `Cannot transition from '${currentStatus}' to '${parsed.status}'` },
          { status: 422 }
        )
      }
    }

    // Build update payload
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (parsed.admin_notes !== undefined) {
      updates.admin_notes = parsed.admin_notes
    }

    // Append to status history if status is changing
    if (parsed.status && parsed.status !== currentStatus) {
      const history = order.status_history || []
      const note = parsed.admin_notes ? `Note: ${parsed.admin_notes}` : undefined
      history.push({
        status: parsed.status,
        at: new Date().toISOString(),
        note,
      })
      updates.status = parsed.status
      updates.status_history = history
    }

    const { data, error } = await getSupabaseServer()
      .from('orders')
      .update(updates)
      .eq('id', id)
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
