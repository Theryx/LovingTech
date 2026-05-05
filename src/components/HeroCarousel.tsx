'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const SLIDES = [
  {
    id: 1,
    image: '/images/carousel_1.png',
    badgeFr: 'Nouvelle Collection',
    badgeEn: 'New Collection',
    titleFr: 'Équipements authentiques pour professionnels et Gamers',
    titleEn: 'Authentic gear for professionals and Gamers',
    subtitleFr: 'Logitech, Keychron, Anker — livrés partout au Cameroun',
    subtitleEn: 'Logitech, Keychron, Anker — delivered anywhere in Cameroon',
    ctaHref: '/products?category=keyboard',
    ctaFr: 'Voir les claviers',
    ctaEn: 'Browse keyboards',
    bgColor: 'bg-brand-blue',
  },
  {
    id: 2,
    image: '/images/carousel_2.png',
    badgeFr: 'Paiement sécurisé',
    badgeEn: 'Secure payment',
    titleFr: 'Inspectez avant de payer. Aucun risque.',
    titleEn: 'Inspect before you pay. Zero risk.',
    subtitleFr: 'Commandez via WhatsApp et payez à la réception',
    subtitleEn: 'Order on WhatsApp and pay when you receive it',
    ctaHref: '/products',
    ctaFr: 'Découvrir',
    ctaEn: 'Discover',
    bgColor: 'bg-brand-orange',
  },
  {
    id: 3,
    image: '/images/carousel_3.png',
    badgeFr: 'Livraison nationale',
    badgeEn: 'Nationwide delivery',
    titleFr: 'Nous livrons partout au Cameroun',
    titleEn: 'We deliver everywhere in Cameroon',
    subtitleFr: 'Livraison rapide dans toutes les villes',
    subtitleEn: 'Fast delivery to all cities',
    ctaHref: '/products',
    ctaFr: 'Voir tous les produits',
    ctaEn: 'View all products',
    bgColor: 'bg-brand-dark',
  },
]

const INTERVAL = 5000

export default function HeroCarousel({ inStockCount }: { inStockCount: number }) {
  const { t } = useLanguage()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [direction, setDirection] = useState(1)

  const go = useCallback((idx: number, dir: number) => {
    setDirection(dir)
    setCurrent((idx + SLIDES.length) % SLIDES.length)
  }, [])

  const prev = () => go(current - 1, -1)
  const next = useCallback(() => go(current + 1, 1), [current, go])

  useEffect(() => {
    if (paused) return
    const id = setTimeout(() => next(), INTERVAL)
    return () => clearTimeout(id)
  }, [current, paused, next])

  const slide = SLIDES[current]

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <section
      className="relative overflow-hidden bg-white pt-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hero carousel"
    >
      {/* Container aligned with page content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-brand-grey/10">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={slide.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="flex flex-col lg:flex-row"
            >
              {/* Content Side - Always on bottom for mobile, left for desktop */}
              <div className={`relative z-10 flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:w-1/2 lg:px-12 lg:py-16 xl:px-16 ${slide.bgColor} order-2 lg:order-1`}>
                {/* Badge */}
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-4 inline-block w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
                >
                  {t({ en: slide.badgeEn, fr: slide.badgeFr })}
                </motion.span>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
                >
                  {t({ en: slide.titleEn, fr: slide.titleFr })}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 max-w-md text-base leading-relaxed text-white/80 sm:text-lg"
                >
                  {t({ en: slide.subtitleEn, fr: slide.subtitleFr })}
                </motion.p>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
                >
                  <Link
                    href={slide.ctaHref}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-dark transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
                  >
                    {t({ en: slide.ctaEn, fr: slide.ctaFr })}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 flex flex-wrap gap-4 text-xs text-white/60 sm:gap-6 sm:text-sm"
                >
                  <span>
                    <strong className="text-white">{inStockCount}+</strong>{' '}
                    {t({ en: 'Products', fr: 'Produits' })}
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span>
                    <strong className="text-white">2–3j</strong>{' '}
                    {t({ en: 'Delivery', fr: 'Livraison' })}
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span>
                    <strong className="text-white">100%</strong>{' '}
                    {t({ en: 'Authentic', fr: 'Authentique' })}
                  </span>
                </motion.div>
              </div>

              {/* Image Side - Always on top for mobile, right for desktop */}
              <div className="relative lg:w-1/2 order-1 lg:order-2">
                <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[400px]">
                  <Image
                    src={slide.image}
                    alt={t({ en: slide.titleEn, fr: slide.titleFr })}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls - Dots */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === current}
                onClick={() => go(i, i > current ? 1 : -1)}
                className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  i === current ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Controls - Arrows */}
          <div className="absolute top-1/2 left-2 right-2 z-20 flex -translate-y-1/2 justify-between pointer-events-none lg:left-4 lg:right-4">
            <button
              onClick={prev}
              aria-label="Slide précédent / Previous slide"
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-brand-dark shadow-lg transition hover:bg-white hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={next}
              aria-label="Slide suivant / Next slide"
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-brand-dark shadow-lg transition hover:bg-white hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
