import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 500

async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(input, init)

      // Only retry on server errors (5xx) — client errors (4xx) should fail immediately
      if (response.status < 500) return response

      // Server error — retry after backoff
      lastError = new Error(`Server error: ${response.status}`)
    } catch (err) {
      lastError = err
    }

    if (attempt < MAX_RETRIES - 1) {
      const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
      await new Promise(r => setTimeout(r, delay))
    }
  }

  throw lastError
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetchWithRetry,
  },
})
