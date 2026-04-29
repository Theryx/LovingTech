import { describe, it, expect } from 'vitest'
import { z } from 'zod'

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
})
