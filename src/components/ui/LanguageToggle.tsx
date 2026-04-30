'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage()

  return (
    <div
      className="inline-flex items-center bg-brand-grey/10 rounded-full p-1 border border-brand-grey/20"
      role="group"
      aria-label="Language selection"
    >
      <button
        onClick={() => language === 'en' && toggleLanguage()}
        aria-label="Français"
        aria-pressed={language === 'fr'}
        className={cn(
          'px-4 py-1.5 rounded-full text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-1',
          language === 'fr'
            ? 'bg-brand-blue text-white shadow-sm'
            : 'text-brand-dark/60 hover:text-brand-dark'
        )}
      >
        FR
      </button>
      <button
        onClick={() => language === 'fr' && toggleLanguage()}
        aria-label="English"
        aria-pressed={language === 'en'}
        className={cn(
          'px-4 py-1.5 rounded-full text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-1',
          language === 'en'
            ? 'bg-brand-blue text-white shadow-sm'
            : 'text-brand-dark/60 hover:text-brand-dark'
        )}
      >
        EN
      </button>
    </div>
  )
}

export default LanguageToggle
