import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockValidProduct } from '../../test/helpers'

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

import { GET, POST } from '@/app/api/products/route'
import { isAdmin } from '@/lib/api-auth'
import { supabase } from '@/lib/supabase/client'
import { supabaseServer } from '@/lib/supabase/server'

function makeRequest(body: Record<string, unknown>, method: string = 'POST') {
  return new Request('http://localhost:3000/api/products', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any
}

function makeGetRequest(cookies: Record<string, string> = {}) {
  const req = new Request('http://localhost:3000/api/products', { method: 'GET' })
  const cookieStore = new Map(Object.entries(cookies))
  Object.defineProperty(req, 'cookies', {
    value: {
      get: (name: string) =>
        cookieStore.get(name) ? { name, value: cookieStore.get(name)! } : undefined,
    },
  })
  return req
}

describe('GET /api/products', () => {
  it('returns all products (public)', async () => {
    const mockProducts = [
      { id: '1', name: 'Product A', price_xaf: 10000 },
      { id: '2', name: 'Product B', price_xaf: 20000 },
    ]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockProducts,
          error: null,
        }),
      }),
    } as any)

    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(2)
  })

  it('returns 500 on database error', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }),
    } as any)

    const res = await GET()
    expect(res.status).toBe(500)
  })
})

describe('POST /api/products', () => {
  beforeEach(() => {
    vi.mocked(isAdmin).mockResolvedValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a product when admin and returns 201', async () => {
    vi.mocked(supabaseServer.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'new-uuid', ...mockValidProduct },
            error: null,
          }),
        }),
      }),
    } as any)

    const req = makeRequest(mockValidProduct)
    const res = await POST(req)

    expect(res.status).toBe(201)
  })

  it('returns 401 for non-admin user', async () => {
    vi.mocked(isAdmin).mockResolvedValue(false)

    const req = makeRequest(mockValidProduct)
    const res = await POST(req)

    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid product data (missing name)', async () => {
    const invalidData = { price_xaf: 10000 }
    const req = makeRequest(invalidData)
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('returns 400 for negative price', async () => {
    const data = { ...mockValidProduct, price_xaf: -500 }
    const req = makeRequest(data)
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('defaults optional fields correctly', async () => {
    vi.mocked(supabaseServer.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'uuid', name: 'Test', price_xaf: 10000 },
            error: null,
          }),
        }),
      }),
    } as any)

    const minimalData = { name: 'Test Product', price_xaf: 10000 }
    const req = makeRequest(minimalData)
    const res = await POST(req)

    expect(res.status).toBe(201)
  })
})
