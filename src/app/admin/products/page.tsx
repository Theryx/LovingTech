'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Star,
  Pencil,
  Trash2,
  AlertCircle,
  Database,
  Package,
  X,
  ArrowUpDown,
} from 'lucide-react'
import { useNotifications } from '@/components/NotificationProvider'
import { Product } from '@/lib/supabase'
import { LOCAL_PRODUCTS, ProductWithFeatured } from '@/lib/localProducts'

const CONDITION_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: '#D1FAE5', text: '#065F46', label: 'New' },
  refurbished: { bg: '#DBEAFE', text: '#1E3A8A', label: 'Refurbished' },
  second_hand: { bg: '#FEF3C7', text: '#92400E', label: 'Second-hand' },
}

const STOCK_STATUS_OPTIONS = [
  { value: '', label: 'All Stock' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'pre_order', label: 'Pre-order' },
]

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'keyboards', label: 'Keyboards' },
  { value: 'mice', label: 'Mice' },
  { value: 'audio', label: 'Audio' },
  { value: 'charging-power', label: 'Charging & Power' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'accessories', label: 'Accessories' },
]

const CONDITION_OPTIONS = [
  { value: '', label: 'All Conditions' },
  { value: 'new', label: 'New' },
  { value: 'refurbished', label: 'Refurbished' },
  { value: 'second_hand', label: 'Second-hand' },
]

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'name_asc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'name_asc', label: 'Name A-Z' },
]

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
  const { confirm, error: notifyError, success } = useNotifications()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterBrand, setFilterBrand] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterCondition, setFilterCondition] = useState('')
  const [filterStock, setFilterStock] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
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
      setError(err.message || 'Failed to connect to database. Showing local products.')
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
        title: 'Delete Product',
        message: `Are you sure you want to delete this product? This action cannot be undone.\n\n"${name}"`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        tone: 'danger',
      }
    )
    if (!confirmed) return
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      setProducts(products.filter(p => p.id !== id))
      success('Product deleted.')
    } catch {
      notifyError('Failed to delete product.')
    }
  }

  const filteredProducts = (() => {
    let result = products.filter(p => {
      const nameMatch = p.name?.toLowerCase().includes(search.toLowerCase()) || false
      const descMatch = p.description?.toLowerCase().includes(search.toLowerCase()) || false
      const matchesSearch = nameMatch || descMatch
      const matchesBrand = !filterBrand || p.brand === filterBrand
      const matchesCategory = !filterCategory || p.category === filterCategory
      const matchesCondition = !filterCondition || p.condition === filterCondition
      const matchesStock = !filterStock || p.stock_status === filterStock
      return matchesSearch && matchesBrand && matchesCategory && matchesCondition && matchesStock
    })

    switch (sort) {
      case 'price_asc':
        return result.sort((a, b) => (a.price_xaf || 0) - (b.price_xaf || 0))
      case 'price_desc':
        return result.sort((a, b) => (b.price_xaf || 0) - (a.price_xaf || 0))
      case 'name_asc':
        return result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      default:
        return result
    }
  })()

  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)))

  const hasFilters = filterBrand || filterCategory || filterCondition || filterStock || search

  const clearFilters = () => {
    setSearch('')
    setFilterBrand('')
    setFilterCategory('')
    setFilterCondition('')
    setFilterStock('')
    setSort('newest')
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'XAF' }).format(price)

  const selectCls =
    'w-full appearance-none rounded-xl border border-brand-grey/30 bg-white py-2.5 pl-4 pr-8 text-brand-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer'

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-brand-dark">Products</h1>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isLocal ? 'bg-brand-orange/15 text-brand-orange' : 'bg-brand-blue/15 text-brand-blue'
              }`}
            >
              {isLocal ? <AlertCircle className="w-3 h-3" /> : <Database className="w-3 h-3" />}
              {isLocal ? 'Local Data' : 'Database'}
            </span>
          </div>
          <p className="text-brand-grey">Manage your product catalog and inventory</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Product
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
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-grey"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-brand-grey/30 bg-white py-2.5 pl-10 pr-4 text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <div className="relative w-full sm:w-44">
            <ArrowUpDown
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-grey"
              aria-hidden="true"
            />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className={selectCls}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-44">
            <select
              value={filterBrand}
              onChange={e => setFilterBrand(e.target.value)}
              className={selectCls}
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-44">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className={selectCls}
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-44">
            <select
              value={filterCondition}
              onChange={e => setFilterCondition(e.target.value)}
              className={selectCls}
            >
              {CONDITION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-40">
            <select
              value={filterStock}
              onChange={e => setFilterStock(e.target.value)}
              className={selectCls}
            >
              {STOCK_STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-xl border border-brand-grey/30 px-3 py-2.5 text-sm text-brand-dark/60 hover:bg-brand-grey/10 transition"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}

          <span className="text-sm text-brand-dark/40 ml-auto">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </span>
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
                    Product
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                    Brand
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                    Price
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                    Condition
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                    Stock
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                    Featured
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <Package className="mx-auto mb-3 h-10 w-10 text-brand-dark/20" />
                      <p className="text-brand-dark/40">No products found</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr
                      key={product.id}
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                      className="border-b border-brand-grey/10 transition hover:bg-brand-grey/5 cursor-pointer"
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
                            ? 'In Stock'
                            : product.stock_status === 'out_of_stock'
                              ? 'Out of Stock'
                              : 'Pre-order'}
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
                            aria-label="Edit product"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          {!isLocal && (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                handleDelete(product.id, product.name)
                              }}
                              className="rounded-lg p-2 text-brand-dark/40 transition hover:bg-red-50 hover:text-red-500"
                              aria-label="Delete product"
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
