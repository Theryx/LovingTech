'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  MessageCircle,
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

  useEffect(() => {
    async function loadProducts() {
      try {
        const dbProducts = await productService.getAll();
        if (dbProducts.length > 0) {
          setProducts(dbProducts);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    }
    loadProducts();
  }, []);

  const featuredProducts = products
    .filter((p) => (p as ProductWithFeatured).featured)
    .sort((a, b) => {
      const availabilityScore = { in_stock: 0, pre_order: 1, out_of_stock: 2 };
      return availabilityScore[a.stock_status] - availabilityScore[b.stock_status];
    })
    .slice(0, 4);

  const inStockCount = products.filter((product) => product.stock_status === 'in_stock').length;
  const businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '237600000000';
  const whatsappHref = `https://wa.me/${businessNumber}?text=${encodeURIComponent(
    'Hello Loving Tech! I would like help choosing a product.'
  )}`;

  const heroBgImage =
    'https://resource.logitech.com/w_692,c_lpad,ar_4:3,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/keyboards/signature-slim-solar-plus-k980-for-business/gallery/esp/b2b-k980-graphite-us-gallery1-esp.png?v=1';

  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-[#09090b] dark:text-white">
      <Navbar />

      <section
        className="relative overflow-hidden bg-zinc-950 px-6 pb-24 pt-32"
        style={{
          backgroundImage: `url(${heroBgImage})`,
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_34%),linear-gradient(120deg,_rgba(9,9,11,0.92),_rgba(9,9,11,0.82)_48%,_rgba(9,9,11,0.96))]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300">
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

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
              {t({
                en: 'Shop Logitech, Keychron, and Anker accessories with pay-on-delivery confidence, WhatsApp support, and fast local fulfillment.',
                fr: 'Achetez vos accessoires Logitech, Keychron et Anker avec paiement à la livraison, assistance WhatsApp et livraison locale rapide.',
              })}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#catalog"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-black transition hover:bg-zinc-200"
              >
                {t({ en: 'Browse catalog', fr: 'Parcourir le catalogue' })}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                <MessageCircle className="h-4 w-4" />
                {t({ en: 'Order on WhatsApp', fr: 'Commander sur WhatsApp' })}
              </a>
            </div>

            <div className="mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                  {t({ en: 'Available now', fr: 'Disponibles maintenant' })}
                </p>
                <p className="mt-3 text-3xl font-bold text-white">{inStockCount}+</p>
                <p className="mt-2 text-sm text-zinc-300">
                  {t({ en: 'Ready-to-ship accessories in stock.', fr: 'Accessoires prêts à être expédiés en stock.' })}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                  {t({ en: 'Delivery speed', fr: 'Vitesse de livraison' })}
                </p>
                <p className="mt-3 text-3xl font-bold text-white">24h</p>
                <p className="mt-2 text-sm text-zinc-300">
                  {t({ en: 'Douala first, then major cities nationwide.', fr: 'Douala en priorité, puis les grandes villes du pays.' })}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                  {t({ en: 'Ordering confidence', fr: 'Achat sans stress' })}
                </p>
                <p className="mt-3 text-3xl font-bold text-white">100%</p>
                <p className="mt-2 text-sm text-zinc-300">
                  {t({ en: 'Inspect the product before you pay.', fr: 'Inspectez le produit avant de payer.' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-zinc-50 px-6 py-6 dark:border-zinc-800 dark:bg-zinc-950/40">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-zinc-500">
            {t({ en: 'Trusted brands available now', fr: 'Marques fiables disponibles maintenant' })}
          </p>
          <div className="flex flex-wrap gap-3">
            {brandLogos.map((brand) => (
              <div
                key={brand}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 border-b border-zinc-200 px-6 py-20 md:grid-cols-3 dark:border-zinc-800">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
          <div className="mb-5 inline-flex rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold">
            {t({ en: 'Authenticity first', fr: 'Authenticité garantie' })}
          </h3>
          <p className="mt-3 text-zinc-500">
            {t({
              en: 'Premium brands sourced for buyers who do not want to gamble on fake accessories.',
              fr: 'Des marques premium pour les acheteurs qui ne veulent pas prendre le risque des contrefaçons.',
            })}
          </p>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
          <div className="mb-5 inline-flex rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
            <Truck className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold">
            {t({ en: 'Fast local delivery', fr: 'Livraison locale rapide' })}
          </h3>
          <p className="mt-3 text-zinc-500">
            {t({
              en: '24h in Douala, 48h in Yaoundé, with clear coordination over WhatsApp.',
              fr: '24h à Douala, 48h à Yaoundé, avec une coordination simple via WhatsApp.',
            })}
          </p>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
          <div className="mb-5 inline-flex rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold">
            {t({ en: 'Pay after inspection', fr: 'Paiement après inspection' })}
          </h3>
          <p className="mt-3 text-zinc-500">
            {t({
              en: 'You can verify the product on delivery before completing payment.',
              fr: 'Vous pouvez vérifier le produit à la livraison avant de finaliser le paiement.',
            })}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
              {t({ en: 'Featured now', fr: 'En vedette actuellement' })}
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              {t({ en: 'Best picks for work, travel, and gaming', fr: 'Les meilleurs choix pour le travail, la mobilité et le gaming' })}
            </h2>
            <p className="mt-4 text-lg text-zinc-500">
              {t({
                en: 'We surface available products first so visitors can move from discovery to order without dead ends.',
                fr: 'Nous mettons d’abord en avant les produits disponibles pour éviter les impasses au moment de commander.',
              })}
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {t({ en: 'See all products', fr: 'Voir tous les produits' })}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div id="catalog" className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product as ProductWithFeatured} />
          ))}
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-zinc-50 px-6 py-24 dark:border-zinc-800 dark:bg-zinc-950/40">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
              {t({ en: 'How it works', fr: 'Comment ça marche' })}
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              {t({ en: 'A simpler buying flow for first-time customers', fr: 'Un parcours d’achat simple pour les nouveaux clients' })}
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-900 dark:bg-zinc-950">
              <Clock3 className="h-8 w-8" />
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">01</p>
              <h3 className="mt-3 text-2xl font-semibold">
                {t({ en: 'Choose your gear', fr: 'Choisissez votre équipement' })}
              </h3>
              <p className="mt-3 text-zinc-500">
                {t({
                  en: 'Browse the catalog or message directly on WhatsApp if you need help comparing options.',
                  fr: 'Parcourez le catalogue ou écrivez directement sur WhatsApp si vous avez besoin d’aide pour comparer les options.',
                })}
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-900 dark:bg-zinc-950">
              <MessageCircle className="h-8 w-8" />
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">02</p>
              <h3 className="mt-3 text-2xl font-semibold">
                {t({ en: 'Confirm in minutes', fr: 'Confirmez en quelques minutes' })}
              </h3>
              <p className="mt-3 text-zinc-500">
                {t({
                  en: 'Send your WhatsApp number and delivery area. We confirm availability and coordinate delivery quickly.',
                  fr: 'Envoyez votre numéro WhatsApp et votre zone de livraison. Nous confirmons la disponibilité et organisons la livraison rapidement.',
                })}
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-900 dark:bg-zinc-950">
              <CheckCircle2 className="h-8 w-8" />
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">03</p>
              <h3 className="mt-3 text-2xl font-semibold">
                {t({ en: 'Inspect before paying', fr: 'Inspectez avant de payer' })}
              </h3>
              <p className="mt-3 text-zinc-500">
                {t({
                  en: 'Receive the product, verify it, and complete payment with more confidence.',
                  fr: 'Recevez le produit, vérifiez-le, puis payez en toute confiance.',
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-zinc-950 p-10 text-white">
            <div className="flex items-center gap-2 text-amber-400">
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
            </div>
            <p className="mt-8 max-w-2xl text-2xl font-semibold leading-10">
              {t({
                en: '“The biggest friction in local tech commerce is trust. The homepage should remove that friction before the visitor even scrolls.”',
                fr: '« Le plus grand frein du commerce tech local, c’est la confiance. La page d’accueil doit supprimer ce frein avant même le premier scroll. »',
              })}
            </p>
            <p className="mt-6 text-sm uppercase tracking-[0.24em] text-zinc-400">Loving Tech</p>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 p-10 dark:border-zinc-800">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
              {t({ en: 'Why this page converts better', fr: 'Pourquoi cette page convertit mieux' })}
            </p>
            <div className="mt-8 space-y-5">
              <div className="flex gap-4">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-zinc-600 dark:text-zinc-300">
                  {t({
                    en: 'The value proposition is specific: brands, geography, trust, and speed.',
                    fr: 'La proposition de valeur est précise : marques, zone, confiance et rapidité.',
                  })}
                </p>
              </div>
              <div className="flex gap-4">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-zinc-600 dark:text-zinc-300">
                  {t({
                    en: 'The page offers two clear actions: browse or start on WhatsApp.',
                    fr: 'La page propose deux actions claires : parcourir ou démarrer sur WhatsApp.',
                  })}
                </p>
              </div>
              <div className="flex gap-4">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-zinc-600 dark:text-zinc-300">
                  {t({
                    en: 'Objections are handled early with delivery, authenticity, and pay-on-delivery reassurance.',
                    fr: 'Les objections sont traitées tôt avec la livraison, l’authenticité et le paiement à la livraison.',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 px-6 py-20 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 text-2xl font-bold italic tracking-tighter">
              <img src="/logo.png" alt="Loving Tech Logo" className="h-8 w-8 object-contain" />
              LOVING TECH
            </div>
            <p className="mt-3 max-w-md text-sm text-zinc-500">
              {t({
                en: 'Premium accessories for professionals, creators, and gamers across Cameroon.',
                fr: 'Des accessoires premium pour les professionnels, les créateurs et les gamers partout au Cameroun.',
              })}
            </p>
          </div>

          <div className="flex gap-8 text-sm text-zinc-500">
            <a href="#" className="transition hover:text-zinc-900 dark:hover:text-white">
              Instagram
            </a>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="transition hover:text-zinc-900 dark:hover:text-white">
              WhatsApp
            </a>
            <a href="#" className="transition hover:text-zinc-900 dark:hover:text-white">
              {t({ en: 'Terms', fr: 'Conditions' })}
            </a>
          </div>

          <p className="text-sm text-zinc-500">
            © 2026 Loving Tech Cameroon. {t({ en: 'All rights reserved.', fr: 'Tous droits réservés.' })}
          </p>
        </div>
      </footer>
    </main>
  );
}
