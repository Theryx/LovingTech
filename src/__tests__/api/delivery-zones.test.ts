import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockValidDeliveryZone } from '../../test/helpers'

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

import { GET, POST } from '@/app/api/delivery-zones/route'
import { isAdmin } from '@/lib/api-auth'
import { supabase } from '@/lib/supabase/client'
import { supabaseServer } from '@/lib/supabase/server'

function makeRequest(body: Record<string, unknown>, method: string = 'POST') {
  return new Request('http://localhost:3000/api/delivery-zones', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any
}

function makeGetRequest(cookies: Record<string, string> = {}) {
  const req = new Request('http://localhost:3000/api/delivery-zones', { method: 'GET' })
  const cookieStore = new Map(Object.entries(cookies))
  Object.defineProperty(req, 'cookies', {
    value: {
      get: (name: string) =>
        cookieStore.get(name) ? { name, value: cookieStore.get(name)! } : undefined,
    },
  })
  return req
}

describe('GET /api/delivery-zones', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns all zones for admin user', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true)

    const mockZones = [
      { id: '1', city_name_fr: 'Douala', is_available: true },
      { id: '2', city_name_fr: 'Yaoundé', is_available: false },
    ]

    const eqFn = vi.fn().mockResolvedValue({
      data: mockZones,
      error: null,
    })

    const orderFn2 = vi.fn().mockReturnValue({ eq: eqFn })
    const orderFn1 = vi.fn().mockReturnValue({ order: orderFn2 })
    const selectFn = vi.fn().mockReturnValue({ order: orderFn1 })

    vi.mocked(supabaseServer.from).mockReturnValue({ select: selectFn } as any)

    const req = makeGetRequest({ admin_auth: 'valid-token' })
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it('filters only available zones for non-admin', async () => {
    vi.mocked(isAdmin).mockResolvedValue(false)

    const availableZones = [{ id: '1', city_name_fr: 'Douala', is_available: true }]

    const eqFn = vi.fn().mockResolvedValue({
      data: availableZones,
      error: null,
    })

    const orderFn2 = vi.fn().mockReturnValue({ eq: eqFn })
    const orderFn1 = vi.fn().mockReturnValue({ order: orderFn2 })
    const selectFn = vi.fn().mockReturnValue({ order: orderFn1 })

    vi.mocked(supabase.from).mockReturnValue({ select: selectFn } as any)

    const req = makeGetRequest()
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(eqFn).toHaveBeenCalledWith('is_available', true)
  })
})

describe('POST /api/delivery-zones', () => {
  beforeEach(() => {
    vi.mocked(isAdmin).mockResolvedValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a delivery zone when admin', async () => {
    vi.mocked(supabaseServer.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: '1', ...mockValidDeliveryZone },
            error: null,
          }),
        }),
      }),
    } as any)

    const req = makeRequest(mockValidDeliveryZone)
    const res = await POST(req)

    expect(res.status).toBe(201)
  })

  it('returns 401 for non-admin user', async () => {
    vi.mocked(isAdmin).mockResolvedValue(false)

    const req = makeRequest(mockValidDeliveryZone)
    const res = await POST(req)

    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid data (missing city_name_fr)', async () => {
    const req = makeRequest({ delivery_fee: 2000 })
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('returns 400 for negative delivery_fee', async () => {
    const data = { ...mockValidDeliveryZone, delivery_fee: -100 }
    const req = makeRequest(data)
    const res = await POST(req)

    expect(res.status).toBe(400)
  })
})
