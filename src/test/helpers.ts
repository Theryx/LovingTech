import { vi } from 'vitest'
import { NextRequest } from 'next/server'

export function createMockRequest(
  body?: Record<string, unknown>,
  cookies: Record<string, string> = {},
  method: string = 'POST',
  url: string = 'http://localhost:3000/api/test'
) {
  const headers = new Headers()
  Object.entries(cookies).forEach(([k, v]) => {
    headers.set('cookie', `${k}=${v}`)
  })

  return new NextRequest(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function createMockNextRequest(
  url: string = 'http://localhost:3000',
  cookies: Record<string, string> = {}
) {
  const req = new NextRequest(url)

  const cookieStore = new Map(Object.entries(cookies))
  // eslint-disable-next-line
  vi.spyOn(req.cookies, 'get' as any).mockImplementation((name: any) => {
    const value = cookieStore.get(name)
    return value ? { name, value } : undefined
  })
  vi.spyOn(req.cookies, 'delete' as any).mockImplementation(() => true as any)

  return req
}

export const mockValidOrder = {
  order_ref: 'LT-20260430-1234',
  product_name: 'Logitech MX Keys',
  quantity: 1,
  unit_price: 45000,
  total_price: 47000,
  customer_name: 'Jean Dupont',
  customer_phone: '+237655123456',
  city: 'Douala',
  quartier: 'Bonapriso',
  delivery_fee: 2000,
}

export const mockValidProduct = {
  name: 'Logitech MX Keys',
  price_xaf: 45000,
  brand: 'Logitech',
  stock_status: 'in_stock' as const,
  category: 'keyboard' as const,
  condition: 'new' as const,
}

export const mockValidPromo = {
  code: 'SUMMER20',
  type: 'percent' as const,
  value: 20,
  min_order_amount: 10000,
}

export const mockValidDeliveryZone = {
  city_name_fr: 'Douala',
  city_name_en: 'Douala',
  delivery_fee: 2000,
  agencies: ['SOTRA', 'BUS EXPRESS'],
}

export const mockValidReview = {
  product_id: '550e8400-e29b-41d4-a716-446655440000',
  reviewer_name: 'Jean Dupont',
  rating: 5,
  comment: 'Excellent produit!',
  order_ref: 'LT-20260430-1234',
}

export const promoDbRow = (overrides: Record<string, any> = {}) => ({
  id: '1',
  code: 'SUMMER20',
  type: 'percent',
  value: 20,
  min_order_amount: 0,
  max_uses: null,
  uses_count: 0,
  expires_at: null,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
})
