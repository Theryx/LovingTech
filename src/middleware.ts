import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth'
import { loginRateLimit, orderRateLimit, safeLimit } from '@/lib/rate-limit'

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co https://gdscmwggticbgdhjwrlk.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
  )
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response: NextResponse | null = null

  // Rate limit admin login
  if (pathname === '/api/admin-login') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    const { success } = await safeLimit(loginRateLimit, ip)
    if (!success) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: 'Too many login attempts. Please try again later.' },
          { status: 429 }
        )
      )
    }
  }

  // Rate limit order creation
  if (request.method === 'POST' && pathname === '/api/orders') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    const { success } = await safeLimit(orderRateLimit, ip)
    if (!success) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
      )
    }
  }

  // Let API routes handle their own auth
  if (pathname.startsWith('/api/')) {
    response = NextResponse.next()
    return applySecurityHeaders(response)
  }

  // Public routes — no auth needed
  if (!pathname.startsWith('/admin')) {
    response = NextResponse.next()
    return applySecurityHeaders(response)
  }

  // Admin login is public
  if (pathname === '/admin/login') {
    response = NextResponse.next()
    return applySecurityHeaders(response)
  }

  // Protect admin routes
  const auth = request.cookies.get('admin_auth')?.value
  if (!auth) {
    return applySecurityHeaders(redirectToLogin(request, pathname))
  }

  const valid = await verifyAuthToken(auth)
  if (!valid) {
    const loginResponse = redirectToLogin(request, pathname)
    loginResponse.cookies.delete('admin_auth')
    return applySecurityHeaders(loginResponse)
  }

  response = NextResponse.next()
  return applySecurityHeaders(response)
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL('/admin/login', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
