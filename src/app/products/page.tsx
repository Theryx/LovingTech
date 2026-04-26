'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import { LOCAL_PRODUCTS } from '@/lib/localProducts';
import { Product, ProductCategory, ProductCondition, productService } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

const CATEGORIES: { value: ProductCategory | ''; labelEn: string; labelFr: string }[] = [
  { value: '', labelEn: 'All', labelFr: 'Tout' },
  { value: 'keyboard', labelEn: 'Keyboards', labelFr: 'Claviers' },
  { value: 'mouse', labelEn: 'Mice', labelFr: 'Souris' },
  { value: 'cable', labelEn: 'Cables', labelFr: 'Câbles' },
  { value: 'speaker', labelEn: 'Speakers', labelFr: 'Enceintes' },
  { value: 'solar_lamp', labelEn: 'Solar Lamps', labelFr: 'Lampes solaires' },
];

const CONDITIONS: { value: ProductCondition | ''; labelEn: string; labelFr: string }[] = [
  { value: '', labelEn: 'All conditions', labelFr: 'Tous les états' },
  { value: 'new', labelEn: 'New', labelFr: 'Neuf' },
  { value: 'refurbished', labelEn: 'Refurbished', labelFr: 'Reconditionné' },
  { value: 'second_hand', labelEn: 'Second-hand', labelFr: 'Occasion' },
];

export default function ProductsPage() {
  const { language, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>(LOCAL_PRODUCTS as Product[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [condition, setCondition] = useState<ProductCondition | ''>('');
  const [stockFilter, setStockFilter] = useState<'in_stock' | ''>('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const db = await productService.getAll();
        if (db.length > 0) setProducts(db);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    }
    loadProducts();
  }, []);

  const filtered = products.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (category && p.category !== category) return false;
    if (condition && p.condition !== condition) return false;
    if (stockFilter && p.stock_status !== stockFilter) return false;
    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('');
    setCondition('');
    setStockFilter('');
  };

  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <Navbar />

      <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-dark/50 hover:text-brand-dark transition group mb-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" aria-hidden="true" />
          {t({ en: 'Back to Home', fr: "Retour à l'accueil" })}
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">{t({ en: 'All Products', fr: 'Tous les produits' })}</h1>
          <p className="text-brand-dark/60 text-lg">{t({ en: 'Premium tech accessories delivered nationwide.', fr: 'Accessoires tech premium livrés dans tout le pays.' })}</p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            placeholder={t({ en: 'Search products...', fr: 'Rechercher des produits...' })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-brand-grey/30 rounded-xl text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue transition"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-4" role="group" aria-label={t({ en: 'Filter by category', fr: 'Filtrer par catégorie' })}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              aria-pressed={category === cat.value}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${
                category === cat.value
                  ? 'bg-brand-blue text-white'
                  : 'bg-brand-grey/20 text-brand-dark hover:bg-brand-grey/40'
              }`}
            >
              {language === 'fr' ? cat.labelFr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Condition + stock filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CONDITIONS.map(cond => (
            <button
              key={cond.value}
              onClick={() => setCondition(cond.value)}
              aria-pressed={condition === cond.value}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${
                condition === cond.value
                  ? 'border-brand-dark bg-brand-dark text-white'
                  : 'border-brand-grey/40 text-brand-dark/60 hover:border-brand-dark/40'
              }`}
            >
              {language === 'fr' ? cond.labelFr : cond.labelEn}
            </button>
          ))}
          <button
            onClick={() => setStockFilter(stockFilter ? '' : 'in_stock')}
            aria-pressed={stockFilter === 'in_stock'}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${
              stockFilter === 'in_stock'
                ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                : 'border-brand-grey/40 text-brand-dark/60 hover:border-brand-blue/40'
            }`}
          >
            {t({ en: 'In stock only', fr: 'En stock uniquement' })}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center text-brand-dark/40">
            <p className="text-xl font-medium mb-2">{t({ en: 'No products found', fr: 'Aucun produit trouvé' })}</p>
            <button onClick={clearFilters} className="text-sm text-brand-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">
              {t({ en: 'Clear filters', fr: 'Effacer les filtres' })}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <footer className="py-12 px-6 border-t border-brand-grey/20 text-center text-brand-dark/50 text-sm">
        © 2026 Loving Tech Cameroon. {t({ en: 'All rights reserved.', fr: 'Tous droits réservés.' })}
      </footer>
    </main>
  );
}
