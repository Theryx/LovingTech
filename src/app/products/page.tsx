'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import { LOCAL_PRODUCTS } from '@/lib/localProducts';
import { useLanguage } from '@/context/LanguageContext';

export default function ProductsPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white">
      <Navbar />

      <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition group mb-12"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
          {t({ en: 'Back to Home', fr: 'Retour à l\'accueil' })}
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            {t({ en: 'All Products', fr: 'Tous les produits' })}
          </h1>
          <p className="text-zinc-500 text-lg">
            {t({ en: 'Everything we have in stock.', fr: 'Tout ce que nous avons en stock.' })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {LOCAL_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 text-sm">
        © 2026 Loving Tech Cameroon. {t({ en: 'All rights reserved.', fr: 'Tous droits réservés.' })}
      </footer>
    </main>
  );
}
