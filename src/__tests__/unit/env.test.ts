import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('env validation', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.resetModules()
  })

  it('does not throw when all env vars are valid', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'some-key'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'some-service-key'
    process.env.ADMIN_PASSWORD = 'validpassword'
    process.env.NODE_ENV = 'development'

    await expect(import('@/lib/env')).resolves.toBeDefined()
  })

  it('warns in development when env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.ADMIN_PASSWORD
    process.env.NODE_ENV = 'development'

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await import('@/lib/env')
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('rejects ADMIN_PASSWORD shorter than 8 characters', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'some-key'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'some-service-key'
    process.env.ADMIN_PASSWORD = 'short'
    process.env.NODE_ENV = 'development'

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await import('@/lib/env')
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('rejects invalid NEXT_PUBLIC_SUPABASE_URL that is not a URL', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'some-key'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'some-service-key'
    process.env.ADMIN_PASSWORD = 'validpassword'
    process.env.NODE_ENV = 'development'

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await import('@/lib/env')
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
