'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LOCAL_PRODUCTS, ProductWithFeatured } from '@/lib/localProducts'
import { Product, Order, Review } from '@/lib/supabase'

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>(LOCAL_PRODUCTS as Product[])
  const [stats, setStats] = useState({ todayCount: 0, todayRevenue: 0, pendingCount: 0 })
  const [pendingReviews, setPendingReviews] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/products'),
      fetch('/api/orders'),
      fetch('/api/reviews'),
    ])
      .then(([p, o, r]) => Promise.all([p.ok ? p.json() : [], o.ok ? o.json() : { stats: { todayCount: 0, todayRevenue: 0, pendingCount: 0 } }, r.ok ? r.json() : []]))
      .then(([productsData, ordersData, reviewsData]: [any, any, Review[]]) => {
        if (productsData?.length > 0) setProducts(productsData)
        setStats(ordersData.stats || { todayCount: 0, todayRevenue: 0, pendingCount: 0 })
        setPendingReviews(Array.isArray(reviewsData) ? reviewsData.filter((r: Review) => r.status === 'pending').length : 0)
      })
      .catch(err => console.error('Failed to load dashboard data:', err))
      .finally(() => setLoading(false))
  }, [])

  const featuredCount = products.filter(p => (p as ProductWithFeatured).featured).length

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-8">
        <div className="h-9 w-40 rounded bg-brand-grey/10" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-brand-grey/20 bg-white p-6">
              <div className="mb-4 h-4 w-24 rounded bg-brand-grey/10" />
              <div className="h-8 w-16 rounded bg-brand-grey/10" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-xl border border-brand-grey/20 bg-white p-6">
              <div className="mb-4 h-5 w-32 rounded bg-brand-grey/10" />
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-12 rounded-lg bg-brand-grey/10" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-8 text-3xl font-bold text-brand-dark">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/products"
          className="group rounded-xl border border-brand-grey/20 bg-white p-6 transition hover:border-brand-blue/40"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-dark/50">
              Total Products
            </span>
            <ArrowRight className="h-4 w-4 text-brand-grey transition-transform group-hover:translate-x-1 group-hover:text-brand-blue" />
          </div>
          <span className="text-4xl font-bold text-brand-dark">{products.length}</span>
        </Link>

        <Link
          href="/admin/orders"
          className="group rounded-xl border border-brand-grey/20 bg-white p-6 transition hover:border-brand-blue/40"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-dark/50">
              Orders today
            </span>
            <ArrowRight className="h-4 w-4 text-brand-grey transition-transform group-hover:translate-x-1 group-hover:text-brand-blue" />
          </div>
          <span className="text-4xl font-bold text-brand-dark">{stats.todayCount}</span>
        </Link>

        <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <div className="mb-4">
            <span className="text-sm font-medium text-brand-dark/50">
              Revenue today
            </span>
          </div>
          <span className="text-4xl font-bold text-brand-dark">
            {(stats.todayRevenue || 0).toLocaleString('en-US')}
          </span>
          <span className="ml-1 text-sm text-brand-dark/40">FCFA</span>
        </div>

        <Link
          href="/admin/orders?status=pending"
          className={`group rounded-xl border p-6 transition ${stats.pendingCount > 0 ? 'border-brand-orange/40 bg-brand-orange/5 hover:border-brand-orange/60' : 'border-brand-grey/20 bg-white hover:border-brand-blue/40'}`}
        >
          <div className="mb-4 flex items-center justify-between">
            <span
              className={`text-sm font-medium ${stats.pendingCount > 0 ? 'text-brand-orange' : 'text-brand-dark/50'}`}
            >
              Pending orders
            </span>
            <ArrowRight
              className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${stats.pendingCount > 0 ? 'text-brand-orange' : 'text-brand-grey group-hover:text-brand-blue'}`}
            />
          </div>
          <span
            className={`text-4xl font-bold ${stats.pendingCount > 0 ? 'text-brand-orange' : 'text-brand-dark'}`}
          >
            {stats.pendingCount}
          </span>
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-brand-dark">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/admin/products/new"
              className="flex items-center justify-between rounded-lg bg-brand-grey/10 p-4 transition hover:bg-brand-grey/20"
            >
              <span className="font-medium text-brand-dark">
                Add New Product
              </span>
              <ArrowRight className="h-4 w-4 text-brand-blue" />
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center justify-between rounded-lg bg-brand-grey/10 p-4 transition hover:bg-brand-grey/20"
            >
              <span className="font-medium text-brand-dark">
                View all orders
              </span>
              <ArrowRight className="h-4 w-4 text-brand-blue" />
            </Link>
            <Link
              href="/admin/reviews?status=pending"
              className={`flex items-center justify-between rounded-lg p-4 transition ${pendingReviews > 0 ? 'bg-amber-50 hover:bg-amber-100' : 'bg-brand-grey/10 hover:bg-brand-grey/20'}`}
            >
              <span
                className={`font-medium ${pendingReviews > 0 ? 'text-amber-800' : 'text-brand-dark'}`}
              >
                Reviews to approve
                {pendingReviews > 0 && (
                  <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">
                    {pendingReviews}
                  </span>
                )}
              </span>
              <ArrowRight
                className={`h-4 w-4 ${pendingReviews > 0 ? 'text-amber-600' : 'text-brand-blue'}`}
              />
            </Link>
            <Link
              href="/admin/delivery"
              className="flex items-center justify-between rounded-lg bg-brand-grey/10 p-4 transition hover:bg-brand-grey/20"
            >
              <span className="font-medium text-brand-dark">
                Manage delivery zones
              </span>
              <ArrowRight className="h-4 w-4 text-brand-blue" />
            </Link>
            {stats.pendingCount > 0 && (
              <Link
                href="/admin/orders?status=pending"
                className="flex items-center justify-between rounded-lg bg-brand-orange/10 p-4 transition hover:bg-brand-orange/20"
              >
                <span className="font-medium text-brand-orange">
                  View {stats.pendingCount} pending order{stats.pendingCount > 1 ? 's' : ''} →
                </span>
                <ArrowRight className="h-4 w-4 text-brand-orange" />
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-brand-dark">
            Featured Products
          </h2>
          <p className="text-brand-dark/50">
            {featuredCount}{' '}
            products featured on homepage
          </p>
          <Link
            href="/admin/products"
            className="mt-3 inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
          >
            Manage products{' '}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
