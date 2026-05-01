'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body className="bg-white text-brand-dark">
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-orange/10 text-brand-orange mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-brand-dark/60 mb-6">
              We encountered an unexpected error. Please try again.
            </p>
            <button
              onClick={reset}
              className="px-5 py-2.5 bg-brand-dark text-white rounded-full font-medium hover:bg-brand-dark/90 transition"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}