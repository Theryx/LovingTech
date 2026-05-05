'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import LanguageToggle from './ui/LanguageToggle'

export default function Navbar() {
  const { language } = useLanguage()

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

      <div className="flex items-center gap-4">
        <Link
          href="/about"
          className="text-sm font-medium text-brand-dark/70 hover:text-brand-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 rounded px-2 py-1"
        >
          {language === 'fr' ? 'À propos' : 'About Us'}
        </Link>
        <LanguageToggle />
      </div>
    </nav>
  )
}
