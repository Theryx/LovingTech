import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public /api routes
  if (pathname.startsWith('/api/')) return NextResponse.next();

  if (!pathname.startsWith('/admin')) return NextResponse.next();
  if (pathname === '/admin/login') return NextResponse.next();

  const auth = request.cookies.get('admin_auth')?.value;
  if (!auth) {
    return redirectToLogin(request, pathname);
  }

  const valid = await verifyAuthToken(auth);
  if (!valid) {
    return redirectToLogin(request, pathname);
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
