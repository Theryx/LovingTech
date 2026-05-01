'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import {
  Package,
  ShoppingBag,
  LayoutDashboard,
  ArrowLeft,
  Globe,
  Star,
  Tag,
  Truck,
  LogOut,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const labels = {
  dashboard: { en: 'Dashboard', fr: 'Tableau de bord' },
  products: { en: 'Products', fr: 'Produits' },
  orders: { en: 'Orders', fr: 'Commandes' },
  reviews: { en: 'Reviews', fr: 'Avis' },
  promos: { en: 'Promos', fr: 'Codes' },
  delivery: { en: 'Delivery', fr: 'Livraison' },
  backToStore: { en: 'Back to Store', fr: 'Retour à la boutique' },
} as const

type LabelKey = keyof typeof labels

const adminNav: { group: string; items: { href: string; labelKey: LabelKey; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  {
    group: 'commerce',
    items: [
      { href: '/admin', labelKey: 'dashboard', icon: LayoutDashboard },
      { href: '/admin/products', labelKey: 'products', icon: Package },
      { href: '/admin/orders', labelKey: 'orders', icon: ShoppingBag },
      { href: '/admin/delivery', labelKey: 'delivery', icon: Truck },
    ],
  },
  {
    group: 'content',
    items: [
      { href: '/admin/reviews', labelKey: 'reviews', icon: Star },
      { href: '/admin/promos', labelKey: 'promos', icon: Tag },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { language, toggleLanguage, t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin-login', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-brand-grey/5 text-brand-dark">
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-brand-grey/20 bg-white px-6 py-3"
        aria-label="Admin navigation"
      >
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-brand-dark/50 transition hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium whitespace-nowrap">{t(labels.backToStore)}</span>
          </Link>
          <div className="h-5 w-px bg-brand-grey/30" aria-hidden="true" />
          <Link
            href="/admin"
            className="flex items-center gap-2 text-lg font-black italic tracking-tighter text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
          >
            <img src="/logo.png" alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
            ADMIN
          </Link>
        </div>

        <div className="relative flex items-center">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {adminNav.map((group, gi) => (
              <div key={group.group} className="flex items-center gap-1">
                {gi > 0 && (
                  <div
                    className="h-5 w-px bg-brand-grey/30 mx-1 shrink-0"
                    aria-hidden="true"
                  />
                )}
                {group.items.map(item => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href))
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue whitespace-nowrap ${
                        isActive
                          ? 'bg-brand-blue text-white'
                          : 'text-brand-dark/50 hover:bg-brand-grey/10 hover:text-brand-blue'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="hidden sm:inline">{t(labels[item.labelKey])}</span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="ml-2 flex items-center gap-1 shrink-0">
            <button
              onClick={toggleLanguage}
              aria-label={language === 'en' ? 'Passer en français' : 'Switch to English'}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-dark/50 transition hover:bg-brand-grey/10 hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span className="uppercase text-xs font-bold">{language}</span>
            </button>
            <button
              onClick={logout}
              aria-label="Logout"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-dark/50 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>
      <main className="px-6 pb-12 pt-16">{children}</main>
    </div>
  )
}