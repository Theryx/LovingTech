import { describe, it, expect } from 'vitest'
import { z } from 'zod'

function baseValidOrder() {
  return {
    order_ref: 'ORD-123',
    product_name: 'Keyboard',
    quantity: 1,
    unit_price: 15000,
    total_price: 16500,
    customer_name: 'Jean Dupont',
    customer_phone: '237655123456',
    city: 'Douala',
    quartier: 'Bonapriso',
    delivery_fee: 1500,
  }
}

describe('Order validation schema', () => {
  const createOrderSchema = z.object({
    order_ref: z.string().min(1),
    product_id: z.string().uuid().optional(),
    product_name: z.string().min(1),
    variant_chosen: z.string().optional(),
    quantity: z.number().int().min(1).max(99),
    unit_price: z.number().int().min(0),
    total_price: z.number().int().min(0),
    customer_name: z.string().min(2).max(200),
    customer_phone: z.string().min(8).max(20),
    customer_email: z.string().email().optional().or(z.literal('')),
    city: z.string().min(1).max(100),
    bus_agency: z.string().optional().nullable(),
    quartier: z.string().min(2).max(200),
    address_details: z.string().optional().nullable(),
    delivery_fee: z.number().int().min(0),
    promo_code: z.string().optional().nullable(),
    promo_discount: z.number().int().min(0).optional().nullable(),
    status: z
      .enum(['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'])
      .optional()
      .default('pending'),
    status_history: z
      .array(
        z.object({
          status: z.string(),
          at: z.string(),
          note: z.string().optional(),
        })
      )
      .optional(),
  })

  it('accepts a valid order', () => {
    const valid = {
      order_ref: 'ORD-123',
      product_name: 'Keyboard',
      quantity: 1,
      unit_price: 15000,
      total_price: 16500,
      customer_name: 'Jean Dupont',
      customer_phone: '237655123456',
      city: 'Douala',
      quartier: 'Bonapriso',
      delivery_fee: 1500,
    }
    expect(() => createOrderSchema.parse(valid)).not.toThrow()
  })

  it('rejects invalid phone number (too short)', () => {
    const invalid = {
      order_ref: 'ORD-123',
      product_name: 'Keyboard',
      quantity: 1,
      unit_price: 15000,
      total_price: 16500,
      customer_name: 'Jean',
      customer_phone: '123',
      city: 'Douala',
      quartier: 'Bonapriso',
      delivery_fee: 1500,
    }
    expect(() => createOrderSchema.parse(invalid)).toThrow()
  })

  it('rejects invalid email', () => {
    const invalid = {
      order_ref: 'ORD-123',
      product_name: 'Keyboard',
      quantity: 1,
      unit_price: 15000,
      total_price: 16500,
      customer_name: 'Jean',
      customer_phone: '237655123456',
      city: 'Douala',
      quartier: 'Bonapriso',
      delivery_fee: 1500,
      customer_email: 'not-an-email',
    }
    expect(() => createOrderSchema.parse(invalid)).toThrow()
  })

  it('rejects invalid status', () => {
    const invalid = {
      order_ref: 'ORD-123',
      product_name: 'Keyboard',
      quantity: 1,
      unit_price: 15000,
      total_price: 16500,
      customer_name: 'Jean',
      customer_phone: '237655123456',
      city: 'Douala',
      quartier: 'Bonapriso',
      delivery_fee: 1500,
      status: 'invalid_status' as any,
    }
    expect(() => createOrderSchema.parse(invalid)).toThrow()
  })

  it('accepts optional promo_code and bus_agency', () => {
    const withOptional = {
      order_ref: 'ORD-123',
      product_name: 'Keyboard',
      quantity: 2,
      unit_price: 7500,
      total_price: 16500,
      customer_name: 'Marie',
      customer_phone: '237655123456',
      city: 'Douala',
      bus_agency: 'SOTRA',
      quartier: 'Akwa',
      delivery_fee: 1500,
      promo_code: 'SUMMER20',
      promo_discount: 1500,
    }
    expect(() => createOrderSchema.parse(withOptional)).not.toThrow()
  })

  it('rejects quantity of 0', () => {
    const invalid = {
      ...baseValidOrder(),
      quantity: 0,
    }
    expect(() => createOrderSchema.parse(invalid)).toThrow()
  })

  it('rejects quantity exceeding 99', () => {
    const invalid = {
      ...baseValidOrder(),
      quantity: 100,
    }
    expect(() => createOrderSchema.parse(invalid)).toThrow()
  })

  it('rejects negative unit_price', () => {
    const invalid = {
      ...baseValidOrder(),
      unit_price: -500,
    }
    expect(() => createOrderSchema.parse(invalid)).toThrow()
  })

  it('rejects negative total_price', () => {
    const invalid = {
      ...baseValidOrder(),
      total_price: -1,
    }
    expect(() => createOrderSchema.parse(invalid)).toThrow()
  })

  it('rejects customer_name shorter than 2 characters', () => {
    const invalid = {
      ...baseValidOrder(),
      customer_name: 'A',
    }
    expect(() => createOrderSchema.parse(invalid)).toThrow()
  })

  it('accepts customer_name exactly 2 characters', () => {
    const valid = {
      ...baseValidOrder(),
      customer_name: 'AB',
    }
    expect(() => createOrderSchema.parse(valid)).not.toThrow()
  })

  it('accepts empty string for customer_email', () => {
    const valid = {
      ...baseValidOrder(),
      customer_email: '',
    }
    expect(() => createOrderSchema.parse(valid)).not.toThrow()
  })

  it('accepts valid email for customer_email', () => {
    const valid = {
      ...baseValidOrder(),
      customer_email: 'jean@example.com',
    }
    expect(() => createOrderSchema.parse(valid)).not.toThrow()
  })

  it('accepts nullable bus_agency and address_details', () => {
    const valid = {
      ...baseValidOrder(),
      bus_agency: null,
      address_details: null,
    }
    expect(() => createOrderSchema.parse(valid)).not.toThrow()
  })

  it('accepts all valid status values', () => {
    const statuses = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled']
    for (const status of statuses) {
      const valid = {
        ...baseValidOrder(),
        status,
      }
      expect(() => createOrderSchema.parse(valid)).not.toThrow()
    }
  })

  it('accepts valid status_history array', () => {
    const valid = {
      ...baseValidOrder(),
      status_history: [{ status: 'pending', at: new Date().toISOString(), note: 'Created' }],
    }
    expect(() => createOrderSchema.parse(valid)).not.toThrow()
  })

  it('accepts valid UUID for product_id', () => {
    const valid = {
      ...baseValidOrder(),
      product_id: '550e8400-e29b-41d4-a716-446655440000',
    }
    expect(() => createOrderSchema.parse(valid)).not.toThrow()
  })

  it('rejects non-UUID for product_id', () => {
    const invalid = {
      ...baseValidOrder(),
      product_id: 'not-a-uuid',
    }
    expect(() => createOrderSchema.parse(invalid)).toThrow()
  })

  it('defaults status to pending when omitted', () => {
    const parsed = createOrderSchema.parse(baseValidOrder())
    expect(parsed.status).toBe('pending')
  })
})

describe('Promo code validation schema', () => {
  const createPromoSchema = z.object({
    code: z.string().min(1),
    type: z.enum(['percent', 'fixed']),
    value: z.number().int().min(1),
    min_order_amount: z.number().int().min(0).optional(),
    max_uses: z.number().int().nullable().optional(),
    expires_at: z.string().nullable().optional(),
    is_active: z.boolean().optional().default(true),
  })

  it('accepts valid promo code', () => {
    const valid = {
      code: 'SUMMER20',
      type: 'percent',
      value: 20,
      min_order_amount: 10000,
    }
    expect(() => createPromoSchema.parse(valid)).not.toThrow()
  })

  it('rejects invalid type', () => {
    const invalid = {
      code: 'SUMMER20',
      type: 'invalid' as any,
      value: 20,
    }
    expect(() => createPromoSchema.parse(invalid)).toThrow()
  })

  it('rejects zero or negative value', () => {
    const invalid = {
      code: 'SUMMER20',
      type: 'fixed',
      value: 0,
    }
    expect(() => createPromoSchema.parse(invalid)).toThrow()
  })

  it('rejects negative value', () => {
    const invalid = {
      code: 'SUMMER20',
      type: 'fixed',
      value: -5,
    }
    expect(() => createPromoSchema.parse(invalid)).toThrow()
  })

  it('accepts promo with all optional fields', () => {
    const valid = {
      code: 'MEGA50',
      type: 'percent',
      value: 50,
      min_order_amount: 25000,
      max_uses: 100,
      expires_at: '2030-12-31T23:59:59Z',
      is_active: true,
    }
    expect(() => createPromoSchema.parse(valid)).not.toThrow()
  })

  it('accepts promo with null max_uses (unlimited)', () => {
    const valid = {
      code: 'FOREVER',
      type: 'fixed',
      value: 1000,
      max_uses: null,
    }
    expect(() => createPromoSchema.parse(valid)).not.toThrow()
  })

  it('accepts promo with null expires_at (no expiry)', () => {
    const valid = {
      code: 'NOEXPIRY',
      type: 'fixed',
      value: 500,
      expires_at: null,
    }
    expect(() => createPromoSchema.parse(valid)).not.toThrow()
  })

  it('defaults is_active to true when omitted', () => {
    const parsed = createPromoSchema.parse({
      code: 'TEST',
      type: 'fixed',
      value: 100,
    })
    expect(parsed.is_active).toBe(true)
  })

  it('accepts promo with only required fields', () => {
    const valid = {
      code: 'MINIMAL',
      type: 'percent',
      value: 10,
    }
    expect(() => createPromoSchema.parse(valid)).not.toThrow()
  })

  it('rejects empty code', () => {
    const invalid = {
      code: '',
      type: 'percent',
      value: 10,
    }
    expect(() => createPromoSchema.parse(invalid)).toThrow()
  })
})

describe('Delivery zone validation schema', () => {
  const createZoneSchema = z.object({
    city_name_fr: z.string().min(1),
    city_name_en: z.string().min(1),
    delivery_fee: z.number().int().min(0),
    estimated_days: z.string().optional().default('2-3 jours / 2-3 days'),
    is_available: z.boolean().optional().default(true),
    agencies: z.array(z.string()).optional().default([]),
    sort_order: z.number().int().optional().default(0),
  })

  it('accepts a valid delivery zone', () => {
    const valid = {
      city_name_fr: 'Douala',
      city_name_en: 'Douala',
      delivery_fee: 2000,
    }
    expect(() => createZoneSchema.parse(valid)).not.toThrow()
  })

  it('rejects negative delivery_fee', () => {
    const invalid = {
      city_name_fr: 'Douala',
      city_name_en: 'Douala',
      delivery_fee: -500,
    }
    expect(() => createZoneSchema.parse(invalid)).toThrow()
  })

  it('rejects empty city_name_fr', () => {
    const invalid = {
      city_name_fr: '',
      city_name_en: 'Douala',
      delivery_fee: 2000,
    }
    expect(() => createZoneSchema.parse(invalid)).toThrow()
  })

  it('defaults is_available to true', () => {
    const parsed = createZoneSchema.parse({
      city_name_fr: 'Yaoundé',
      city_name_en: 'Yaounde',
      delivery_fee: 3500,
    })
    expect(parsed.is_available).toBe(true)
  })

  it('defaults agencies to empty array', () => {
    const parsed = createZoneSchema.parse({
      city_name_fr: 'Bafoussam',
      city_name_en: 'Bafoussam',
      delivery_fee: 3000,
    })
    expect(parsed.agencies).toEqual([])
  })
})

describe('Product validation schema', () => {
  const createProductSchema = z.object({
    name: z.string().min(1),
    price_xaf: z.number().int().min(0),
    brand: z.string().optional().default(''),
    description: z.string().optional().default(''),
    stock_status: z.enum(['in_stock', 'out_of_stock', 'pre_order']).optional().default('in_stock'),
    featured: z.boolean().optional().default(false),
    condition: z.enum(['new', 'refurbished', 'second_hand']).optional(),
    category: z.enum(['keyboard', 'mouse', 'cable', 'speaker', 'solar_lamp', 'others']).optional(),
  })

  it('accepts minimal valid product', () => {
    const valid = { name: 'Test Product', price_xaf: 10000 }
    expect(() => createProductSchema.parse(valid)).not.toThrow()
  })

  it('rejects product without name', () => {
    const invalid = { price_xaf: 10000 }
    expect(() => createProductSchema.parse(invalid)).toThrow()
  })

  it('rejects negative price', () => {
    const invalid = { name: 'Test', price_xaf: -1 }
    expect(() => createProductSchema.parse(invalid)).toThrow()
  })

  it('rejects invalid stock_status', () => {
    const invalid = { name: 'Test', price_xaf: 1000, stock_status: 'invalid' }
    expect(() => createProductSchema.parse(invalid)).toThrow()
  })

  it('rejects invalid condition', () => {
    const invalid = { name: 'Test', price_xaf: 1000, condition: 'used' }
    expect(() => createProductSchema.parse(invalid)).toThrow()
  })

  it('accepts all valid conditions', () => {
    for (const condition of ['new', 'refurbished', 'second_hand'] as const) {
      const valid = { name: 'Test', price_xaf: 1000, condition }
      expect(() => createProductSchema.parse(valid)).not.toThrow()
    }
  })

  it('accepts all valid categories', () => {
    for (const category of ['keyboard', 'mouse', 'cable', 'speaker', 'solar_lamp', 'others'] as const) {
      const valid = { name: 'Test', price_xaf: 1000, category }
      expect(() => createProductSchema.parse(valid)).not.toThrow()
    }
  })

  it('defaults stock_status to in_stock', () => {
    const parsed = createProductSchema.parse({ name: 'Test', price_xaf: 1000 })
    expect(parsed.stock_status).toBe('in_stock')
  })
})
