import { supabase } from './client'

export { supabase }

export type Category = {
  slug: string
  label_en: string
  label_fr: string
  description_en: string
  description_fr: string
  image_url: string | null
  created_at?: string
  updated_at?: string
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('slug', { ascending: true })
    if (error) throw error
    return data || []
  },

  async getBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).single()
    if (error) return null
    return data
  },

  async upsert(slug: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .upsert({ slug, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    return data
  },
}

export type ProductCondition = 'new' | 'refurbished' | 'second_hand'
export type ProductCategory = 'keyboards' | 'mice' | 'audio' | 'charging-power' | 'gaming' | 'accessories'

export type VariantOption = {
  name: string
  stock_qty: number
  price_delta: number
}

export type Variant = {
  label: string
  options: VariantOption[]
}

export type Product = {
  id: string
  name: string
  description: string
  price_xaf: number
  brand: string
  specs: Record<string, string>
  images: string[]
  stock_status: 'in_stock' | 'out_of_stock' | 'pre_order'
  featured?: boolean
  created_at?: string
  published?: boolean
  // Sprint 2 fields
  condition?: ProductCondition
  category?: ProductCategory
  name_fr?: string
  name_en?: string
  description_fr?: string
  description_en?: string
  stock_qty?: number
  low_stock_threshold?: number
  compare_at_price?: number | null
  warranty_info?: string
  variants?: Variant[]
  tags?: string[]
  // Product detail page fields
  key_specs?: string[]
  box_contents?: string[]
  box_contents_fr?: string[]
}

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled'

export type Order = {
  id?: string
  order_ref: string
  product_id?: string
  product_name: string
  variant_chosen?: string
  quantity: number
  unit_price: number
  total_price: number
  customer_name: string
  customer_phone: string
  customer_email?: string
  city: string
  bus_agency?: string
  quartier: string
  address_details?: string
  delivery_fee: number
  promo_code?: string
  promo_discount?: number
  status?: OrderStatus
  admin_notes?: string
  status_history?: { status: OrderStatus; at: string; note?: string }[]
  created_at?: string
  updated_at?: string
}

export const orderService = {
  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async getByRef(orderRef: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_ref', orderRef)
      .single()
    if (error) return null
    return data
  },

  async getById(id: string): Promise<Order | null> {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
    if (error) return null
    return data
  },

  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const { data, error } = await supabase.from('orders').insert([order]).select().single()
    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: OrderStatus, note?: string): Promise<void> {
    const order = await this.getById(id)
    if (!order) throw new Error('Order not found')
    const history = order.status_history || []
    history.push({ status, at: new Date().toISOString(), note })
    const { error } = await supabase
      .from('orders')
      .update({ status, status_history: history, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async updateNotes(id: string, admin_notes: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ admin_notes, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async getTodayStats(): Promise<{ count: number; revenue: number; pending: number }> {
    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('orders')
      .select('total_price, status, created_at')
      .gte('created_at', `${today}T00:00:00Z`)
    if (error) return { count: 0, revenue: 0, pending: 0 }
    const count = data.length
    const revenue = data.reduce((s, o) => s + (o.total_price || 0), 0)
    const pending = data.filter(o => o.status === 'pending').length
    return { count, revenue, pending }
  },
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export type Review = {
  id?: string
  product_id: string
  order_ref: string
  rating: number
  comment?: string
  reviewer_name: string
  status?: ReviewStatus
  created_at?: string
}

export type PromoCode = {
  id?: string
  code: string
  type: 'percent' | 'fixed'
  value: number
  min_order_amount?: number
  max_uses?: number | null
  uses_count?: number
  expires_at?: string | null
  is_active?: boolean
  created_at?: string
}

export const reviewService = {
  async getByProduct(productId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    if (error) return []
    return data || []
  },

  async getAll(): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async create(review: Omit<Review, 'id' | 'status' | 'created_at'>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ ...review, status: 'pending' }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: ReviewStatus): Promise<void> {
    const { error } = await supabase.from('reviews').update({ status }).eq('id', id)
    if (error) throw error
  },

  async getPendingCount(): Promise<number> {
    const { count, error } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    if (error) return 0
    return count || 0
  },
}

export const promoService = {
  async getAll(): Promise<PromoCode[]> {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async create(promo: Omit<PromoCode, 'id' | 'uses_count' | 'created_at'>): Promise<PromoCode> {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert([{ ...promo, code: promo.code.toUpperCase(), uses_count: 0 }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<PromoCode>): Promise<void> {
    const { error } = await supabase.from('promo_codes').update(updates).eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('promo_codes').delete().eq('id', id)
    if (error) throw error
  },

  async incrementUses(code: string): Promise<void> {
    const { data } = await supabase
      .from('promo_codes')
      .select('uses_count')
      .ilike('code', code)
      .single()
    if (!data) return
    await supabase
      .from('promo_codes')
      .update({ uses_count: (data.uses_count || 0) + 1 })
      .ilike('code', code)
  },
}

export type DeliveryZone = {
  id?: string
  city_name_fr: string
  city_name_en: string
  delivery_fee: number
  estimated_days: string
  is_available?: boolean
  agencies?: string[]
  sort_order?: number
  created_at?: string
}

export type DeliverySettings = {
  id?: string
  free_delivery_threshold: number
  updated_at?: string
}

export const deliveryZoneService = {
  async getAll(): Promise<DeliveryZone[]> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('city_name_fr', { ascending: true })
    if (error) throw error
    return data || []
  },

  async create(zone: Omit<DeliveryZone, 'id' | 'created_at'>): Promise<DeliveryZone> {
    const { data, error } = await supabase.from('delivery_zones').insert([zone]).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<DeliveryZone>): Promise<void> {
    const { error } = await supabase.from('delivery_zones').update(updates).eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('delivery_zones').delete().eq('id', id)
    if (error) throw error
  },

  async getSettings(): Promise<DeliverySettings | null> {
    const { data } = await supabase.from('delivery_settings').select('*').single()
    return data || null
  },

  async updateSettings(threshold: number): Promise<void> {
    const settings = await this.getSettings()
    if (settings?.id) {
      await supabase
        .from('delivery_settings')
        .update({ free_delivery_threshold: threshold, updated_at: new Date().toISOString() })
        .eq('id', settings.id)
    } else {
      await supabase.from('delivery_settings').insert([{ free_delivery_threshold: threshold }])
    }
  },
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('published', true)
      .order('name')
    if (error) throw error
    return data || []
  },

  async getByName(name: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('name', name)
      .eq('published', true)
      .order('updated_at', { ascending: false })
      .limit(1)
    if (error || !data?.length) return null
    return data[0]
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single()
    if (error) return null
    return data
  },

  async create(product: Omit<Product, 'created_at'>): Promise<Product> {
    const { updated_at, ...validProduct } = product as any

    // Validate UUID or generate a new one (local products have non-UUID IDs like '1')
    const isUUID = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
    const id = isUUID(validProduct.id) ? validProduct.id : crypto.randomUUID()

    const { data, error } = await supabase
      .from('products')
      .insert([{ ...validProduct, id }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { updated_at, ...rest } = updates as any
    // Strip undefined so Supabase doesn't ignore them, but keep null to allow clearing optional fields
    const validUpdates = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined))

    const { data, error } = await supabase
      .from('products')
      .update(validUpdates)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw error

    if (!data) {
      throw new Error(
        `Update blocked: no rows modified for product "${id}". Check Supabase RLS policies.`
      )
    }

    return data
  },

  async delete(id: string): Promise<void> {
    // Check for associated records
    const [leads, reviews, orders] = await Promise.all([
      supabase.from('leads').select('id', { count: 'exact', head: true }).eq('product_id', id),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('product_id', id),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('product_id', id),
    ])

    const errors: string[] = []
    if (leads.count && leads.count > 0) errors.push(`${leads.count} lead(s)`)
    if (reviews.count && reviews.count > 0) errors.push(`${reviews.count} review(s)`)
    if (orders.count && orders.count > 0) errors.push(`${orders.count} order(s)`)

    if (errors.length > 0) {
      throw new Error(`Cannot delete product because it has associated ${errors.join(', ')}.`)
    }

    const { error, count } = await supabase.from('products').delete({ count: 'exact' }).eq('id', id)

    if (error) throw error

    // If no rows were deleted but no error occurred, it's likely RLS blocking it
    // Wait, with count: 'exact', we can check if it actually deleted anything.
    // However, if RLS blocks it, Supabase might still return success with count 0.
  },
}
