'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface Category {
  slug: string
  labelEn: string
  labelFr: string
  image: string
}

const CATEGORIES: Category[] = [
  {
    slug: 'keyboard',
    labelEn: 'Keyboards',
    labelFr: 'Claviers',
    image: '/images/categories/keyboard.jpg',
  },
  {
    slug: 'mouse',
    labelEn: 'Mice',
    labelFr: 'Souris',
    image: '/images/categories/mouse.jpg',
  },
  {
    slug: 'cable',
    labelEn: 'Cables',
    labelFr: 'Câbles',
    image: '/images/categories/cable.jpg',
  },
  {
    slug: 'speaker',
    labelEn: 'Speakers',
    labelFr: 'Enceintes',
    image: '/images/categories/speaker.jpg',
  },
  {
    slug: 'solar_lamp',
    labelEn: 'Solar Lamps',
    labelFr: 'Lampes Solaires',
    image: '/images/categories/solar-lamp.jpg',
  },
]

export default function ShopByCategory() {
  const { t } = useLanguage()

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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {CATEGORIES.map(category => (
          <Link
            key={category.slug}
            href={`/products?category=${category.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-brand-grey/20 bg-white transition hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="aspect-[4/3] overflow-hidden bg-brand-grey/10">
              <div
                className="h-full w-full bg-cover bg-center transition duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${category.image})` }}
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="font-semibold text-brand-dark text-sm">
                {t({ en: category.labelEn, fr: category.labelFr })}
              </span>
              <ArrowRight className="h-4 w-4 text-brand-grey transition group-hover:text-brand-blue group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
