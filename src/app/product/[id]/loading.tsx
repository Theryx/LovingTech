export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="p-6 max-w-7xl mx-auto">
        <div className="h-5 w-36 bg-zinc-800 animate-pulse rounded" />
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Gallery skeleton */}
        <div className="space-y-6">
          <div className="aspect-square bg-zinc-800 animate-pulse rounded-3xl border border-zinc-800" />
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-zinc-800 animate-pulse rounded-xl border border-zinc-800" />
            ))}
          </div>
        </div>

        {/* Right: Info skeleton */}
        <div className="flex flex-col space-y-4">
          <div className="h-4 w-24 bg-zinc-800 animate-pulse rounded" />
          <div className="h-12 w-full bg-zinc-800 animate-pulse rounded" />
          <div className="h-12 w-3/4 bg-zinc-800 animate-pulse rounded" />
          <div className="h-8 w-40 bg-zinc-800 animate-pulse rounded mt-2" />

          <div className="space-y-2 pt-4">
            <div className="h-3 w-24 bg-zinc-800 animate-pulse rounded" />
            <div className="h-4 w-full bg-zinc-800 animate-pulse rounded mt-2" />
            <div className="h-4 w-full bg-zinc-800 animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-zinc-800 animate-pulse rounded" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-16 bg-zinc-800 animate-pulse rounded" />
                <div className="h-4 w-24 bg-zinc-800 animate-pulse rounded" />
              </div>
            ))}
          </div>

          <div className="h-16 w-full bg-zinc-800 animate-pulse rounded-2xl mt-4" />

          <div className="grid grid-cols-3 gap-6 pt-12 border-t border-zinc-900">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-4 w-full bg-zinc-800 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
