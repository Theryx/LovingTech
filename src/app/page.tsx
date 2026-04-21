'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import { LOCAL_PRODUCTS, ProductWithFeatured } from '@/lib/localProducts';
import { Product, productService } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

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

  const featuredProducts = products.filter((p) => (p as ProductWithFeatured).featured).slice(0, 4);

  const heroBgImage =
    'https://resource.logitech.com/w_692,c_lpad,ar_4:3,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/keyboards/signature-slim-solar-plus-k980-for-business/gallery/esp/b2b-k980-graphite-us-gallery1-esp.png?v=1';

  return (
    <main className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white">
      <Navbar />

      {/* Hero */}
      <section
        className="relative px-6 py-32 text-center bg-zinc-900 dark:bg-black overflow-hidden"
        style={{
          backgroundImage: `url(${heroBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black dark:from-black/70 dark:via-black/50 dark:to-black" />
        <div className="relative z-10">
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl mb-6 text-white">
            {t({ en: 'Premium Tech', fr: 'Tech Premium' })} <br />
            <span className="text-zinc-400">{t({ en: 'For Professionals.', fr: 'Pour Professionnels.' })}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-zinc-300 text-lg mb-10">
            {t({
              en: 'The finest collection of Logitech, Anker, and Keychron gadgets in Cameroon. 100% Authentic. Delivered in 24h.',
              fr: 'La meilleure collection de gadgets Logitech, Anker et Keychron au Cameroun. 100% Authentique. Livré en 24h.',
            })}
          </p>
          <a
            href="#catalog"
            className="inline-block bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition"
          >
            {t({ en: 'Browse Catalog', fr: 'Parcourir le catalogue' })}
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-xl">{t({ en: '100% Authentic', fr: '100% Authentique' })}</h3>
          <p className="text-zinc-500">{t({ en: 'Directly sourced premium brands. No counterfeits.', fr: 'Marques premium approvisionnées directement. Pas de contrefaçons.' })}</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
            <Truck className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-xl">{t({ en: 'Fast Delivery', fr: 'Livraison rapide' })}</h3>
          <p className="text-zinc-500">{t({ en: '24h in Douala, 48h in Yaoundé. Express shipping.', fr: '24h à Douala, 48h à Yaoundé. Livraison express.' })}</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-xl">{t({ en: 'Pay on Delivery', fr: 'Paiement à la livraison' })}</h3>
          <p className="text-zinc-500">{t({ en: 'Inspect your gadget before paying. MoMo supported.', fr: 'Inspectez votre gadget avant de payer. MoMo accepté.' })}</p>
        </div>
      </section>

      {/* Featured Products */}
      <section id="catalog" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-bold mb-3 tracking-tight">
              {t({ en: 'Featured Collection', fr: 'Collection en vedette' })}
            </h2>
            <p className="text-zinc-500 text-lg">
              {t({ en: 'Carefully curated for peak performance.', fr: 'Soigneusement sélectionné pour des performances optimales.' })}
            </p>
          </div>
          <Link
            href="/products"
            className="shrink-0 flex items-center gap-2 mt-2 px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            {t({ en: 'See All', fr: 'Voir tout' })}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-bold italic tracking-tighter">LOVING TECH</div>
          <div className="flex gap-8 text-zinc-500 text-sm">
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition">Instagram</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition">WhatsApp</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition">{t({ en: 'Terms', fr: 'Conditions' })}</a>
          </div>
          <p className="text-zinc-500 text-sm">© 2026 Loving Tech Cameroon. {t({ en: 'All rights reserved.', fr: 'Tous droits réservés.' })}</p>
        </div>
      </footer>
    </main>
  );
}
