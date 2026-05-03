'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ShieldCheck, Truck, ShoppingBag } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import Navbar from '@/components/Navbar'
import ProductGallery from '@/components/ProductGallery'
import ProductDetailActions from '@/components/ProductDetailActions'
import ProductCard from '@/components/ProductCard'
import ReviewSection from '@/components/ReviewSection'
import ProductTabs from '@/components/ProductTabs'
import ProductSpecs from '@/components/ProductSpecs'
import WhatsInTheBox from '@/components/WhatsInTheBox'

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
  const [approvedReviewsCount, setApprovedReviewsCount] = useState(0)
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

          {/* Product Tabs Section */}
          <div className="mb-8">
            <ProductTabs reviewsCount={approvedReviewsCount}>
              {{
                details: (
                  <div className="space-y-4">
                    <p className="text-lg leading-relaxed text-brand-dark/60">
                      {t({
                        en: product.description_en || product.description || '',
                        fr: product.description_fr || product.description || '',
                      })}
                    </p>
                    {/* Show key specs in details tab if available */}
                    {product.key_specs && product.key_specs.length > 0 && product.specs && (
                      <div className="mt-6">
                        <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-grey">
                          {t({ en: 'Highlights', fr: 'Points forts' })}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {product.key_specs
                            .filter((key: string) => product.specs[key])
                            .slice(0, 4)
                            .map((key: string) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-brand-blue" />
                                <span className="text-sm text-brand-dark/70">
                                  <span className="font-medium capitalize">{key}:</span>{' '}
                                  {product.specs[key]}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ),
                specifications: (
                  <ProductSpecs 
                    specs={product.specs || {}} 
                    keySpecs={product.key_specs || []} 
                  />
                ),
                boxContents: (
                  <WhatsInTheBox 
                    boxContents={product.box_contents || []} 
                    boxContentsFr={product.box_contents_fr || []} 
                  />
                ),
                reviews: isDbProduct ? (
                  <ReviewSection 
                    productId={product.id} 
                    onApprovedCountChange={setApprovedReviewsCount}
                  />
                ) : (
                  <p className="text-sm text-brand-dark/40">
                    {t({ 
                      en: 'Reviews are only available for database products.', 
                      fr: 'Les avis sont uniquement disponibles pour les produits de la base de données.' 
                    })}
                  </p>
                ),
              }}
            </ProductTabs>
          </div>

          <ProductDetailActions product={product} />

          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                <ShieldCheck className="h-5 w-5 text-brand-blue" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-dark">
                  {t({ en: '100% Authentic', fr: '100% Authentique' })}
                </p>
                <p className="text-xs text-brand-dark/60">
                  {t({ en: 'Genuine products only', fr: 'Produits authentiques uniquement' })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                <Truck className="h-5 w-5 text-brand-blue" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-dark">
                  {t({ en: 'Fast Delivery', fr: 'Livraison Rapide' })}
                </p>
                <p className="text-xs text-brand-dark/60">
                  {t({ en: 'Nationwide delivery', fr: 'Livraison nationale' })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                <ShoppingBag className="h-5 w-5 text-brand-blue" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-dark">
                  {t({ en: 'Pay on Delivery', fr: 'Payer à la livraison' })}
                </p>
                <p className="text-xs text-brand-dark/60">
                  {t({ en: 'Cash on delivery', fr: 'Paiement à la livraison' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
