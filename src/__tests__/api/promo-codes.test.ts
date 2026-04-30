import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockValidPromo } from '../../test/helpers'

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

import { GET, POST } from '@/app/api/promo-codes/route'
import { isAdmin } from '@/lib/api-auth'
import { supabase } from '@/lib/supabase/client'
import { supabaseServer } from '@/lib/supabase/server'

function makeRequest(body: Record<string, unknown>, method: string = 'POST') {
  return new Request('http://localhost:3000/api/promo-codes', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any
}

function makeGetRequest(cookies: Record<string, string> = {}) {
  const req = new Request('http://localhost:3000/api/promo-codes', { method: 'GET' })
  const cookieStore = new Map(Object.entries(cookies))
  Object.defineProperty(req, 'cookies', {
    value: {
      get: (name: string) =>
        cookieStore.get(name) ? { name, value: cookieStore.get(name)! } : undefined,
    },
  })
  return req
}

describe('GET /api/promo-codes', () => {
  beforeEach(() => {
    vi.mocked(isAdmin).mockResolvedValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns all promo codes for admin', async () => {
    const mockPromos = [{ id: '1', code: 'SUMMER20', type: 'percent', value: 20, uses_count: 5 }]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockPromos,
          error: null,
        }),
      }),
    } as any)

    const req = makeGetRequest({ admin_auth: 'valid-token' })
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it('returns 401 for non-admin', async () => {
    vi.mocked(isAdmin).mockResolvedValue(false)

    const req = makeGetRequest()
    const res = await GET(req)
    expect(res.status).toBe(401)
  })
})

describe('POST /api/promo-codes', () => {
  beforeEach(() => {
    vi.mocked(isAdmin).mockResolvedValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a promo code with uppercase name and 0 uses_count', async () => {
    vi.mocked(supabaseServer.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: '1', ...mockValidPromo, code: 'SUMMER20', uses_count: 0 },
            error: null,
          }),
        }),
      }),
    } as any)

    const req = makeRequest({ ...mockValidPromo, code: 'summer20' })
    const res = await POST(req)

    expect(res.status).toBe(201)
  })

  it('returns 401 for non-admin user', async () => {
    vi.mocked(isAdmin).mockResolvedValue(false)

    const req = makeRequest(mockValidPromo)
    const res = await POST(req)

    expect(res.status).toBe(401)
  })

  it('returns 409 for duplicate promo code', async () => {
    vi.mocked(supabaseServer.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: '23505', message: 'duplicate key' },
          }),
        }),
      }),
    } as any)

    const req = makeRequest(mockValidPromo)
    const res = await POST(req)

    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toContain('already exists')
  })

  it('returns 400 for invalid data (missing code)', async () => {
    const req = makeRequest({ type: 'percent', value: 20 })
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid type', async () => {
    const req = makeRequest({ code: 'TEST', type: 'invalid', value: 20 })
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('returns 400 for zero value', async () => {
    const req = makeRequest({ code: 'TEST', type: 'fixed', value: 0 })
    const res = await POST(req)

    expect(res.status).toBe(400)
  })
})
