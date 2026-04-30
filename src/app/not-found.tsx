import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white text-brand-dark">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="mb-8 text-lg text-brand-dark/60">Page not found</p>
      <Link
        href="/"
        className="rounded-full bg-brand-orange px-6 py-3 font-medium text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
      >
        Go Home
      </Link>
    </div>
  )
}
