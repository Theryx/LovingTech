export default function HomeLoading() {
  return (
    <main className="min-h-screen">
      {/* Hero skeleton */}
      <section className="px-6 py-24 text-center bg-gradient-to-b from-zinc-900 to-black">
        <div className="h-14 w-96 max-w-full bg-zinc-800 animate-pulse rounded mx-auto mb-4" />
        <div className="h-14 w-72 max-w-full bg-zinc-800 animate-pulse rounded mx-auto mb-6" />
        <div className="h-5 w-[520px] max-w-full bg-zinc-800 animate-pulse rounded mx-auto mb-3" />
        <div className="h-5 w-80 max-w-full bg-zinc-800 animate-pulse rounded mx-auto mb-10" />
        <div className="flex justify-center">
          <div className="h-12 w-40 bg-zinc-800 animate-pulse rounded-full" />
        </div>
      </section>

      {/* Features strip skeleton */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-y border-zinc-900">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center space-y-4">
            <div className="h-16 w-16 bg-zinc-800 animate-pulse rounded-2xl" />
            <div className="h-5 w-32 bg-zinc-800 animate-pulse rounded" />
            <div className="h-4 w-48 bg-zinc-800 animate-pulse rounded" />
          </div>
        ))}
      </section>

      {/* Product grid skeleton */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 gap-6">
          <div>
            <div className="h-10 w-72 bg-zinc-800 animate-pulse rounded mb-3" />
            <div className="h-5 w-56 bg-zinc-800 animate-pulse rounded" />
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-20 bg-zinc-800 animate-pulse rounded-full" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden">
              <div className="aspect-square bg-zinc-800 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-6 w-3/4 bg-zinc-800 animate-pulse rounded" />
                <div className="h-4 w-full bg-zinc-800 animate-pulse rounded" />
                <div className="flex justify-between items-center pt-3">
                  <div className="h-6 w-28 bg-zinc-800 animate-pulse rounded" />
                  <div className="h-9 w-20 bg-zinc-800 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
