'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import LanguageToggle from './ui/LanguageToggle'

const NAV_LINKS = [
  { href: '/products', labelEn: 'Products', labelFr: 'Produits' },
  { href: '/faq', labelEn: 'FAQ', labelFr: 'FAQ' },
  { href: '/about-us', labelEn: 'About Us', labelFr: 'À propos' },
  { href: '/contact', labelEn: 'Contact', labelFr: 'Contact' },
]

export default function Navbar() {
  const { language, t } = useLanguage()
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-4 sm:px-6 flex items-center justify-between bg-white/90 backdrop-blur-xl border-b border-brand-grey/20">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2.5 text-xl font-bold italic tracking-tighter text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 rounded shrink-0"
          aria-label={t({ en: 'Loving Tech — Back to home', fr: "Loving Tech — Retour à l'accueil" })}
        >
          <img src="/logo.png" alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
          <span className="hidden sm:inline">LOVING TECH</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-brand-dark/60 hover:text-brand-dark hover:bg-brand-grey/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              {language === 'fr' ? link.labelFr : link.labelEn}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden md:block">
            <LanguageToggle />
          </div>

          <Link
            href="/cart"
            className="relative flex items-center justify-center p-2 text-brand-dark/70 hover:text-brand-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg"
            aria-label={t({ en: 'View cart', fr: 'Voir le panier' })}
            onClick={() => setMenuOpen(false)}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white min-w-[18px] min-h-[18px]">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t({ en: 'Toggle menu', fr: 'Ouvrir le menu' })}
            aria-expanded={menuOpen}
            className="md:hidden flex items-center justify-center p-2 text-brand-dark/70 hover:text-brand-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile slide-out menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Menu panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl md:hidden flex flex-col"
            >
              {/* Menu header */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-brand-grey/20 shrink-0">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="" aria-hidden="true" className="h-7 w-7 object-contain" />
                  <span className="font-bold italic text-brand-dark text-lg">LOVING TECH</span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label={t({ en: 'Close menu', fr: 'Fermer le menu' })}
                  className="p-2 text-brand-dark/50 hover:text-brand-dark transition-colors rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu links */}
              <div className="flex-1 overflow-y-auto py-4 px-4">
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-brand-dark hover:bg-brand-grey/10 transition-colors"
                      >
                        <span>{language === 'fr' ? link.labelFr : link.labelEn}</span>
                        <ChevronRight className="h-4 w-4 text-brand-dark/20" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Menu footer */}
              <div className="shrink-0 px-4 py-4 border-t border-brand-grey/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brand-dark/50">
                    {t({ en: 'Language', fr: 'Langue' })}
                  </span>
                  <LanguageToggle />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
