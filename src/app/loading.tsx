export default function HomeLoading() {
  return (
    <main className="min-h-screen">
      <section className="bg-brand-dark px-6 py-24 text-center">
        <div className="mx-auto mb-4 h-14 w-96 max-w-full animate-pulse rounded bg-brand-grey/20" />
        <div className="mx-auto mb-6 h-14 w-72 max-w-full animate-pulse rounded bg-brand-grey/20" />
        <div className="mx-auto mb-3 h-5 w-[520px] max-w-full animate-pulse rounded bg-brand-grey/20" />
        <div className="mx-auto mb-10 h-5 w-80 max-w-full animate-pulse rounded bg-brand-grey/20" />
        <div className="flex justify-center">
          <div className="h-12 w-40 animate-pulse rounded-full bg-brand-orange/70" />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 border-y border-brand-grey/20 px-6 py-20 md:grid-cols-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex flex-col items-center space-y-4">
            <div className="h-16 w-16 animate-pulse rounded-2xl bg-brand-blue/20" />
            <div className="h-5 w-32 animate-pulse rounded bg-brand-grey/30" />
            <div className="h-4 w-48 animate-pulse rounded bg-brand-grey/20" />
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 h-10 w-72 animate-pulse rounded bg-brand-grey/30" />
            <div className="h-5 w-56 animate-pulse rounded bg-brand-grey/20" />
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-10 w-20 animate-pulse rounded-full bg-brand-blue/20" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl border border-brand-grey/20 bg-brand-dark"
            >
              <div className="aspect-square animate-pulse bg-brand-grey/15" />
              <div className="space-y-3 p-6">
                <div className="h-6 w-3/4 animate-pulse rounded bg-brand-grey/25" />
                <div className="h-4 w-full animate-pulse rounded bg-brand-grey/15" />
                <div className="flex items-center justify-between pt-3">
                  <div className="h-6 w-28 animate-pulse rounded bg-brand-grey/20" />
                  <div className="h-9 w-20 animate-pulse rounded-full bg-brand-orange/60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
