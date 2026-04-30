import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('auth token utilities', () => {
  const originalEnv = process.env.ADMIN_PASSWORD

  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'test-password-8chars'
  })

  afterEach(() => {
    process.env.ADMIN_PASSWORD = originalEnv
    vi.restoreAllMocks()
  })

  describe('createAuthToken', () => {
    it('returns a token with 3 dot-separated parts', async () => {
      const { createAuthToken } = await import('@/lib/auth')
      const token = await createAuthToken()
      const parts = token.split('.')
      expect(parts).toHaveLength(3)
    })

    it('returns a token with UUID sessionId', async () => {
      const { createAuthToken } = await import('@/lib/auth')
      const token = await createAuthToken()
      const [sessionId] = token.split('.')
      expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    })

    it('returns a token with numeric timestamp', async () => {
      const { createAuthToken } = await import('@/lib/auth')
      const token = await createAuthToken()
      const [, timestamp] = token.split('.')
      const parsed = parseInt(timestamp, 10)
      expect(isNaN(parsed)).toBe(false)
      expect(parsed).toBeGreaterThan(0)
    })
  })

  describe('verifyAuthToken', () => {
    it('accepts a freshly created token', async () => {
      const { createAuthToken, verifyAuthToken } = await import('@/lib/auth')
      const token = await createAuthToken()
      const result = await verifyAuthToken(token)
      expect(result).toBe(true)
    })

    it('rejects a token with fewer than 3 parts', async () => {
      const { verifyAuthToken } = await import('@/lib/auth')
      const result = await verifyAuthToken('only.two')
      expect(result).toBe(false)
    })

    it('rejects a token with more than 3 parts', async () => {
      const { verifyAuthToken } = await import('@/lib/auth')
      const result = await verifyAuthToken('a.b.c.d')
      expect(result).toBe(false)
    })

    it('rejects an empty string', async () => {
      const { verifyAuthToken } = await import('@/lib/auth')
      const result = await verifyAuthToken('')
      expect(result).toBe(false)
    })

    it('rejects a token with a tampered signature', async () => {
      const { createAuthToken, verifyAuthToken } = await import('@/lib/auth')
      const token = await createAuthToken()
      const [sessionId, timestamp] = token.split('.')
      const tampered = `${sessionId}.${timestamp}.0000000000000000000000000000000000000000000000000000000000000000`
      const result = await verifyAuthToken(tampered)
      expect(result).toBe(false)
    })

    it('rejects a token with a non-numeric timestamp', async () => {
      const { verifyAuthToken } = await import('@/lib/auth')
      const result = await verifyAuthToken('uuid.notatime.sig')
      expect(result).toBe(false)
    })

    it('rejects an expired token (older than 7 days)', async () => {
      const { verifyAuthToken } = await import('@/lib/auth')
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

      const { createAuthToken } = await import('@/lib/auth')
      const token = await createAuthToken()

      vi.setSystemTime(new Date('2026-01-10T00:00:00Z'))
      const result = await verifyAuthToken(token)
      expect(result).toBe(false)

      vi.useRealTimers()
    })

    it('rejects token signed with a different password', async () => {
      process.env.ADMIN_PASSWORD = 'password-one-8c'
      const { createAuthToken: create1 } = await import('@/lib/auth')
      const token = await create1()

      process.env.ADMIN_PASSWORD = 'password-two-8c'
      const { verifyAuthToken: verify2 } = await import('@/lib/auth')
      const result = await verify2(token)
      expect(result).toBe(false)

      process.env.ADMIN_PASSWORD = 'test-password-8chars'
    })

    it('returns false on any exception', async () => {
      const { verifyAuthToken } = await import('@/lib/auth')
      const result = await verifyAuthToken(null as any)
      expect(result).toBe(false)
    })
  })
})
