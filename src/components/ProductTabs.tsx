'use client'

import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

interface Tab {
  id: string
  labelEn: string
  labelFr: string
  badge?: number
}

interface ProductTabsProps {
  reviewsCount: number
  children: {
    details: React.ReactNode
    specifications: React.ReactNode
    boxContents: React.ReactNode
    reviews: React.ReactNode
  }
}

export default function ProductTabs({ reviewsCount, children }: ProductTabsProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('details')

  const tabs: Tab[] = [
    { id: 'details', labelEn: 'Summary', labelFr: 'Résumé' },
    { id: 'specifications', labelEn: 'Specifications', labelFr: 'Spécifications' },
    { id: 'boxContents', labelEn: "What's in the box", labelFr: 'Contenu' },
    { id: 'reviews', labelEn: 'Reviews', labelFr: 'Avis', badge: reviewsCount },
  ]

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-brand-grey/20">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-3 pt-1 text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-brand-orange'
                  : 'text-brand-dark/60 hover:text-brand-dark'
              }`}
            >
              {t({ en: tab.labelEn, fr: tab.labelFr })}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                    activeTab === tab.id
                      ? 'bg-brand-orange/15 text-brand-orange'
                      : 'bg-brand-dark/10 text-brand-dark/60'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {activeTab === 'details' && children.details}
        {activeTab === 'specifications' && children.specifications}
        {activeTab === 'boxContents' && children.boxContents}
        {activeTab === 'reviews' && children.reviews}
      </div>
    </div>
  )
}
