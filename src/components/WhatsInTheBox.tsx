'use client'

import { Check } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface WhatsInTheBoxProps {
  boxContents?: string[]
  boxContentsFr?: string[]
}

export default function WhatsInTheBox({
  boxContents = [],
  boxContentsFr = [],
}: WhatsInTheBoxProps) {
  const { t, language } = useLanguage()

  // Use French content if available and language is FR, otherwise use English
  const items = language === 'fr' && boxContentsFr.length > 0 
    ? boxContentsFr 
    : boxContents

  if (items.length === 0) {
    return (
      <p className="text-sm text-brand-dark/40">
        {t({
          en: 'Package contents information not available',
          fr: "Informations sur le contenu du colis non disponibles",
        })}
      </p>
    )
  }

  return (
    <div>
      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-blue">
        {t({ en: "What's in the Box", fr: 'Contenu du colis' })}
      </h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-brand-dark"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
              <Check className="h-3 w-3" />
            </span>
            <span className="text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
