'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/admin'

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push(from)
      router.refresh()
    } else {
      setError('Mot de passe incorrect / Incorrect password')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="mb-8 flex justify-center">
        <div className="flex items-center gap-3 text-2xl font-bold italic tracking-tighter text-brand-dark">
          <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
          ADMIN
        </div>
      </div>

      <div className="rounded-2xl border border-brand-grey/20 bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-brand-blue/10 p-4 text-brand-blue">
            <Lock className="h-6 w-6" />
          </div>
        </div>

        <h1 className="mb-6 text-center text-xl font-bold text-brand-dark">Connexion Admin</h1>

        <div className="mb-4">
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-brand-dark/60">
            Mot de passe / Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-xl border border-brand-grey/30 px-4 py-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue transition"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-xl bg-brand-blue py-3 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-50"
        >
          {loading ? 'Connexion…' : 'Se connecter / Login'}
        </button>
      </div>
    </form>
  )
}

export default function AdminLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
