export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <nav className="mx-auto max-w-7xl p-6">
        <div className="h-5 w-36 animate-pulse rounded bg-brand-grey/20" />
      </nav>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="aspect-square animate-pulse rounded-3xl border border-brand-grey/20 bg-brand-grey/15" />
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl border border-brand-grey/20 bg-brand-grey/15"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-brand-grey/20" />
          <div className="h-12 w-full animate-pulse rounded bg-brand-grey/25" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-brand-grey/25" />
          <div className="mt-2 h-8 w-40 animate-pulse rounded bg-brand-orange/60" />

          <div className="space-y-2 pt-4">
            <div className="h-3 w-24 animate-pulse rounded bg-brand-grey/20" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-brand-grey/15" />
            <div className="h-4 w-full animate-pulse rounded bg-brand-grey/15" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-brand-grey/15" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-16 animate-pulse rounded bg-brand-grey/20" />
                <div className="h-4 w-24 animate-pulse rounded bg-brand-grey/15" />
              </div>
            ))}
          </div>

          <div className="mt-4 h-16 w-full animate-pulse rounded-2xl bg-brand-grey/20" />

          <div className="grid grid-cols-3 gap-6 border-t border-brand-grey/20 pt-12">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-4 w-full animate-pulse rounded bg-brand-grey/20" />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
