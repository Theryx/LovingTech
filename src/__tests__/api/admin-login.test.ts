import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/auth', () => ({
  createAuthToken: vi.fn().mockResolvedValue('mock-session.1234567890.mocksig'),
}))

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { POST, DELETE } from '@/app/api/admin-login/route'
import { createAuthToken } from '@/lib/auth'

function makeRequest(body: Record<string, unknown>, method: string = 'POST') {
  return new Request('http://localhost:3000/api/admin-login', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any
}

describe('POST /api/admin-login', () => {
  const originalPassword = process.env.ADMIN_PASSWORD

  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'correct-password'
  })

  afterEach(() => {
    process.env.ADMIN_PASSWORD = originalPassword
    vi.restoreAllMocks()
  })

  it('returns { ok: true } and sets admin_auth cookie for correct password', async () => {
    vi.mocked(createAuthToken).mockResolvedValue('mock-token')

    const req = makeRequest({ password: 'correct-password' })
    const res = await POST(req)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
  })

  it('returns 401 for wrong password', async () => {
    const req = makeRequest({ password: 'wrong-password' })
    const res = await POST(req)

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Invalid password')
  })

  it('returns 401 when ADMIN_PASSWORD env is not set', async () => {
    delete process.env.ADMIN_PASSWORD
    const req = makeRequest({ password: 'any-password' })
    const res = await POST(req)

    expect(res.status).toBe(401)
  })

  it('calls createAuthToken when password is correct', async () => {
    const req = makeRequest({ password: 'correct-password' })
    await POST(req)

    expect(createAuthToken).toHaveBeenCalled()
  })
})

describe('DELETE /api/admin-login', () => {
  it('returns { ok: true } and clears admin_auth cookie', async () => {
    const res = await DELETE()

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
  })
})
