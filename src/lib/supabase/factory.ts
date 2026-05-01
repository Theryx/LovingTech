import { createClient, SupabaseClient } from '@supabase/supabase-js'

const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 500

async function fetchWithNoCacheAndRetry(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(input, { ...init, cache: 'no-store' })

      if (response.status < 500) return response

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

export function createSupabaseClient(
  url: string,
  key: string,
  options?: { persistSession?: boolean }
): SupabaseClient {
  return createClient(url, key, {
    auth: { persistSession: options?.persistSession ?? false },
    global: { fetch: fetchWithNoCacheAndRetry },
  })
}
