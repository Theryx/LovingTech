import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/auth', () => ({
  verifyAuthToken: vi.fn(),
}))

import { isAdmin } from '@/lib/api-auth'
import { verifyAuthToken } from '@/lib/auth'

describe('isAdmin', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when admin_auth cookie has a valid token', async () => {
    vi.mocked(verifyAuthToken).mockResolvedValue(true)

    const request = new Request('http://localhost:3000/api/test')
    const cookies = new Map([['admin_auth', 'valid-token']])
    vi.spyOn(request.headers, 'get').mockImplementation(() => null)

    Object.defineProperty(request, 'cookies', {
      value: {
        get: (name: string) =>
          cookies.get(name) ? { name, value: cookies.get(name)! } : undefined,
      },
    })

    const result = await isAdmin(request as any)
    expect(result).toBe(true)
  })

  it('returns false when admin_auth cookie is missing', async () => {
    const request = new Request('http://localhost:3000/api/test')
    Object.defineProperty(request, 'cookies', {
      value: {
        get: () => undefined,
      },
    })

    const result = await isAdmin(request as any)
    expect(result).toBe(false)
  })

  it('returns false when verifyAuthToken returns false', async () => {
    vi.mocked(verifyAuthToken).mockResolvedValue(false)

    const request = new Request('http://localhost:3000/api/test')
    const cookies = new Map([['admin_auth', 'invalid-token']])
    Object.defineProperty(request, 'cookies', {
      value: {
        get: (name: string) =>
          cookies.get(name) ? { name, value: cookies.get(name)! } : undefined,
      },
    })

    const result = await isAdmin(request as any)
    expect(result).toBe(false)
  })
})
