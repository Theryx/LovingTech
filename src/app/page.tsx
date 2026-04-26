'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';

import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import { LOCAL_PRODUCTS, ProductWithFeatured } from '@/lib/localProducts';
import { Product, productService } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

const brandLogos = ['Logitech', 'Keychron', 'Anker'];

const CATEGORIES = [
  {
    slug: 'keyboard',
    labelFr: 'Claviers',
    labelEn: 'Keyboards',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8" aria-hidden="true">
        <rect x="2" y="6" width="20" height="13" rx="2" />
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h.01M14 14h.01M18 14h.01M8 17h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    slug: 'mouse',
    labelFr: 'Souris',
    labelEn: 'Mice',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8" aria-hidden="true">
        <path d="M12 2C8.686 2 6 4.686 6 8v8c0 3.314 2.686 6 6 6s6-2.686 6-6V8c0-3.314-2.686-6-6-6z" />
        <path d="M12 2v7M6 9h12" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    slug: 'cable',
    labelFr: 'Câbles',
    labelEn: 'Cables',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8" aria-hidden="true">
        <path d="M8 3v3M16 3v3M8 6h8M8 18h8M8 18v3M16 18v3M4 9h16v6H4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    slug: 'speaker',
    labelFr: 'Enceintes',
    labelEn: 'Speakers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <circle cx="12" cy="15" r="3" />
        <circle cx="12" cy="7" r="1" />
      </svg>
    ),
  },
  {
    slug: 'solar_lamp',
    labelFr: 'Lampes Solaires',
    labelEn: 'Solar Lamps',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8" aria-hidden="true">
        <circle cx="12" cy="10" r="4" />
        <path d="M12 2v2M12 18v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 10h2M20 10h2M4.22 15.78l1.42-1.42M18.36 5.64l1.42-1.42M8 20h8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Home() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>(LOCAL_PRODUCTS as Product[]);

  useEffect(() => {
    productService.getAll().then(db => { if (db.length > 0) setProducts(db); }).catch(() => {});
  }, []);

  const featuredProducts = products
    .filter((p) => (p as ProductWithFeatured).featured)
    .slice(0, 8);

  const inStockCount = products.filter(p => p.stock_status === 'in_stock').length;
  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <Navbar />

      <HeroCarousel inStockCount={inStockCount} />

      {/* Brand bar */}
      <section className="border-b border-brand-grey/20 bg-white px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-brand-dark/50">
            {t({ en: 'Trusted brands available now', fr: 'Marques fiables disponibles maintenant' })}
          </p>
          <div className="flex flex-wrap gap-3">
            {brandLogos.map((brand) => (
              <div key={brand} className="rounded-full border border-brand-grey/30 bg-white px-4 py-2 text-sm font-semibold text-brand-dark">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust pillars */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 border-b border-brand-grey/20 px-6 py-20 md:grid-cols-3">
        {[
          {
            icon: <ShieldCheck className="h-8 w-8" aria-hidden="true" />,
            title: t({ en: 'Authenticity guaranteed', fr: 'Authenticité garantie' }),
            body: t({ en: 'Premium brands, never counterfeits.', fr: 'Des marques premium, jamais de contrefaçons.' }),
          },
          {
            icon: <Truck className="h-8 w-8" aria-hidden="true" />,
            title: t({ en: 'Nationwide delivery', fr: 'Livraison nationale' }),
            body: t({ en: 'Anywhere in Cameroon via bus agencies.', fr: 'Partout au Cameroun via agences de bus.' }),
          },
          {
            icon: <ShoppingBag className="h-8 w-8" aria-hidden="true" />,
            title: t({ en: 'Pay on delivery', fr: 'Paiement à la livraison' }),
            body: t({ en: 'Inspect before you pay.', fr: 'Inspectez avant de payer.' }),
          },
        ].map((item, i) => (
          <div key={i} className="rounded-3xl border border-brand-grey/20 bg-white p-8 shadow-sm">
            <div className="mb-5 inline-flex rounded-2xl bg-brand-blue/10 p-4 text-brand-blue">{item.icon}</div>
            <h3 className="text-xl font-semibold text-brand-dark">{item.title}</h3>
            <p className="mt-3 text-brand-dark/60">{item.body}</p>
          </div>
        ))}
      </section>

      {/* Category grid */}
      <section className="mx-auto max-w-7xl px-6 py-16 border-b border-brand-grey/20">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-dark/50 mb-6">
          {t({ en: 'Browse by category', fr: 'Parcourir par catégorie' })}
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-brand-grey/20 bg-white p-6 text-center transition hover:border-brand-blue hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              <span className="text-brand-dark/40 transition group-hover:text-brand-blue">
                {cat.icon}
              </span>
              <span className="text-sm font-semibold text-brand-dark">
                {t({ en: cat.labelEn, fr: cat.labelFr })}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-dark/50">
              {t({ en: 'Featured', fr: 'En vedette' })}
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-brand-dark">
              {t({ en: 'Best picks for work, mobility and gaming', fr: 'Les meilleurs choix pour le travail, la mobilité et le gaming' })}
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 self-start rounded-full border border-brand-grey/30 px-5 py-2.5 text-sm font-medium text-brand-dark transition hover:bg-brand-grey/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            {t({ en: 'View all products', fr: 'Voir tous les produits' })}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product as ProductWithFeatured} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-brand-grey/20 bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-dark/50">
              {t({ en: 'How it works', fr: 'Comment ça marche' })}
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-brand-dark">
              {t({ en: 'Simple from first click to delivery', fr: "Simple du premier clic à la livraison" })}
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: <Clock3 className="h-8 w-8" aria-hidden="true" />, num: '01', title: t({ en: 'Choose your gear', fr: 'Choisissez votre équipement' }), body: t({ en: 'Browse the catalog or message us on WhatsApp if you need help.', fr: "Parcourez le catalogue ou écrivez sur WhatsApp si vous avez besoin d'aide." }) },
              { icon: <MessageCircle className="h-8 w-8" aria-hidden="true" />, num: '02', title: t({ en: 'Confirm in minutes', fr: 'Confirmez en quelques minutes' }), body: t({ en: 'Send your number and delivery area. We confirm and ship fast.', fr: 'Envoyez votre numéro et votre zone. Nous confirmons et expédions rapidement.' }) },
              { icon: <CheckCircle2 className="h-8 w-8" aria-hidden="true" />, num: '03', title: t({ en: 'Inspect before paying', fr: 'Inspectez avant de payer' }), body: t({ en: 'Receive the product, check it, then pay with full confidence.', fr: 'Recevez le produit, vérifiez-le, puis payez en toute confiance.' }) },
            ].map((item, i) => (
              <div key={i} className="rounded-3xl border border-brand-grey/20 bg-white p-8">
                <div className="text-brand-blue">{item.icon}</div>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-brand-dark/40">{item.num}</p>
                <h3 className="mt-3 text-2xl font-semibold text-brand-dark">{item.title}</h3>
                <p className="mt-3 text-brand-dark/60">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-grey/20 bg-white px-6 pb-8 pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            {/* Brand */}
            <div className="max-w-xs">
              <div className="flex items-center gap-3 text-2xl font-bold italic tracking-tighter text-brand-dark">
                <img src="/logo.png" alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
                LOVING TECH
              </div>
              <p className="mt-3 text-sm text-brand-dark/50">
                {t({
                  en: 'Premium accessories for professionals, creators and gamers in Cameroon.',
                  fr: 'Des accessoires premium pour les professionnels, créateurs et gamers au Cameroun.',
                })}
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-widest text-brand-dark/30">
                Elevate Your Performance
              </p>
            </div>

            {/* Nav links */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-dark/40">
                {t({ en: 'Navigation', fr: 'Navigation' })}
              </p>
              <nav className="flex flex-col gap-2 text-sm text-brand-dark/60" aria-label="Footer navigation">
                <Link href="/products" className="transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">
                  {t({ en: 'Products', fr: 'Produits' })}
                </Link>
                <Link href="/return-policy" className="transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">
                  {t({ en: 'Return Policy', fr: 'Politique de retour' })}
                </Link>
                <Link href="/terms" className="transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">
                  {t({ en: 'Terms', fr: 'Conditions' })}
                </Link>
              </nav>
            </div>

            {/* Social */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-dark/40">
                {t({ en: 'Follow us', fr: 'Suivez-nous' })}
              </p>
              <div className="flex flex-col gap-2 text-sm text-brand-dark/60">
                <a href="https://facebook.com/LovingTech" target="_blank" rel="noreferrer" className="transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">Facebook</a>
                <a href="https://instagram.com/lovingtechcmr" target="_blank" rel="noreferrer" className="transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">Instagram · @lovingtechcmr</a>
                <a href="https://tiktok.com/@lovingtech.shop" target="_blank" rel="noreferrer" className="transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">TikTok · @lovingtech.shop</a>
                <a href="https://wa.me/237655163248" target="_blank" rel="noreferrer" className="transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">WhatsApp · +237 655 163 248</a>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-brand-grey/20 pt-6 text-center text-sm text-brand-dark/40">
            © 2026 Loving Tech Cameroun. {t({ en: 'All rights reserved.', fr: 'Tous droits réservés.' })}
          </div>
        </div>
      </footer>
    </main>
  );
}
