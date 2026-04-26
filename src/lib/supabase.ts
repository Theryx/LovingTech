import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ProductCondition = 'new' | 'refurbished' | 'second_hand';
export type ProductCategory = 'keyboard' | 'mouse' | 'cable' | 'speaker' | 'solar_lamp';

export type VariantOption = {
  name: string;
  stock_qty: number;
  price_delta: number;
};

export type Variant = {
  label: string;
  options: VariantOption[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price_xaf: number;
  brand: string;
  specs: Record<string, string>;
  images: string[];
  stock_status: 'in_stock' | 'out_of_stock' | 'pre_order';
  featured?: boolean;
  created_at?: string;
  // Sprint 2 fields
  condition?: ProductCondition;
  category?: ProductCategory;
  name_fr?: string;
  name_en?: string;
  description_fr?: string;
  description_en?: string;
  stock_qty?: number;
  low_stock_threshold?: number;
  compare_at_price?: number;
  warranty_info?: string;
  variants?: Variant[];
  tags?: string[];
};

export type Lead = {
  id?: string;
  product_id: string;
  whatsapp_number: string;
  address: string;
  status?: 'pending' | 'contacted' | 'completed';
  created_at?: string;
};

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  async create(product: Omit<Product, 'created_at'>): Promise<Product> {
    const { updated_at, ...validProduct } = product as any;
    
    // Validate UUID or generate a new one (local products have non-UUID IDs like '1')
    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const id = isUUID(validProduct.id) ? validProduct.id : crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...validProduct, id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { updated_at, ...validUpdates } = updates as any;
    
    const { data, error } = await supabase
      .from('products')
      .update(validUpdates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      return data;
    }

    const existingProduct = await this.getById(id);
    if (!existingProduct) {
      throw new Error(`Product "${id}" was not found, or the update was not permitted.`);
    }

    return existingProduct;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
