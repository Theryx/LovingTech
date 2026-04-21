'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Filter } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import { LOCAL_PRODUCTS } from '@/lib/localProducts';
import { Product, productService } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

export default function ProductsPage() {
  const { t } = useLanguage();
  const [stockFilter, setStockFilter] = useState<string>('');
  const [products, setProducts] = useState<Product[]>(LOCAL_PRODUCTS as Product[]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const dbProducts = await productService.getAll();
        if (dbProducts.length > 0) {
          setProducts(dbProducts);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    if (!stockFilter) return true;
    return product.stock_status === stockFilter;
  });

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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-3 tracking-tight">
              {t({ en: 'All Products', fr: 'Tous les produits' })}
            </h1>
            <p className="text-zinc-500 text-lg">
              {t({ en: 'Everything we have in stock.', fr: 'Tout ce que nous avons en stock.' })}
            </p>
          </div>
          <div className="relative">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer"
            >
              <option value="">{t({ en: 'All Stock', fr: 'Tout le stock' })}</option>
              <option value="in_stock">{t({ en: 'In Stock', fr: 'En stock' })}</option>
              <option value="out_of_stock">{t({ en: 'Out of Stock', fr: 'Rupture de stock' })}</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProducts.map((product) => (
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
