import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/api-auth';

const updatePromoSchema = z.object({
  code: z.string().min(1).optional(),
  type: z.enum(['percent', 'fixed']).optional(),
  value: z.number().int().min(1).optional(),
  min_order_amount: z.number().int().min(0).optional(),
  max_uses: z.number().int().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updatePromoSchema.parse(body);

    const updates: Record<string, any> = {};
    if (parsed.code !== undefined) updates.code = parsed.code.toUpperCase();
    if (parsed.type !== undefined) updates.type = parsed.type;
    if (parsed.value !== undefined) updates.value = parsed.value;
    if (parsed.min_order_amount !== undefined) updates.min_order_amount = parsed.min_order_amount;
    if (parsed.max_uses !== undefined) updates.max_uses = parsed.max_uses;
    if (parsed.expires_at !== undefined) updates.expires_at = parsed.expires_at;
    if (parsed.is_active !== undefined) updates.is_active = parsed.is_active;

    const { data, error } = await supabaseServer
      .from('promo_codes')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabaseServer
    .from('promo_codes')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
