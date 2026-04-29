import 'server-only'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 500

async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(input, init)
      if (response.status < 500) return response
      lastError = new Error(`Server error: ${response.status}`)
    } catch (err) {
      lastError = err
    }

    if (attempt < MAX_RETRIES - 1) {
      await new Promise(r => setTimeout(r, INITIAL_BACKOFF_MS * Math.pow(2, attempt)))
    }
  }

  throw lastError
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
  global: {
    fetch: fetchWithRetry,
  },
})
