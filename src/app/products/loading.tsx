function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl bg-brand-grey/20 mb-4" />
      <div className="h-4 bg-brand-grey/20 rounded w-1/3 mb-2" />
      <div className="h-6 bg-brand-grey/20 rounded w-2/3 mb-2" />
      <div className="h-5 bg-brand-grey/20 rounded w-1/4 mb-4" />
      <div className="flex gap-2">
        <div className="h-9 flex-1 bg-brand-grey/20 rounded-lg" />
        <div className="h-9 w-20 bg-brand-grey/20 rounded-lg" />
      </div>
    </div>
  )
}

export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="animate-pulse mb-10">
          <div className="h-4 bg-brand-grey/20 rounded w-32 mb-2" />
          <div className="h-10 bg-brand-grey/20 rounded w-48" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="h-10 bg-brand-grey/20 rounded-xl flex-1 max-w-md" />
          <div className="h-10 bg-brand-grey/20 rounded-xl w-32" />
        </div>

        <div className="flex gap-2 flex-wrap mb-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-7 w-20 bg-brand-grey/20 rounded-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[...Array(9)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </main>
  )
}