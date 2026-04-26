import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('delivery_zones')
    .select('id, city_name_fr, city_name_en, delivery_fee, estimated_days, agencies, sort_order')
    .eq('is_available', true)
    .order('sort_order', { ascending: true })
    .order('city_name_fr', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
