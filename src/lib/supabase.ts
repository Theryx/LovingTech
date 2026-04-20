import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  description: string;
  price_xaf: number;
  brand: string;
  specs: Record<string, string>;
  images: string[];
  stock_status: 'in_stock' | 'out_of_stock' | 'pre_order';
};

export type Lead = {
  id?: string;
  product_id: string;
  whatsapp_number: string;
  address: string;
  status?: 'pending' | 'contacted' | 'completed';
  created_at?: string;
};
