'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const SLIDES = [
  {
    id: 1,
    bg: '/images/carousel_1.png',
    badgeFr: 'Claviers & Souris',
    badgeEn: 'Keyboards & Mice',
    titleFr: 'Équipements authentiques pour professionel et Gamer.',
    titleEn: 'Authentic gear for professional and Gamer.',
    subtitleFr: 'Logitech, Keychron, Anker — livrés partout au Cameroun.',
    subtitleEn: 'Logitech, Keychron, Anker — delivered anywhere in Cameroon.',
    ctaHref: '/products?category=keyboard',
    ctaFr: 'Voir les claviers',
    ctaEn: 'Browse keyboards',
  },
  {
    id: 2,
    bg: '/images/carousel_2.png',
    badgeFr: 'Paiement à la livraison',
    badgeEn: 'Pay on delivery',
    titleFr: 'Inspectez avant de payer. Aucun risque.',
    titleEn: 'Inspect before you pay. Zero risk.',
    subtitleFr: 'Commandez via WhatsApp et payez à la réception.',
    subtitleEn: 'Order on WhatsApp and pay when you receive it.',
    ctaHref: 'https://wa.me/237655163248',
    ctaFr: 'Commander sur WhatsApp',
    ctaEn: 'Order on WhatsApp',
    ctaExternal: true,
  },
  {
    id: 3,
    bg: '/images/carousel_3.png',
    badgeFr: 'Livraison nationale',
    badgeEn: 'Nationwide delivery',
    titleFr: 'Nous Livrons partout au Cameroun',
    titleEn: 'We deliver everywhere in Cameroon',
    subtitleFr: 'Livraison rapide dans toutes les villes',
    subtitleEn: 'Fast delivery to all cities',
    ctaHref: '/products',
    ctaFr: 'Voir tous les produits',
    ctaEn: 'View all products',
  },
];

const INTERVAL = 5000;

export default function HeroCarousel({ inStockCount }: { inStockCount: number }) {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const whatsappHref = `https://wa.me/237655163248?text=${encodeURIComponent("Bonjour Loving Tech! Je voudrais de l'aide pour choisir un produit.")}`;

  const go = useCallback((idx: number, dir: number) => {
    setDirection(dir);
    setCurrent((idx + SLIDES.length) % SLIDES.length);
  }, []);

  const prev = () => go(current - 1, -1);
  const next = useCallback(() => go(current + 1, 1), [current, go]);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => next(), INTERVAL);
    return () => clearTimeout(id);
  }, [current, paused, next]);

  const slide = SLIDES[current];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <section
      className="relative overflow-hidden bg-brand-dark pt-20"
      style={{ minHeight: '90vh' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hero carousel"
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${slide.bg})`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(17,17,17,0.75),_rgba(17,17,17,0.45)_50%,_rgba(17,17,17,0.65))]" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-7xl flex-col justify-center px-6 pb-24 pt-12">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <div className="mb-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                {t({ en: slide.badgeEn, fr: slide.badgeFr })}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                {t({ en: 'Delivery in Cameroon', fr: 'Livraison au Cameroun' })}
              </span>
            </div>

            <h1 className="max-w-2xl text-5xl font-black tracking-tight text-white sm:text-7xl">
              {t({ en: slide.titleEn, fr: slide.titleFr })}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
              {t({ en: slide.subtitleEn, fr: slide.subtitleFr })}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              {slide.ctaExternal ? (
                <a
                  href={slide.ctaHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-brand-dark transition hover:bg-brand-grey focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  {t({ en: slide.ctaEn, fr: slide.ctaFr })}
                </a>
              ) : (
                <Link
                  href={slide.ctaHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-brand-dark transition hover:bg-brand-grey focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
                >
                  {t({ en: slide.ctaEn, fr: slide.ctaFr })}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {t({ en: 'Order on WhatsApp', fr: 'Commander sur WhatsApp' })}
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-6 text-sm text-white/60">
              <span><strong className="text-white">{inStockCount}+</strong> {t({ en: 'Products', fr: 'Produits' })}</span>
              <span>·</span>
              <span><strong className="text-white">2–3j</strong> {t({ en: 'Delivery', fr: 'Livraison' })}</span>
              <span>·</span>
              <span><strong className="text-white">100%</strong> {t({ en: 'Inspect before paying', fr: 'Inspection avant paiement' })}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="absolute bottom-10 left-6 right-6 mx-auto max-w-7xl flex items-center justify-between">
          {/* Dots */}
          <div className="flex gap-2" role="tablist" aria-label="Carousel slides">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === current}
                onClick={() => go(i, i > current ? 1 : -1)}
                className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${i === current ? 'w-8 bg-white' : 'w-4 bg-white/30 hover:bg-white/60'
                  }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex gap-2">
            <button
              onClick={prev}
              aria-label="Slide précédent / Previous slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={next}
              aria-label="Slide suivant / Next slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
