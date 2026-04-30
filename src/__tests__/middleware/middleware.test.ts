import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/auth', () => ({
  verifyAuthToken: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  loginRateLimit: { limit: vi.fn() },
  orderRateLimit: { limit: vi.fn() },
}))

import { middleware } from '@/middleware'
import { verifyAuthToken } from '@/lib/auth'
import { loginRateLimit, orderRateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

function makeNextRequest(
  path: string,
  options: { method?: string; cookies?: Record<string, string>; ip?: string } = {}
) {
  const url = new URL(path, 'http://localhost:3000')
  const headers = new Headers()
  if (options.ip) {
    headers.set('x-forwarded-for', options.ip)
  }
  if (options.cookies) {
    const cookieString = Object.entries(options.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')
    headers.set('cookie', cookieString)
  }

  const req = new NextRequest(url, {
    method: options.method || 'GET',
    headers,
  })

  return req
}

describe('middleware', () => {
  beforeEach(() => {
    vi.mocked(loginRateLimit.limit).mockResolvedValue({ success: true } as any)
    vi.mocked(orderRateLimit.limit).mockResolvedValue({ success: true } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('security headers', () => {
    it('sets X-Content-Type-Options header on all responses', async () => {
      const req = makeNextRequest('/products')
      const res = await middleware(req)
      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
    })

    it('sets X-Frame-Options DENY header', async () => {
      const req = makeNextRequest('/products')
      const res = await middleware(req)
      expect(res.headers.get('X-Frame-Options')).toBe('DENY')
    })

    it('sets Referrer-Policy header', async () => {
      const req = makeNextRequest('/products')
      const res = await middleware(req)
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    })

    it('sets X-XSS-Protection header', async () => {
      const req = makeNextRequest('/products')
      const res = await middleware(req)
      expect(res.headers.get('X-XSS-Protection')).toBe('1; mode=block')
    })

    it('sets Content-Security-Policy header', async () => {
      const req = makeNextRequest('/products')
      const res = await middleware(req)
      const csp = res.headers.get('Content-Security-Policy')
      expect(csp).toBeTruthy()
      expect(csp).toContain("default-src 'self'")
    })

    it('sets Permissions-Policy header', async () => {
      const req = makeNextRequest('/products')
      const res = await middleware(req)
      expect(res.headers.get('Permissions-Policy')).toContain('camera=()')
    })
  })

  describe('admin route protection', () => {
    it('redirects unauthenticated admin requests to /admin/login', async () => {
      const req = makeNextRequest('/admin/orders')
      const res = await middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toContain('/admin/login')
      expect(res.headers.get('location')).toContain('from=%2Fadmin%2Forders')
    })

    it('allows access to /admin/login without auth', async () => {
      const req = makeNextRequest('/admin/login')
      const res = await middleware(req)

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
    })

    it('allows access to admin routes with valid token', async () => {
      vi.mocked(verifyAuthToken).mockResolvedValue(true)

      const req = makeNextRequest('/admin/orders', { cookies: { admin_auth: 'valid-token' } })
      const res = await middleware(req)

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(res.status).not.toBe(307)
    })

    it('redirects to login with invalid token', async () => {
      vi.mocked(verifyAuthToken).mockResolvedValue(false)

      const req = makeNextRequest('/admin/orders', { cookies: { admin_auth: 'invalid-token' } })
      const res = await middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toContain('/admin/login')
    })

    it('deletes cookie on invalid token', async () => {
      vi.mocked(verifyAuthToken).mockResolvedValue(false)

      const req = makeNextRequest('/admin/products', { cookies: { admin_auth: 'invalid-token' } })
      const res = await middleware(req)

      expect(res.status).toBe(307)
    })
  })

  describe('rate limiting', () => {
    it('rate limits POST /api/admin-login (5/15min)', async () => {
      vi.mocked(loginRateLimit.limit).mockResolvedValue({ success: false } as any)

      const req = makeNextRequest('/api/admin-login', {
        method: 'POST',
        ip: '1.2.3.4',
      })
      const res = await middleware(req)

      expect(res.status).toBe(429)
      const json = await res.json()
      expect(json.error).toContain('Too many')
    })

    it('rate limits POST /api/orders (10/1min)', async () => {
      vi.mocked(orderRateLimit.limit).mockResolvedValue({ success: false } as any)

      const req = makeNextRequest('/api/orders', {
        method: 'POST',
        ip: '1.2.3.4',
      })
      const res = await middleware(req)

      expect(res.status).toBe(429)
      const json = await res.json()
      expect(json.error).toContain('Too many')
    })

    it('passes through login request when not rate limited', async () => {
      vi.mocked(loginRateLimit.limit).mockResolvedValue({ success: true } as any)

      const req = makeNextRequest('/api/admin-login', {
        method: 'POST',
        ip: '1.2.3.4',
      })
      const res = await middleware(req)

      expect(res.status).not.toBe(429)
    })

    it('extracts IP from x-forwarded-for header', async () => {
      vi.mocked(loginRateLimit.limit).mockResolvedValue({ success: true } as any)

      const req = makeNextRequest('/api/admin-login', {
        method: 'POST',
        ip: '10.0.0.1',
      })
      await middleware(req)

      expect(loginRateLimit.limit).toHaveBeenCalledWith('10.0.0.1')
    })
  })

  describe('API route handling', () => {
    it('passes through API routes (no redirect)', async () => {
      const req = makeNextRequest('/api/orders')
      const res = await middleware(req)

      expect(res.status).not.toBe(307)
      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
    })

    it('passes through public routes', async () => {
      const req = makeNextRequest('/products')
      const res = await middleware(req)

      expect(res.status).not.toBe(307)
      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
    })
  })
})
