'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Users, LayoutDashboard, ArrowLeft, Globe } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

type AdminNavItem = {
  href: string;
  labelKey: 'dashboard' | 'products' | 'leads';
  icon: typeof LayoutDashboard;
};

const adminNav: AdminNavItem[] = [
  { href: '/admin', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/admin/products', labelKey: 'products', icon: Package },
  { href: '/admin/leads', labelKey: 'leads', icon: Users },
];

const labels = {
  dashboard: { en: 'Dashboard', fr: 'Tableau de bord' },
  products: { en: 'Products', fr: 'Produits' },
  leads: { en: 'Leads', fr: 'Prospects' },
  backToStore: { en: 'Back to Store', fr: 'Retour à la boutique' },
} as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t(labels.backToStore)}</span>
          </Link>
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
          <Link href="/admin" className="text-lg font-bold italic tracking-tighter text-zinc-900 dark:text-white">
            ADMIN
          </Link>
        </div>
        <div className="flex items-center gap-1">
          {adminNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(labels[item.labelKey])}
              </Link>
            );
          })}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title={language === 'en' ? 'Passer en français' : 'Switch to English'}
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase">{language}</span>
          </button>
        </div>
      </nav>
      <main className="pt-20 px-6 pb-12">{children}</main>
    </div>
  );
}