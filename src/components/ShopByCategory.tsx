'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Keyboard, Mouse, Headphones, Cable, Gamepad2, Package } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import MobileCarousel from '@/components/MobileCarousel'

interface Category {
  slug: string
  labelEn: string
  labelFr: string
  descriptionEn?: string
  descriptionFr?: string
  image: string
  icon: 'keyboard' | 'mouse' | 'headphones' | 'cable' | 'gamepad' | 'package'
}

const CATEGORY_ICONS = {
  keyboard: Keyboard,
  mouse: Mouse,
  headphones: Headphones,
  cable: Cable,
  gamepad: Gamepad2,
  package: Package,
}

const CATEGORY_COLORS = {
  keyboard: 'from-blue-500 to-blue-600',
  mouse: 'from-emerald-500 to-emerald-600',
  headphones: 'from-violet-500 to-violet-600',
  cable: 'from-orange-500 to-orange-600',
  gamepad: 'from-rose-500 to-rose-600',
  package: 'from-slate-500 to-slate-600',
}

const FALLBACK_CATEGORIES: Category[] = [
  {
    slug: 'keyboards',
    labelEn: 'Keyboards',
    labelFr: 'Claviers',
    image: '',
    icon: 'keyboard',
  },
  {
    slug: 'mice',
    labelEn: 'Mice',
    labelFr: 'Souris',
    image: '',
    icon: 'mouse',
  },
  {
    slug: 'audio',
    labelEn: 'Audio',
    labelFr: 'Audio',
    image: '',
    icon: 'headphones',
  },
  {
    slug: 'charging-power',
    labelEn: 'Charging & Power',
    labelFr: 'Chargeurs & Power',
    image: '',
    icon: 'cable',
  },
  {
    slug: 'gaming',
    labelEn: 'Gaming',
    labelFr: 'Gaming',
    image: '',
    icon: 'gamepad',
  },
  {
    slug: 'accessories',
    labelEn: 'Accessories',
    labelFr: 'Accessoires',
    image: '',
    icon: 'package',
  },
]

export default function ShopByCategory() {
  const { t } = useLanguage()
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES)

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then((data: { slug: string; label_en: string; label_fr: string; description_en?: string; description_fr?: string; image_url: string | null }[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(
            data.map(cat => ({
              slug: cat.slug,
              labelEn: cat.label_en,
              labelFr: cat.label_fr,
              descriptionEn: cat.description_en,
              descriptionFr: cat.description_fr,
              image: cat.image_url || '',
              icon: (FALLBACK_CATEGORIES.find(f => f.slug === cat.slug)?.icon || 'package') as Category['icon'],
            }))
          )
        }
      })
      .catch(() => {
      })
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-dark/50 mb-1">
            {t({ en: 'Shop by Category', fr: 'Parcourir par catégorie' })}
          </p>
          <h2 className="text-2xl font-bold text-brand-dark">
            {t({ en: 'Find your gear', fr: 'Trouvez votre équipement' })}
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue transition hover:gap-2"
        >
          {t({ en: 'View all', fr: 'Voir tout' })}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

            <MobileCarousel
        items={categories}
        slidesToScroll={2}
        renderItem={(category, i) => {
          const IconComponent = CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS]
          const colorClass = CATEGORY_COLORS[category.icon as keyof typeof CATEGORY_COLORS] || 'from-gray-400 to-gray-500'
          
          return (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-brand-grey/20 bg-white transition hover:shadow-lg hover:scale-[1.02] block h-full"
            >
              <div className="aspect-[4/3] overflow-hidden bg-brand-grey/10">
                {category.image ? (
                  <div
                    className="h-full w-full bg-cover bg-center transition duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url(${category.image})` }}
                  />
                ) : (
                  <div className={`h-full w-full bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                    <IconComponent className="h-12 w-12 text-white opacity-80" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="font-semibold text-brand-dark text-sm">
                  {t({ en: category.labelEn, fr: category.labelFr })}
                </span>
                <ArrowRight className="h-4 w-4 text-brand-grey transition group-hover:text-brand-blue group-hover:translate-x-0.5" />
              </div>
            </Link>
          )
        }}
      >
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(category => {
            const IconComponent = CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS]
            const colorClass = CATEGORY_COLORS[category.icon as keyof typeof CATEGORY_COLORS] || 'from-gray-400 to-gray-500'
            
            return (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-brand-grey/20 bg-white transition hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-brand-grey/10">
                  {category.image ? (
                    <div
                      className="h-full w-full bg-cover bg-center transition duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${category.image})` }}
                    />
                  ) : (
                    <div className={`h-full w-full bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                      <IconComponent className="h-12 w-12 text-white opacity-80" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="font-semibold text-brand-dark text-sm">
                    {t({ en: category.labelEn, fr: category.labelFr })}
                  </span>
                  <ArrowRight className="h-4 w-4 text-brand-grey transition group-hover:text-brand-blue group-hover:translate-x-0.5" />
                </div>
              </Link>
            )
          })}
        </div>
      </MobileCarousel>
    </section>
  )
}
