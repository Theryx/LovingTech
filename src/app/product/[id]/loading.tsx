export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="animate-pulse">
            <div className="aspect-square rounded-3xl bg-brand-grey/20 mb-4" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-20 rounded-xl bg-brand-grey/20" />
              ))}
            </div>
          </div>

          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-brand-grey/20 rounded w-24" />
            <div className="h-10 bg-brand-grey/20 rounded w-3/4" />
            <div className="h-8 bg-brand-grey/20 rounded w-1/3" />
            <div className="h-6 bg-brand-grey/20 rounded w-40" />

            <div className="space-y-3 pt-8">
              <div className="h-4 bg-brand-grey/20 rounded w-full" />
              <div className="h-4 bg-brand-grey/20 rounded w-full" />
              <div className="h-4 bg-brand-grey/20 rounded w-2/3" />
            </div>

            <div className="h-14 bg-brand-grey/20 rounded-xl mt-8" />
          </div>
        </div>
      </div>
    </main>
  )
}