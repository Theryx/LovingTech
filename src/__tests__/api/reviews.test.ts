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

import { GET } from '@/app/api/reviews/route'
import { isAdmin } from '@/lib/api-auth'
import { supabase } from '@/lib/supabase/client'
import { supabaseServer } from '@/lib/supabase/server'

function makeGetRequest(cookies: Record<string, string> = {}) {
  const req = new Request('http://localhost:3000/api/reviews', { method: 'GET' })
  const cookieStore = new Map(Object.entries(cookies))
  Object.defineProperty(req, 'cookies', {
    value: {
      get: (name: string) =>
        cookieStore.get(name) ? { name, value: cookieStore.get(name)! } : undefined,
    },
  })
  return req
}

describe('GET /api/reviews', () => {
  beforeEach(() => {
    vi.mocked(isAdmin).mockResolvedValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns all reviews for admin user', async () => {
    const mockReviews = [
      { id: '1', reviewer_name: 'Jean', rating: 5, comment: 'Great!', status: 'approved' },
      { id: '2', reviewer_name: 'Marie', rating: 4, comment: 'Good', status: 'pending' },
    ]

    vi.mocked(supabaseServer.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockReviews,
          error: null,
        }),
      }),
    } as any)

    const req = makeGetRequest({ admin_auth: 'valid-token' })
    const res = await GET(req)
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json).toHaveLength(2)
  })

  it('returns 401 for non-admin user', async () => {
    vi.mocked(isAdmin).mockResolvedValue(false)

    const req = makeGetRequest()
    const res = await GET(req)

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 500 on database error', async () => {
    vi.mocked(supabaseServer.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }),
    } as any)

    const req = makeGetRequest({ admin_auth: 'valid-token' })
    const res = await GET(req)
    expect(res.status).toBe(500)
  })
})
