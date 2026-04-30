import { NextRequest, NextResponse } from 'next/server'
import { createAuthToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const correct = process.env.ADMIN_PASSWORD

  if (!correct || password !== correct) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = await createAuthToken()

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('admin_auth')
  return response
}
