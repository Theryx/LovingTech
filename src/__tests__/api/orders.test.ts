import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockValidOrder } from '../../test/helpers'

vi.mock('@/lib/api-auth', () => ({
  isAdmin: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: {
    from: vi.fn(),
  },
}))

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({}),
    }),
  },
}))

import { GET, POST } from '@/app/api/orders/route'
import { isAdmin } from '@/lib/api-auth'
import { supabase } from '@/lib/supabase/client'
import { supabaseServer } from '@/lib/supabase/server'

function makeRequest(body: Record<string, unknown>, method: string = 'POST') {
  return new Request('http://localhost:3000/api/orders', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any
}

function makeGetRequest(cookies: Record<string, string> = {}) {
  const req = new Request('http://localhost:3000/api/orders', { method: 'GET' })
  const cookieStore = new Map(Object.entries(cookies))
  Object.defineProperty(req, 'cookies', {
    value: {
      get: (name: string) =>
        cookieStore.get(name) ? { name, value: cookieStore.get(name)! } : undefined,
    },
  })
  return req
}

describe('GET /api/orders', () => {
  beforeEach(() => {
    vi.mocked(isAdmin).mockResolvedValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns orders and stats for admin user', async () => {
    const mockOrders = [
      { id: '1', total_price: 50000, status: 'pending', created_at: '2026-04-30T10:00:00Z' },
    ]

    vi.mocked(supabaseServer.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockOrders,
          error: null,
        }),
      }),
    } as any)

    const req = makeGetRequest({ admin_auth: 'valid-token' })
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it('returns 401 for non-admin user', async () => {
    vi.mocked(isAdmin).mockResolvedValue(false)

    const req = makeGetRequest()
    const res = await GET(req)

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })
})

describe('POST /api/orders', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: '1', ...mockValidOrder },
            error: null,
          }),
        }),
      }),
    } as any)

    process.env.EMAIL_USER = ''
    process.env.EMAIL_APP_PASSWORD = ''
    process.env.EMAIL_NOTIFY = 'test@test.com'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates an order with valid data and returns 201', async () => {
    const req = makeRequest(mockValidOrder)
    const res = await POST(req)

    expect(res.status).toBe(201)
  })

  it('returns 400 for invalid data (missing required fields)', async () => {
    const invalidData = { product_name: 'Test' }
    const req = makeRequest(invalidData)
    const res = await POST(req)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Validation failed')
  })

  it('returns 400 for negative quantity', async () => {
    const data = { ...mockValidOrder, quantity: -1 }
    const req = makeRequest(data)
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('returns 400 for quantity exceeding max (99)', async () => {
    const data = { ...mockValidOrder, quantity: 100 }
    const req = makeRequest(data)
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid email', async () => {
    const data = { ...mockValidOrder, customer_email: 'not-an-email' }
    const req = makeRequest(data)
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('returns 400 for phone number too short', async () => {
    const data = { ...mockValidOrder, customer_phone: '123' }
    const req = makeRequest(data)
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('returns 500 when supabase insert fails', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      }),
    } as any)

    const req = makeRequest(mockValidOrder)
    const res = await POST(req)

    expect(res.status).toBe(500)
  })

  it('allows empty string for customer_email', async () => {
    const data = { ...mockValidOrder, customer_email: '' }
    const req = makeRequest(data)
    const res = await POST(req)

    expect(res.status).toBe(201)
  })

  it('accepts optional promo fields', async () => {
    const data = { ...mockValidOrder, promo_code: 'SUMMER20', promo_discount: 5000 }
    const req = makeRequest(data)
    const res = await POST(req)

    expect(res.status).toBe(201)
  })
})
