'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import ProductDetailActions from '@/components/ProductDetailActions';
import { LOCAL_PRODUCTS } from '@/lib/localProducts';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { t } = useLanguage();
  const product = LOCAL_PRODUCTS.find((p) => p.id === id);

  const [mainImgSrc, setMainImgSrc] = useState(product?.images?.[0] || '/images/placeholder.svg');

  useEffect(() => {
    setMainImgSrc(product?.images?.[0] || '/images/placeholder.svg');
  }, [id]);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 pt-28 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Gallery */}
        <div className="space-y-6">
          <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <Image
              src={mainImgSrc}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
              {(product.images.length > 0 ? product.images : ['/images/placeholder.svg']).slice(0, 4).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImgSrc(img)}
                  className={`aspect-square relative bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden border-2 transition ${
                    mainImgSrc === img
                      ? 'border-zinc-900 dark:border-white'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition group mb-8"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
            {t({ en: 'Back to Catalog', fr: 'Retour au catalogue' })}
          </Link>

          <span className="text-zinc-500 font-mono uppercase tracking-[0.3em] text-sm mb-4">
            {product.brand}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold text-zinc-600 dark:text-zinc-300 mb-4">
            {product.price_xaf.toLocaleString('fr-FR')} XAF
          </p>
          <div className="mb-8">
            <span
              className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${
                product.stock_status === 'in_stock'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : product.stock_status === 'out_of_stock'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}
            >
              {product.stock_status === 'in_stock'
                ? t({ en: 'In Stock', fr: 'En stock' })
                : product.stock_status === 'out_of_stock'
                ? t({ en: 'Out of Stock', fr: 'Rupture de stock' })
                : t({ en: 'Pre-order', fr: 'Pré-commande' })}
            </span>
          </div>

          <div className="space-y-8 mb-12">
            <div>
              <h3 className="text-zinc-500 uppercase text-xs font-bold tracking-widest mb-4">
                {t({ en: 'Description', fr: 'Description' })}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">{product.description}</p>
            </div>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div>
                <h3 className="text-zinc-500 uppercase text-xs font-bold tracking-widest mb-4">
                  {t({ en: 'Technical Specs', fr: 'Fiche technique' })}
                </h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 border-t border-zinc-200 dark:border-zinc-900 pt-4">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">{key}</p>
                      <p className="text-zinc-800 dark:text-zinc-300 font-medium">{value as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ProductDetailActions product={product} />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-zinc-200 dark:border-zinc-900">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <ShieldCheck className="w-5 h-5 text-zinc-900 dark:text-white" />
              {t({ en: '100% Authentic', fr: '100% Authentique' })}
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Truck className="w-5 h-5 text-zinc-900 dark:text-white" />
              {t({ en: 'Fast Delivery', fr: 'Livraison rapide' })}
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <ShoppingBag className="w-5 h-5 text-zinc-900 dark:text-white" />
              {t({ en: 'Pay on Delivery', fr: 'Paiement à la livraison' })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
