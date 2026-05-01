import { NextResponse } from 'next/server'
import { validateEnv } from '@/lib/env'
import { supabase } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const env = validateEnv()

  const checks: Record<string, { status: 'ok' | 'error' | 'warn'; message?: string }> = {}

  // 1. Environment variables
  if (!env.valid) {
    checks.env = { status: 'error', message: env.errors[0] }
  } else {
    checks.env = { status: 'ok' }
  }

  // 2. Database read connectivity (anon key)
  try {
    const { data, error } = await supabase.from('products').select('id').limit(1)
    if (error) {
      checks.db_read = { status: 'error', message: error.message }
    } else {
      checks.db_read = { status: 'ok', message: `${data.length} row(s) returned` }
    }
  } catch (err: any) {
    checks.db_read = { status: 'error', message: err.message }
  }

  // 3. Determine overall status
  const hasError = Object.values(checks).some(c => c.status === 'error')
  const status = hasError ? 503 : 200

  return NextResponse.json(
    {
      status: hasError ? 'unhealthy' : 'healthy',
      timestamp: new Date().toISOString(),
      node_env: process.env.NODE_ENV,
      checks,
    },
    { status }
  )
}
