import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

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

import { GET, PUT } from '@/app/api/delivery-settings/route'
import { isAdmin } from '@/lib/api-auth'
import { supabase } from '@/lib/supabase/client'
import { supabaseServer } from '@/lib/supabase/server'

function makeRequest(body: Record<string, unknown>, method: string = 'PUT') {
  return new Request('http://localhost:3000/api/delivery-settings', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any
}

function makeGetRequest() {
  return new Request('http://localhost:3000/api/delivery-settings', { method: 'GET' })
}

function makePutRequest(body: Record<string, unknown>, cookies: Record<string, string> = {}) {
  const req = new Request('http://localhost:3000/api/delivery-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const cookieStore = new Map(Object.entries(cookies))
  Object.defineProperty(req, 'cookies', {
    value: {
      get: (name: string) =>
        cookieStore.get(name) ? { name, value: cookieStore.get(name)! } : undefined,
    },
  })
  return req
}

describe('GET /api/delivery-settings', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns free_delivery_threshold from database', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { free_delivery_threshold: 50000 },
          error: null,
        }),
      }),
    } as any)

    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.free_delivery_threshold).toBe(50000)
  })

  it('returns default 50000 when no data in database', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      }),
    } as any)

    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.free_delivery_threshold).toBe(50000)
  })
})

describe('PUT /api/delivery-settings', () => {
  beforeEach(() => {
    vi.mocked(isAdmin).mockResolvedValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('updates existing settings when admin', async () => {
    vi.mocked(supabaseServer.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'settings-id' },
          error: null,
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as any)

    const req = makePutRequest({ free_delivery_threshold: 60000 }, { admin_auth: 'valid-token' })
    const res = await PUT(req)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.free_delivery_threshold).toBe(60000)
  })

  it('returns 401 for non-admin user', async () => {
    vi.mocked(isAdmin).mockResolvedValue(false)

    const req = makePutRequest({ free_delivery_threshold: 60000 })
    const res = await PUT(req)

    expect(res.status).toBe(401)
  })

  it('returns 400 for negative threshold', async () => {
    const req = makePutRequest({ free_delivery_threshold: -1 }, { admin_auth: 'valid-token' })
    const res = await PUT(req)

    expect(res.status).toBe(400)
  })

  it('creates settings when no existing record', async () => {
    vi.mocked(supabaseServer.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
      insert: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as any)

    const req = makePutRequest({ free_delivery_threshold: 75000 }, { admin_auth: 'valid-token' })
    const res = await PUT(req)

    expect(res.status).toBe(200)
  })
})
