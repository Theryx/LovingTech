function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
  } catch {
    return null
  }
}

function isProbablyJwt(token: string): boolean {
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token)
}

export interface EnvValidation {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validateEnv(): EnvValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Supabase URL
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is missing')
  } else if (!url.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must start with https://')
  }

  // Anon key
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
  } else if (!isProbablyJwt(anonKey)) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not a valid JWT format')
  } else {
    const payload = decodeJwtPayload(anonKey)
    if (!payload) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY JWT payload is malformed')
    } else if (payload.role !== 'anon') {
      errors.push(
        `NEXT_PUBLIC_SUPABASE_ANON_KEY has role "${payload.role}" but should be "anon"`
      )
    }
  }

  // Service role key
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is missing')
  } else if (!isProbablyJwt(serviceKey)) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is not a valid JWT format')
  } else {
    const payload = decodeJwtPayload(serviceKey)
    if (!payload) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY JWT payload is malformed')
    } else if (payload.role !== 'service_role') {
      errors.push(
        `SUPABASE_SERVICE_ROLE_KEY has role "${payload.role}" — it looks like the anon key was copied by mistake. The service_role key is available in Supabase Dashboard → Settings → API.`
      )
    }
  }

  // Admin password
  if (!process.env.ADMIN_PASSWORD) {
    warnings.push('ADMIN_PASSWORD is missing — admin login will not work')
  }

  // NODE_ENV
  if (!process.env.NODE_ENV) {
    warnings.push('NODE_ENV is not set')
  }

  return { valid: errors.length === 0, errors, warnings }
}
