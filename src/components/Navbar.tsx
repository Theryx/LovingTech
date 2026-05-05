'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import LanguageToggle from './ui/LanguageToggle'

export default function Navbar() {
  const { language } = useLanguage()
  const { itemCount } = useCart()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-white/90 backdrop-blur-xl border-b border-brand-grey/20">
      <Link
        href="/"
        className="flex items-center gap-2 text-xl font-bold italic tracking-tighter text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 rounded"
        aria-label={
          language === 'fr' ? "Loving Tech — Retour à l'accueil" : 'Loving Tech — Back to home'
        }
      >
        <img src="/logo.png" alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
        LOVING TECH
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href="/about-us"
          className="text-sm font-medium text-brand-dark/70 hover:text-brand-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 rounded px-2 py-1"
        >
          {language === 'fr' ? 'À propos' : 'About Us'}
        </Link>

        <Link
          href="/cart"
          className="relative flex items-center justify-center p-2 text-brand-dark/70 hover:text-brand-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg"
          aria-label={language === 'fr' ? 'Voir le panier' : 'View cart'}
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white min-w-[18px] min-h-[18px]">
              {itemCount}
            </span>
          )}
        </Link>

        <LanguageToggle />
      </div>
    </nav>
  )
}
