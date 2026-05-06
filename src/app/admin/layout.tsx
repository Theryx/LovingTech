'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import {
  Package,
  ShoppingBag,
  LayoutDashboard,
  Star,
  Tag,
  Truck,
  LogOut,
  LayoutGrid,
  Menu,
  X,
  BarChart3,
  Building2,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const adminNav: { group: string; items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  {
    group: 'commerce',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
      { href: '/admin/out-of-stock-demand', label: 'OOS Demand', icon: BarChart3 },
      { href: '/admin/delivery', label: 'Delivery', icon: Truck },
    ],
  },
  {
    group: 'content',
    items: [
      { href: '/admin/reviews', label: 'Reviews', icon: Star },
      { href: '/admin/promos', label: 'Promos', icon: Tag },
      { href: '/admin/categories', label: 'Categories', icon: LayoutGrid },
      { href: '/admin/brands', label: 'Brands', icon: Building2 },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function logout() {
    await fetch('/api/admin-login', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }

  const renderNavItems = (onClick?: () => void) => (
    <>
      {adminNav.map((group, gi) => (
        <div key={group.group} className="flex flex-col sm:flex-row sm:items-center gap-1">
          {gi > 0 && <div className="hidden sm:block h-5 w-px bg-brand-grey/30 mx-1 shrink-0" aria-hidden="true" />}
          {gi > 0 && <div className="sm:hidden my-2 border-t border-brand-grey/10" aria-hidden="true" />}
          {group.items.map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClick}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-blue text-white'
                    : 'text-brand-dark/50 hover:bg-brand-grey/10 hover:text-brand-blue'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </>
  )

  return (
    <div className="min-h-screen bg-brand-grey/5 text-brand-dark">
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-brand-grey/20 bg-white px-4 sm:px-6 py-3"
        aria-label="Admin navigation"
      >
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-lg font-black italic tracking-tighter text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
          >
            <img src="/logo.png" alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
            ADMIN
          </Link>
        </div>

        {/* Desktop nav items */}
        <div className="hidden sm:flex relative items-center">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {renderNavItems()}
          </div>

          <div className="ml-2 flex items-center gap-1 shrink-0">
            <button
              onClick={logout}
              aria-label="Logout"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-dark/50 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mobile hamburger + logout */}
        <div className="flex sm:hidden items-center gap-1">
          <button
            onClick={logout}
            aria-label="Logout"
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-brand-dark/50 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex items-center rounded-lg p-2 text-brand-dark/50 transition hover:bg-brand-grey/10 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] sm:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-grey/20">
              <span className="text-sm font-semibold text-brand-dark">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-brand-dark/50 hover:bg-brand-grey/10 hover:text-brand-dark transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
              {renderNavItems(() => setMobileOpen(false))}
            </div>
            <div className="px-5 py-3 border-t border-brand-grey/10">
              <span className="text-xs text-brand-dark/30">{new Date().getFullYear()} Loving Tech</span>
            </div>
          </div>
        </div>
      )}

      <main className="px-4 sm:px-6 pb-12 pt-16">{children}</main>
    </div>
  )
}
