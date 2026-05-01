'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  Star,
  Pencil,
  Trash2,
  AlertCircle,
  Database,
  Package,
} from 'lucide-react'
import { useNotifications } from '@/components/NotificationProvider'
import { Product } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'
import { LOCAL_PRODUCTS, ProductWithFeatured } from '@/lib/localProducts'

const CONDITION_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: '#D1FAE5', text: '#065F46', label: 'Neuf' },
  refurbished: { bg: '#DBEAFE', text: '#1E3A8A', label: 'Reconditionné' },
  second_hand: { bg: '#FEF3C7', text: '#92400E', label: 'Occasion' },
}

const labels = {
  products: { en: 'Products', fr: 'Produits' },
  addProduct: { en: 'Add Product', fr: 'Ajouter' },
  searchProducts: { en: 'Search products...', fr: 'Rechercher...' },
  allBrands: { en: 'All Brands', fr: 'Toutes' },
  product: { en: 'Product', fr: 'Produit' },
  brand: { en: 'Brand', fr: 'Marque' },
  price: { en: 'Price', fr: 'Prix' },
  stock: { en: 'Stock', fr: 'Stock' },
  condition: { en: 'Condition', fr: 'État' },
  featured: { en: 'Featured', fr: 'Vedette' },
  actions: { en: 'Actions', fr: 'Actions' },
  inStock: { en: 'In Stock', fr: 'En stock' },
  outOfStock: { en: 'Out of Stock', fr: 'Rupture' },
  preOrder: { en: 'Pre-order', fr: 'Pré-commande' },
  noProducts: { en: 'No products found', fr: 'Aucun produit' },
  loadingError: {
    en: 'Failed to connect to database. Showing local products.',
    fr: 'Connexion échouée. Affichage des produits locaux.',
  },
  retry: { en: 'Retry', fr: 'Réessayer' },
  usingLocal: { en: 'Local Data', fr: 'Données locales' },
  usingDb: { en: 'Database', fr: 'Base de données' },
  deleteProduct: { en: 'Delete Product', fr: 'Supprimer le produit' },
  deleteConfirm: {
    en: 'Are you sure you want to delete this product? This action cannot be undone.',
    fr: 'Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.',
  },
  delete: { en: 'Delete', fr: 'Supprimer' },
  cancel: { en: 'Cancel', fr: 'Annuler' },
  deleteSuccess: { en: 'Product deleted.', fr: 'Produit supprimé.' },
}

function ProductSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border border-brand-grey/20 bg-white">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-brand-grey/20">
            {[...Array(7)].map((_, i) => (
              <th key={i} className="px-6 py-4">
                <div className="h-4 w-20 rounded bg-brand-grey/10 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b border-brand-grey/10">
              {[...Array(7)].map((_, j) => (
                <td key={j} className="px-6 py-4">
                  <div className={`rounded animate-pulse ${j === 0 ? 'h-10 w-10' : 'h-4 w-24'} bg-brand-grey/10`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminProductsPage() {
  const { t } = useLanguage()
  const { confirm, error: notifyError, success } = useNotifications()
  const [search, setSearch] = useState('')
  const [filterBrand, setFilterBrand] = useState<string>('')
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isLocal, setIsLocal] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/products')
      if (!res.ok) {
        let apiError = ''
        try {
          const body = await res.json()
          apiError = body.error || ''
        } catch {}
        throw new Error(apiError || `HTTP ${res.status}`)
      }
      const dbProducts = await res.json()
      if (dbProducts && dbProducts.length > 0) {
        setProducts(dbProducts as Product[])
        setIsLocal(false)
      } else {
        setProducts(LOCAL_PRODUCTS as unknown as Product[])
        setIsLocal(true)
      }
    } catch (err: any) {
      setError(err.message || t(labels.loadingError))
      setProducts(LOCAL_PRODUCTS as unknown as Product[])
      setIsLocal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (isLocal) return
    const confirmed = await confirm(
      {
        title: t(labels.deleteProduct),
        message: `${t(labels.deleteConfirm)}\n\n"${name}"`,
        confirmLabel: t(labels.delete),
        cancelLabel: t(labels.cancel),
        tone: 'danger',
      }
    )
    if (!confirmed) return
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      setProducts(products.filter(p => p.id !== id))
      success(t(labels.deleteSuccess))
    } catch {
      notifyError('Failed to delete product.')
    }
  }

  const filteredProducts = products.filter(p => {
    const nameMatch = p.name?.toLowerCase().includes(search.toLowerCase()) || false
    const descMatch = p.description?.toLowerCase().includes(search.toLowerCase()) || false
    const matchesSearch = nameMatch || descMatch
    const matchesBrand = !filterBrand || p.brand === filterBrand
    return matchesSearch && matchesBrand
  })

  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)))

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(price)

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-brand-dark">{t(labels.products)}</h1>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isLocal ? 'bg-brand-orange/15 text-brand-orange' : 'bg-brand-blue/15 text-brand-blue'
              }`}
            >
              {isLocal ? <AlertCircle className="w-3 h-3" /> : <Database className="w-3 h-3" />}
              {isLocal ? t(labels.usingLocal) : t(labels.usingDb)}
            </span>
          </div>
          <p className="text-brand-grey">Manage your product catalog and inventory</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t(labels.addProduct)}
        </Link>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-brand-orange/20 bg-brand-orange/10 p-4 text-brand-orange">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="flex-1 text-sm">{error}</p>
          <button
            onClick={() => loadProducts()}
            className="shrink-0 rounded-lg border border-brand-orange/30 px-3 py-1.5 text-xs font-medium hover:bg-brand-orange/10 transition"
          >
            {t(labels.retry)}
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-grey"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={t(labels.searchProducts)}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-brand-grey/30 bg-white py-2.5 pl-10 pr-4 text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <Filter
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-grey"
            aria-hidden="true"
          />
          <select
            value={filterBrand}
            onChange={e => setFilterBrand(e.target.value)}
            className="w-full appearance-none rounded-xl border border-brand-grey/30 bg-white py-2.5 pl-10 pr-8 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer"
          >
            <option value="">{t(labels.allBrands)}</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <ProductSkeleton />
      ) : (
        <div className="relative">
          <div className="overflow-x-auto rounded-xl border border-brand-grey/20 bg-white [&::after]:absolute [&::after]:top-0 [&::after]:right-0 [&::after]:bottom-0 [&::after]:w-8 [&::after]:bg-gradient-to-l [&::after]:from-white [&::after]:to-transparent [&::after]:pointer-events-none">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-brand-grey/20">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                    {t(labels.product)}
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                    {t(labels.brand)}
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                    {t(labels.price)}
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                    {t(labels.condition)}
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                    {t(labels.stock)}
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                    {t(labels.featured)}
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                    {t(labels.actions)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <Package className="mx-auto mb-3 h-10 w-10 text-brand-dark/20" />
                      <p className="text-brand-dark/40">{t(labels.noProducts)}</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr
                      key={product.id}
                      className="border-b border-brand-grey/10 transition hover:bg-brand-grey/5"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-grey/10">
                            <img
                              src={product.images?.[0] || '/images/placeholder.svg'}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={e => {
                                ;(e.target as HTMLImageElement).src = '/images/placeholder.svg'
                              }}
                            />
                          </div>
                          <span className="font-medium text-brand-dark leading-tight line-clamp-1">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-brand-dark/60">{product.brand || '—'}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-brand-dark">
                        {formatPrice(product.price_xaf)}
                      </td>
                      <td className="px-5 py-4">
                        {product.condition && CONDITION_STYLE[product.condition] ? (
                          <span
                            className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full"
                            style={{
                              backgroundColor: CONDITION_STYLE[product.condition].bg,
                              color: CONDITION_STYLE[product.condition].text,
                            }}
                          >
                            {CONDITION_STYLE[product.condition].label}
                          </span>
                        ) : (
                          <span className="text-xs text-brand-dark/30">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            product.stock_status === 'in_stock'
                              ? 'bg-brand-blue/15 text-brand-blue'
                              : product.stock_status === 'out_of_stock'
                                ? 'bg-brand-dark text-white'
                                : 'bg-brand-orange/15 text-brand-orange'
                          }`}
                        >
                          {product.stock_status === 'in_stock'
                            ? t(labels.inStock)
                            : product.stock_status === 'out_of_stock'
                              ? t(labels.outOfStock)
                              : t(labels.preOrder)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {(product as ProductWithFeatured).featured ? (
                          <Star
                            className="mx-auto h-4 w-4 fill-brand-orange text-brand-orange"
                            aria-label="Featured"
                          />
                        ) : (
                          <Star className="mx-auto h-4 w-4 text-brand-dark/20" aria-label="Not featured" />
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="rounded-lg p-2 text-brand-dark/40 transition hover:bg-brand-grey/10 hover:text-brand-blue"
                            aria-label={t({ en: 'Edit product', fr: 'Modifier' })}
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          {!isLocal && (
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="rounded-lg p-2 text-brand-dark/40 transition hover:bg-red-50 hover:text-red-500"
                              aria-label={t({ en: 'Delete product', fr: 'Supprimer' })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}