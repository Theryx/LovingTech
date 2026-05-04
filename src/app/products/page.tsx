'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import Navbar from '@/components/Navbar'
import { LOCAL_PRODUCTS } from '@/lib/localProducts'
import { Product, ProductCategory, ProductCondition, productService } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'

const CATEGORIES: { value: ProductCategory | ''; labelEn: string; labelFr: string }[] = [
  { value: '', labelEn: 'All', labelFr: 'Tout' },
  { value: 'keyboard', labelEn: 'Keyboards', labelFr: 'Claviers' },
  { value: 'mouse', labelEn: 'Mice', labelFr: 'Souris' },
  { value: 'cable', labelEn: 'Cables', labelFr: 'Câbles' },
  { value: 'speaker', labelEn: 'Speakers', labelFr: 'Enceintes' },
  { value: 'solar_lamp', labelEn: 'Solar Lamps', labelFr: 'Lampes Solaires' },
  { value: 'others', labelEn: 'Others', labelFr: 'Autres' },
]

const CONDITIONS: { value: ProductCondition | ''; labelEn: string; labelFr: string }[] = [
  { value: '', labelEn: 'All conditions', labelFr: 'Tous les états' },
  { value: 'new', labelEn: 'New', labelFr: 'Neuf' },
  { value: 'refurbished', labelEn: 'Refurbished', labelFr: 'Reconditionné' },
  { value: 'second_hand', labelEn: 'Second-hand', labelFr: 'Occasion' },
]

type SortKey = 'newest' | 'price_asc' | 'price_desc'

const SORTS: { value: SortKey; labelEn: string; labelFr: string }[] = [
  { value: 'newest', labelEn: 'Newest', labelFr: 'Nouveautés' },
  { value: 'price_asc', labelEn: 'Price ↑', labelFr: 'Prix ↑' },
  { value: 'price_desc', labelEn: 'Price ↓', labelFr: 'Prix ↓' },
]

function sortProducts(products: Product[], sort: SortKey): Product[] {
  const arr = [...products]
  if (sort === 'price_asc') return arr.sort((a, b) => a.price_xaf - b.price_xaf)
  if (sort === 'price_desc') return arr.sort((a, b) => b.price_xaf - a.price_xaf)
  return arr // newest = DB order
}

function ProductsContent() {
  const { language, t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>(LOCAL_PRODUCTS as Product[])
  const [searchQuery, setSearchQuery] = useState('')

  const category = (searchParams.get('category') || '') as ProductCategory | ''
  const condition = (searchParams.get('condition') || '') as ProductCondition | ''
  const sort = (searchParams.get('sort') || 'newest') as SortKey
  const stockOnly = searchParams.get('stock') === '1'

  useEffect(() => {
    productService
      .getAll()
      .then(db => {
        if (db.length > 0) setProducts(db)
      })
      .catch(() => {})
  }, [])

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.replace(`/products?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const clearFilters = () => {
    router.replace('/products', { scroll: false })
    setSearchQuery('')
  }

  const filtered = sortProducts(
    products.filter(p => {
      if (
        searchQuery &&
        !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false
      if (category && p.category !== category) return false
      if (condition && p.condition !== condition) return false
      if (stockOnly && p.stock_status !== 'in_stock') return false
      return true
    }),
    sort
  )

  const hasActiveFilters = category || condition || stockOnly || searchQuery

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
          <h1 className="text-4xl font-bold mb-2 tracking-tight">
            {t({ en: 'All Products', fr: 'Tous les produits' })}
          </h1>
          <p className="text-brand-dark/60 text-lg">
            {t({
              en: 'Premium tech accessories delivered nationwide.',
              fr: 'Accessoires tech premium livrés dans tout le pays.',
            })}
          </p>
        </div>

        {/* Search + sort row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder={t({ en: 'Search products...', fr: 'Rechercher des produits...' })}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-brand-grey/30 rounded-xl text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue transition"
            />
          </div>
          <select
            value={sort}
            onChange={e => setParam('sort', e.target.value === 'newest' ? '' : e.target.value)}
            className="rounded-xl border border-brand-grey/30 px-3 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
            aria-label={t({ en: 'Sort by', fr: 'Trier par' })}
          >
            {SORTS.map(s => (
              <option key={s.value} value={s.value}>
                {language === 'fr' ? s.labelFr : s.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Category tabs */}
        <div
          className="flex gap-2 flex-wrap mb-4"
          role="group"
          aria-label={t({ en: 'Filter by category', fr: 'Filtrer par catégorie' })}
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setParam('category', cat.value)}
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
              onClick={() => setParam('condition', cond.value)}
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
            onClick={() => setParam('stock', stockOnly ? '' : '1')}
            aria-pressed={stockOnly}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${
              stockOnly
                ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                : 'border-brand-grey/40 text-brand-dark/60 hover:border-brand-blue/40'
            }`}
          >
            {t({ en: 'In stock only', fr: 'En stock uniquement' })}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center text-brand-dark/40">
            <p className="text-xl font-medium mb-2">
              {t({ en: 'No products found', fr: 'Aucun produit trouvé' })}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-brand-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
              >
                {t({ en: 'Clear filters', fr: 'Effacer les filtres' })}
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-brand-dark/40 mb-6">
              {filtered.length} {t({ en: 'product(s)', fr: 'produit(s)' })}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-3 text-brand-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
                >
                  {t({ en: 'Clear filters', fr: 'Effacer les filtres' })}
                </button>
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>

      <footer className="py-12 px-6 border-t border-brand-grey/20 text-center text-brand-dark/50 text-sm">
        © 2026 Loving Tech Cameroun.{' '}
        {t({ en: 'All rights reserved.', fr: 'Tous droits réservés.' })}
      </footer>
    </main>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ProductsContent />
    </Suspense>
  )
}
