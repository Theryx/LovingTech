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

  const { data } = await supabase
    .from('delivery_settings')
    .select('free_delivery_threshold')
    .single();
  return NextResponse.json(data || { free_delivery_threshold: 50000 });
}
