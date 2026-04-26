'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import { LOCAL_PRODUCTS, ProductWithFeatured } from '@/lib/localProducts';
import { Product, productService } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

const brandLogos = ['Logitech', 'Keychron', 'Anker'];

export default function Home() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>(LOCAL_PRODUCTS as Product[]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const dbProducts = await productService.getAll();
        if (dbProducts.length > 0) setProducts(dbProducts);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    }
    loadProducts();
  }, []);

  const featuredProducts = products
    .filter((p) => (p as ProductWithFeatured).featured)
    .sort((a, b) => {
      const score = { in_stock: 0, pre_order: 1, out_of_stock: 2 };
      return score[a.stock_status] - score[b.stock_status];
    });

  const displayProducts = searchQuery
    ? featuredProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : featuredProducts.slice(0, 4);

  const inStockCount = products.filter(p => p.stock_status === 'in_stock').length;
  const businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '237655163248';
  const whatsappHref = `https://wa.me/${businessNumber}?text=${encodeURIComponent('Bonjour Loving Tech! Je voudrais de l\'aide pour choisir un produit.')}`;

  const heroBgImage = 'https://resource.logitech.com/w_692,c_lpad,ar_4:3,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/keyboards/signature-slim-solar-plus-k980-for-business/gallery/esp/b2b-k980-graphite-us-gallery1-esp.png?v=1';

  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <Navbar />

      {/* Hero */}
      <section
        className="relative overflow-hidden bg-brand-dark px-6 pb-24 pt-32"
        style={{ backgroundImage: `url(${heroBgImage})`, backgroundPosition: 'right center', backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_34%),linear-gradient(120deg,_rgba(17,17,17,0.92),_rgba(17,17,17,0.82)_48%,_rgba(17,17,17,0.96))]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                {t({ en: 'Authentic gear only', fr: 'Équipements 100% authentiques' })}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                {t({ en: 'Delivery in Cameroon', fr: 'Livraison au Cameroun' })}
              </span>
            </div>

            <h1 className="max-w-2xl text-5xl font-black tracking-tight text-white sm:text-7xl">
              {t({
                en: 'Authentic productivity and gaming gear, delivered fast.',
                fr: 'Des équipements authentiques pour travailler et jouer, livrés rapidement.',
              })}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
              {t({
                en: 'Shop Logitech, Keychron, and Anker accessories with pay-on-delivery confidence, WhatsApp support, and fast local fulfillment.',
                fr: 'Achetez vos accessoires Logitech, Keychron et Anker avec paiement à la livraison, assistance WhatsApp et livraison locale rapide.',
              })}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#catalog"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-brand-dark transition hover:bg-brand-grey focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
              >
                {t({ en: 'Browse catalog', fr: 'Parcourir le catalogue' })}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
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

            <div className="mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-white/50">{t({ en: 'Available now', fr: 'Disponibles maintenant' })}</p>
                <p className="mt-3 text-3xl font-bold text-white">{inStockCount}+</p>
                <p className="mt-2 text-sm text-white/70">{t({ en: 'Ready-to-ship accessories in stock.', fr: 'Accessoires prêts à être expédiés en stock.' })}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-white/50">{t({ en: 'Delivery speed', fr: 'Vitesse de livraison' })}</p>
                <p className="mt-3 text-3xl font-bold text-white">24h</p>
                <p className="mt-2 text-sm text-white/70">{t({ en: 'Douala first, then major cities nationwide.', fr: 'Douala en priorité, puis les grandes villes du pays.' })}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-white/50">{t({ en: 'Ordering confidence', fr: 'Achat sans stress' })}</p>
                <p className="mt-3 text-3xl font-bold text-white">100%</p>
                <p className="mt-2 text-sm text-white/70">{t({ en: 'Inspect the product before you pay.', fr: 'Inspectez le produit avant de payer.' })}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
          { icon: <ShieldCheck className="h-8 w-8" aria-hidden="true" />, title: t({ en: 'Authenticity first', fr: 'Authenticité garantie' }), body: t({ en: 'Premium brands sourced for buyers who do not want to gamble on fake accessories.', fr: 'Des marques premium pour les acheteurs qui ne veulent pas prendre le risque des contrefaçons.' }) },
          { icon: <Truck className="h-8 w-8" aria-hidden="true" />, title: t({ en: 'Fast local delivery', fr: 'Livraison locale rapide' }), body: t({ en: '24h in Douala, 48h in Yaoundé, with clear coordination over WhatsApp.', fr: '24h à Douala, 48h à Yaoundé, avec une coordination simple via WhatsApp.' }) },
          { icon: <ShoppingBag className="h-8 w-8" aria-hidden="true" />, title: t({ en: 'Pay after inspection', fr: 'Paiement après inspection' }), body: t({ en: 'You can verify the product on delivery before completing payment.', fr: 'Vous pouvez vérifier le produit à la livraison avant de finaliser le paiement.' }) },
        ].map((item, i) => (
          <div key={i} className="rounded-3xl border border-brand-grey/20 bg-white p-8 shadow-sm">
            <div className="mb-5 inline-flex rounded-2xl bg-brand-blue/10 p-4 text-brand-blue">{item.icon}</div>
            <h3 className="text-xl font-semibold text-brand-dark">{item.title}</h3>
            <p className="mt-3 text-brand-dark/60">{item.body}</p>
          </div>
        ))}
      </section>

      {/* Catalog */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-dark/50">
              {t({ en: 'Featured now', fr: 'En vedette actuellement' })}
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-brand-dark">
              {t({ en: 'Best picks for work, travel, and gaming', fr: 'Les meilleurs choix pour le travail, la mobilité et le gaming' })}
            </h2>
            <div className="mt-8 relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                placeholder={t({ en: 'Search featured products...', fr: 'Rechercher des produits vedettes...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-brand-grey/30 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue transition"
              />
            </div>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 self-start rounded-full border border-brand-grey/30 px-5 py-2.5 text-sm font-medium text-brand-dark transition hover:bg-brand-grey/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            {t({ en: 'See all products', fr: 'Voir tous les produits' })}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div id="catalog" className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {displayProducts.map((product) => (
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
              {t({ en: 'A simpler buying flow for first-time customers', fr: "Un parcours d'achat simple pour les nouveaux clients" })}
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: <Clock3 className="h-8 w-8" aria-hidden="true" />, num: '01', title: t({ en: 'Choose your gear', fr: 'Choisissez votre équipement' }), body: t({ en: 'Browse the catalog or message directly on WhatsApp if you need help comparing options.', fr: "Parcourez le catalogue ou écrivez directement sur WhatsApp si vous avez besoin d'aide pour comparer les options." }) },
              { icon: <MessageCircle className="h-8 w-8" aria-hidden="true" />, num: '02', title: t({ en: 'Confirm in minutes', fr: 'Confirmez en quelques minutes' }), body: t({ en: 'Send your WhatsApp number and delivery area. We confirm availability and coordinate delivery quickly.', fr: 'Envoyez votre numéro WhatsApp et votre zone de livraison. Nous confirmons la disponibilité et organisons la livraison rapidement.' }) },
              { icon: <CheckCircle2 className="h-8 w-8" aria-hidden="true" />, num: '03', title: t({ en: 'Inspect before paying', fr: 'Inspectez avant de payer' }), body: t({ en: 'Receive the product, verify it, and complete payment with more confidence.', fr: 'Recevez le produit, vérifiez-le, puis payez en toute confiance.' }) },
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

      {/* Quote + trust section */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-brand-dark p-10 text-white">
            <div className="flex items-center gap-2 text-brand-orange" aria-hidden="true">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
            </div>
            <p className="mt-8 max-w-2xl text-2xl font-semibold leading-10">
              {t({
                en: '"The biggest friction in local tech commerce is trust. The homepage should remove that friction before the visitor even scrolls."',
                fr: "« Le plus grand frein du commerce tech local, c'est la confiance. La page d'accueil doit supprimer ce frein avant même le premier scroll. »",
              })}
            </p>
            <p className="mt-6 text-sm uppercase tracking-[0.24em] text-white/50">Loving Tech</p>
          </div>

          <div className="rounded-[2rem] border border-brand-grey/20 p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-dark/50">
              {t({ en: 'Why this page converts better', fr: 'Pourquoi cette page convertit mieux' })}
            </p>
            <div className="mt-8 space-y-5">
              {[
                t({ en: 'The value proposition is specific: brands, geography, trust, and speed.', fr: 'La proposition de valeur est précise : marques, zone, confiance et rapidité.' }),
                t({ en: 'The page offers two clear actions: browse or start on WhatsApp.', fr: 'La page propose deux actions claires : parcourir ou démarrer sur WhatsApp.' }),
                t({ en: 'Objections are handled early with delivery, authenticity, and pay-on-delivery reassurance.', fr: "Les objections sont traitées tôt avec la livraison, l'authenticité et le paiement à la livraison." }),
              ].map((text, i) => (
                <div key={i} className="flex gap-4">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" aria-hidden="true" />
                  <p className="text-brand-dark/60">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-grey/20 px-6 py-20">
        <nav aria-label="Footer" className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 text-2xl font-bold italic tracking-tighter text-brand-dark">
              <img src="/logo.png" alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
              LOVING TECH
            </div>
            <p className="mt-3 max-w-md text-sm text-brand-dark/50">
              {t({
                en: 'Premium accessories for professionals, creators, and gamers across Cameroon.',
                fr: 'Des accessoires premium pour les professionnels, les créateurs et les gamers partout au Cameroun.',
              })}
            </p>
          </div>

          <div className="flex gap-8 text-sm text-brand-dark/50">
            <a href="#" className="transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">Instagram</a>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">WhatsApp</a>
            <a href="#" className="transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">{t({ en: 'Terms', fr: 'Conditions' })}</a>
          </div>

          <p className="text-sm text-brand-dark/50">
            © 2026 Loving Tech Cameroon. {t({ en: 'All rights reserved.', fr: 'Tous droits réservés.' })}
          </p>
        </nav>
      </footer>
    </main>
  );
}
