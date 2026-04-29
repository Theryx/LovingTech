import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_auth')?.value;
  if (!token) return false;
  return verifyAuthToken(token);
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('delivery_zones')
    .select('id, city_name_fr, city_name_en, delivery_fee, estimated_days, agencies, sort_order')
    .eq('is_available', true)
    .order('sort_order', { ascending: true })
    .order('city_name_fr', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
