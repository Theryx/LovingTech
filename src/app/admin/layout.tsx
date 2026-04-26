'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Package, ShoppingBag, LayoutDashboard, ArrowLeft, Globe, Star, Tag, Truck, LogOut } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const adminNav = [
  { href: '/admin',          labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/admin/products', labelKey: 'products',  icon: Package },
  { href: '/admin/orders',   labelKey: 'orders',    icon: ShoppingBag },
  { href: '/admin/reviews',  labelKey: 'reviews',   icon: Star },
  { href: '/admin/promos',    labelKey: 'promos',    icon: Tag },
  { href: '/admin/delivery',  labelKey: 'delivery',  icon: Truck },
] as const;

const labels = {
  dashboard:   { en: 'Dashboard', fr: 'Tableau de bord' },
  products:    { en: 'Products',  fr: 'Produits' },
  orders:      { en: 'Orders',    fr: 'Commandes' },
  reviews:     { en: 'Reviews',   fr: 'Avis' },
  promos:      { en: 'Promos',    fr: 'Promos' },
  delivery:    { en: 'Delivery',  fr: 'Livraison' },
  backToStore: { en: 'Back to Store', fr: 'Retour à la boutique' },
} as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { language, toggleLanguage, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin-login', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-brand-grey/20 bg-white px-6 py-4" aria-label="Admin navigation">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-brand-dark/50 transition hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium">{t(labels.backToStore)}</span>
          </Link>
          <div className="h-6 w-px bg-brand-grey/30" aria-hidden="true" />
          <Link
            href="/admin"
            className="flex items-center gap-2 text-lg font-bold italic tracking-tighter text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
          >
            <img src="/logo.png" alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
            ADMIN
          </Link>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {adminNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue whitespace-nowrap ${
                  isActive ? 'bg-brand-blue text-white' : 'text-brand-dark/60 hover:bg-brand-grey/10 hover:text-brand-blue'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {t(labels[item.labelKey])}
              </Link>
            );
          })}
          <button
            onClick={toggleLanguage}
            aria-label={language === 'en' ? 'Passer en français' : 'Switch to English'}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-dark/60 transition hover:bg-brand-grey/10 hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span className="uppercase">{language}</span>
          </button>
          <button
            onClick={logout}
            aria-label="Déconnexion / Logout"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-dark/60 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </nav>
      <main className="px-6 pb-12 pt-20">{children}</main>
    </div>
  );
}
