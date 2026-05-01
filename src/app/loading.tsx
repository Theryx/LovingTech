function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[500px] md:h-[600px] bg-brand-grey/10" />
    </div>
  )
}

function CategorySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl bg-brand-grey/20" />
      <div className="h-4 w-16 mx-auto mt-3 bg-brand-grey/20 rounded" />
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl bg-brand-grey/20 mb-4" />
      <div className="h-4 bg-brand-grey/20 rounded w-1/3 mb-2" />
      <div className="h-6 bg-brand-grey/20 rounded w-2/3 mb-2" />
      <div className="h-5 bg-brand-grey/20 rounded w-1/4" />
    </div>
  )
}

function FeatureSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-brand-grey/20 bg-white p-8">
      <div className="w-12 h-12 bg-brand-grey/20 rounded-2xl mb-5" />
      <div className="h-6 bg-brand-grey/20 rounded w-2/3 mb-3" />
      <div className="h-4 bg-brand-grey/20 rounded w-full" />
    </div>
  )
}

export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <div className="h-20 bg-white border-b border-brand-grey/20" />

      <HeroSkeleton />

      <section className="border-b border-brand-grey/20 px-6 py-6">
        <div className="mx-auto max-w-7xl flex justify-between">
          <div className="h-4 w-48 bg-brand-grey/20 rounded" />
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 w-20 bg-brand-grey/20 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl grid grid-cols-1 gap-12 border-b border-brand-grey/20 px-6 py-20 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <FeatureSkeleton key={i} />
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 border-b border-brand-grey/20">
        <div className="h-4 w-40 bg-brand-grey/20 rounded mb-6" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 flex justify-between">
          <div className="space-y-4">
            <div className="h-4 w-20 bg-brand-grey/20 rounded" />
            <div className="h-10 w-80 bg-brand-grey/20 rounded" />
          </div>
          <div className="h-10 w-40 bg-brand-grey/20 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="border-y border-brand-grey/20 bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-4 mb-14">
            <div className="h-4 w-20 bg-brand-grey/20 rounded" />
            <div className="h-10 w-64 bg-brand-grey/20 rounded" />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-brand-grey/20 bg-white p-8">
                <div className="w-8 h-8 bg-brand-grey/20 mb-6" />
                <div className="h-4 w-8 bg-brand-grey/20 rounded mb-3" />
                <div className="h-6 bg-brand-grey/20 rounded w-2/3 mb-3" />
                <div className="h-4 bg-brand-grey/20 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}