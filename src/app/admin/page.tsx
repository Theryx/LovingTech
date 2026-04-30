'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { LOCAL_PRODUCTS, ProductWithFeatured } from '@/lib/localProducts'
import { Product, Order, Review } from '@/lib/supabase'

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>(LOCAL_PRODUCTS as Product[])
  const [stats, setStats] = useState({ todayCount: 0, todayRevenue: 0, pendingCount: 0 })
  const [pendingReviews, setPendingReviews] = useState(0)

  useEffect(() => {
    fetch('/api/products')
      .then(r => {
        if (r.ok) return r.json()
        return []
      })
      .then(data => {
        if (data?.length > 0) setProducts(data)
      })
      .catch(err => console.error('Failed to load products for dashboard:', err))
    fetch('/api/orders')
      .then(r => {
        if (!r.ok) return { stats: { todayCount: 0, todayRevenue: 0, pendingCount: 0 } }
        return r.json()
      })
      .then((data: any) => {
        setStats(data.stats || { todayCount: 0, todayRevenue: 0, pendingCount: 0 })
      })
      .catch(err => console.error('Failed to load order stats:', err))
    fetch('/api/reviews')
      .then(r => {
        if (!r.ok) return []
        return r.json()
      })
      .then((data: Review[]) => setPendingReviews(data.filter(r => r.status === 'pending').length))
      .catch(err => console.error('Failed to load pending review count:', err))
  }, [])

  const featuredCount = products.filter(p => (p as ProductWithFeatured).featured).length

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-8 text-3xl font-bold text-brand-dark">
        {t({ en: 'Dashboard', fr: 'Tableau de bord' })}
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/products"
          className="group rounded-xl border border-brand-grey/20 bg-white p-6 transition hover:border-brand-blue/40"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-dark/50">
              {t({ en: 'Total Products', fr: 'Produits total' })}
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
              {t({ en: 'Orders today', fr: "Commandes aujourd'hui" })}
            </span>
            <ArrowRight className="h-4 w-4 text-brand-grey transition-transform group-hover:translate-x-1 group-hover:text-brand-blue" />
          </div>
          <span className="text-4xl font-bold text-brand-dark">{stats.todayCount}</span>
        </Link>

        <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <div className="mb-4">
            <span className="text-sm font-medium text-brand-dark/50">
              {t({ en: 'Revenue today', fr: "Revenu aujourd'hui" })}
            </span>
          </div>
          <span className="text-4xl font-bold text-brand-dark">
            {stats.todayRevenue.toLocaleString('fr-FR')}
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
              {t({ en: 'Pending orders', fr: 'Commandes en attente' })}
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
            {t({ en: 'Quick Actions', fr: 'Actions rapides' })}
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/admin/products/new"
              className="flex items-center justify-between rounded-lg bg-brand-grey/10 p-4 transition hover:bg-brand-grey/20"
            >
              <span className="font-medium text-brand-dark">
                {t({ en: 'Add New Product', fr: 'Ajouter un produit' })}
              </span>
              <ArrowRight className="h-4 w-4 text-brand-blue" />
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center justify-between rounded-lg bg-brand-grey/10 p-4 transition hover:bg-brand-grey/20"
            >
              <span className="font-medium text-brand-dark">
                {t({ en: 'View all orders', fr: 'Voir toutes les commandes' })}
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
                {t({ en: 'Reviews to approve', fr: 'Avis à approuver' })}
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
                {t({ en: 'Manage delivery zones', fr: 'Gérer les zones de livraison' })}
              </span>
              <ArrowRight className="h-4 w-4 text-brand-blue" />
            </Link>
            {stats.pendingCount > 0 && (
              <Link
                href="/admin/orders?status=pending"
                className="flex items-center justify-between rounded-lg bg-brand-orange/10 p-4 transition hover:bg-brand-orange/20"
              >
                <span className="font-medium text-brand-orange">
                  {t({
                    en: `View ${stats.pendingCount} pending order${stats.pendingCount > 1 ? 's' : ''} →`,
                    fr: `Voir ${stats.pendingCount} commande${stats.pendingCount > 1 ? 's' : ''} en attente →`,
                  })}
                </span>
                <ArrowRight className="h-4 w-4 text-brand-orange" />
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-brand-dark">
            {t({ en: 'Featured Products', fr: 'Produits en vedette' })}
          </h2>
          <p className="text-brand-dark/50">
            {featuredCount}{' '}
            {t({
              en: 'products featured on homepage',
              fr: 'produits mis en avant sur la page principale',
            })}
          </p>
          <Link
            href="/admin/products"
            className="mt-3 inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
          >
            {t({ en: 'Manage products', fr: 'Gérer les produits' })}{' '}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
