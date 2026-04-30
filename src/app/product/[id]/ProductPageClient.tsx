'use client'

import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Truck, ShoppingBag } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import Navbar from '@/components/Navbar'
import ProductGallery from '@/components/ProductGallery'
import ProductDetailActions from '@/components/ProductDetailActions'
import ProductCard from '@/components/ProductCard'
import ReviewSection from '@/components/ReviewSection'

const CONDITION_BADGE: Record<
  string,
  { bg: string; text: string; labelFr: string; labelEn: string }
> = {
  new: { bg: '#D1FAE5', text: '#065F46', labelFr: 'Neuf', labelEn: 'New' },
  refurbished: { bg: '#DBEAFE', text: '#1E3A8A', labelFr: 'Reconditionné', labelEn: 'Refurbished' },
  second_hand: { bg: '#FEF3C7', text: '#92400E', labelFr: 'Occasion', labelEn: 'Second-hand' },
}

export default function ProductPageClient({
  product,
  related,
  isDbProduct,
}: {
  product: any
  related: any[]
  isDbProduct: boolean
}) {
  const { t } = useLanguage()
  const conditionStyle = product.condition ? CONDITION_BADGE[product.condition] : null

  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 pt-28 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <ProductGallery images={product.images ?? []} productName={product.name} />

        <div className="flex flex-col">
          <Link
            href="/products"
            className="group mb-8 inline-flex items-center gap-2 text-brand-grey transition hover:text-brand-blue"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
            {t({ en: 'Back to Catalog', fr: 'Retour au catalogue' })}
          </Link>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm font-mono uppercase tracking-[0.3em] text-brand-grey">
              {product.brand}
            </span>
            {conditionStyle && (
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: conditionStyle.bg, color: conditionStyle.text }}
              >
                {t({ en: conditionStyle.labelEn, fr: conditionStyle.labelFr })}
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {t({ en: product.name_en || product.name, fr: product.name_fr || product.name })}
          </h1>

          <div className="flex items-baseline gap-3 mb-4">
            <p className="text-2xl font-semibold text-brand-blue">
              {product.price_xaf.toLocaleString('fr-FR')} XAF
            </p>
            {product.compare_at_price && (
              <p className="text-lg text-brand-dark/40 line-through">
                {product.compare_at_price.toLocaleString('fr-FR')} XAF
              </p>
            )}
          </div>

          <div className="mb-8">
            <span
              className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${
                product.stock_status === 'in_stock'
                  ? 'bg-brand-blue/15 text-brand-blue'
                  : product.stock_status === 'out_of_stock'
                    ? 'bg-brand-dark text-white ring-1 ring-brand-grey/20'
                    : 'bg-brand-orange/15 text-brand-orange'
              }`}
            >
              {product.stock_status === 'in_stock'
                ? t({ en: 'In Stock', fr: 'En stock' })
                : product.stock_status === 'out_of_stock'
                  ? t({ en: 'Out of Stock', fr: 'En rupture' })
                  : t({ en: 'Pre-order', fr: 'Pré-commande' })}
            </span>
            {typeof product.stock_qty === 'number' &&
              product.stock_qty > 0 &&
              product.stock_status === 'in_stock' && (
                <p className="mt-2 text-sm text-brand-dark/60">
                  {t({
                    en: `${product.stock_qty.toLocaleString('en-US')} item${product.stock_qty > 1 ? 's' : ''} available`,
                    fr: `${product.stock_qty.toLocaleString('fr-FR')} article${product.stock_qty > 1 ? 's' : ''} disponible${product.stock_qty > 1 ? 's' : ''}`,
                  })}
                </p>
              )}
          </div>

          <div className="space-y-8 mb-12">
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-grey">
                Description
              </h3>
              <p className="text-lg leading-relaxed text-brand-dark/60">
                {t({
                  en: product.description_en || product.description || '',
                  fr: product.description_fr || product.description || '',
                })}
              </p>
            </div>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-grey">
                  {t({ en: 'Technical Specs', fr: 'Fiche Technique' })}
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-brand-grey/20 pt-4">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key}>
                      <p className="mb-1 text-xs uppercase tracking-wider text-brand-grey">{key}</p>
                      <p className="font-medium text-brand-dark">{value as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.warranty_info && (
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-grey">
                  {t({ en: 'Warranty', fr: 'Garantie' })}
                </h3>
                <p className="text-sm text-brand-dark/60">{product.warranty_info}</p>
              </div>
            )}
          </div>

          <ProductDetailActions product={product} />

          <div className="mt-12 grid grid-cols-1 gap-6 border-t border-brand-grey/20 pt-12 sm:grid-cols-3">
            <div className="flex items-center gap-3 text-sm text-brand-grey">
              <ShieldCheck className="h-5 w-5 text-brand-blue" />
              {t({ en: '100% Authentic', fr: '100% Authentique' })}
            </div>
            <div className="flex items-center gap-3 text-sm text-brand-grey">
              <Truck className="h-5 w-5 text-brand-blue" />
              {t({ en: 'Fast Delivery', fr: 'Livraison Rapide' })}
            </div>
            <div className="flex items-center gap-3 text-sm text-brand-grey">
              <ShoppingBag className="h-5 w-5 text-brand-blue" />
              {t({ en: 'Pay on Delivery', fr: 'Payer à la livraison' })}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {isDbProduct && (
        <section className="max-w-7xl mx-auto px-6 pb-16 border-t border-brand-grey/20 pt-12">
          <ReviewSection productId={product.id} />
        </section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24 border-t border-brand-grey/20 pt-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-dark/50 mb-2">
            {t({ en: 'You might also like', fr: 'Vous aimerez aussi' })}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
