'use client';

import Link from 'next/link';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-bold text-brand-dark mb-3">
        Ce produit n&apos;est pas disponible / Product unavailable
      </h1>
      <p className="text-brand-dark/60 mb-8 max-w-md">
        Une erreur s&apos;est produite lors du chargement de ce produit. Veuillez réessayer ou revenir au catalogue.
        <br />
        <span className="text-sm opacity-70">{error.message}</span>
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-full bg-brand-blue px-6 py-3 font-medium text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
        >
          Réessayer / Retry
        </button>
        <Link
          href="/products"
          className="rounded-full border border-brand-grey/30 px-6 py-3 font-medium text-brand-dark transition hover:bg-brand-grey/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
        >
          Voir tous les produits / View all
        </Link>
      </div>
    </main>
  );
}
