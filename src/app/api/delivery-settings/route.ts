import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data } = await supabase
    .from('delivery_settings')
    .select('free_delivery_threshold')
    .single();
  return NextResponse.json(data || { free_delivery_threshold: 50000 });
}
