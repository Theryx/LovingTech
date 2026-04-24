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
  const [products, setProducts] = useState<Product[]>(LOCAL_PRODUCTS as Product[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

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

  const brands = Array.from(new Set(products.map(p => p.brand))).sort();

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = !brandFilter || product.brand === brandFilter;
    const matchesStock = !stockFilter || product.stock_status === stockFilter;
    
    return matchesSearch && matchesBrand && matchesStock;
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

        <div className="flex flex-col gap-8 mb-16">
          <div>
            <h1 className="text-4xl font-bold mb-3 tracking-tight">
              {t({ en: 'All Products', fr: 'Tous les produits' })}
            </h1>
            <p className="text-zinc-500 text-lg">
              {t({ en: 'Premium tech accessories delivered nationwide.', fr: 'Accessoires tech premium livrés dans tout le pays.' })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <input
                type="text"
                placeholder={t({ en: 'Search products...', fr: 'Rechercher des produits...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="relative">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="appearance-none w-full pl-10 pr-8 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer transition"
              >
                <option value="">{t({ en: 'All Brands', fr: 'Toutes les marques' })}</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="appearance-none w-full pl-10 pr-8 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer transition"
              >
                <option value="">{t({ en: 'All Stock', fr: 'Tout le stock' })}</option>
                <option value="in_stock">{t({ en: 'In Stock', fr: 'En stock' })}</option>
                <option value="pre_order">{t({ en: 'Pre-order', fr: 'Pré-commande' })}</option>
                <option value="out_of_stock">{t({ en: 'Out of Stock', fr: 'Rupture de stock' })}</option>
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none flex items-center justify-center">
                 <div className="w-2 h-2 rounded-full bg-zinc-400" />
              </div>
            </div>
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
