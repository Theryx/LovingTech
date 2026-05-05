'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ShieldCheck, Truck, ShoppingBag, Check } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import Navbar from '@/components/Navbar'
import ProductGallery from '@/components/ProductGallery'
import ProductDetailActions from '@/components/ProductDetailActions'
import ProductCard from '@/components/ProductCard'
import ReviewSection from '@/components/ReviewSection'
import ProductTabs from '@/components/ProductTabs'
import ProductSpecs from '@/components/ProductSpecs'

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
  const { t, language } = useLanguage()
  const [approvedReviewsCount, setApprovedReviewsCount] = useState(0)
  const conditionStyle = product.condition ? CONDITION_BADGE[product.condition] : null

  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <Navbar />

      {/* Product Grid Section */}
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
              {(product.price_xaf || 0).toLocaleString('fr-FR')} XAF
            </p>
            {product.compare_at_price && (
              <p className="text-lg text-brand-dark/40 line-through">
                {product.compare_at_price.toLocaleString('fr-FR')} XAF
              </p>
            )}
          </div>

          <div className="mb-8">
            {product.stock_qty >= 1 ? (
              <span className="inline-flex px-3 py-1.5 rounded-full text-sm font-medium border border-[#92400E] bg-[#FEF3C7]/60 text-[#92400E]">
                {t({
                  en: `In Stock (${product.stock_qty.toLocaleString('en-US')})`,
                  fr: `En stock (${product.stock_qty.toLocaleString('fr-FR')})`,
                })}
              </span>
            ) : product.stock_status === 'pre_order' ? (
              <span className="inline-flex px-3 py-1.5 rounded-full text-sm font-medium bg-brand-orange/15 text-brand-orange">
                {t({ en: 'Pre-order', fr: 'Pré-commande' })}
              </span>
            ) : (
              <span className="inline-flex px-3 py-1.5 rounded-full text-sm font-medium bg-brand-dark text-white ring-1 ring-brand-grey/20">
                {t({ en: 'Out of Stock', fr: 'En rupture' })}
              </span>
            )}
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

      {/* Tabbed Section */}
      <section className="max-w-7xl mx-auto px-6 pb-12 border-t border-brand-grey/20 pt-12">
        <ProductTabs reviewsCount={approvedReviewsCount}>
          {{
            details: (
              <div>
                {product.warranty_info && (
                  <div className="rounded-xl border border-brand-grey/20 p-4">
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-dark/60">
                      {t({ en: 'Warranty', fr: 'Garantie' })}
                    </h4>
                    <p className="text-sm text-brand-dark/70">{product.warranty_info}</p>
                  </div>
                )}
                {!product.warranty_info && (
                  <p className="text-sm text-brand-dark/40">
                    {t({ en: 'No additional details available.', fr: 'Aucun détail supplémentaire disponible.' })}
                  </p>
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
              <div>
                {((language === 'fr' && product.box_contents_fr?.length) || product.box_contents?.length) ? (
                  <ul className="space-y-3">
                    {(language === 'fr' && product.box_contents_fr?.length 
                      ? product.box_contents_fr 
                      : product.box_contents || []
                    ).map((item: string, index: number) => (
                      <li key={index} className="flex items-center gap-3 text-brand-dark">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-brand-dark/40">
                    {t({
                      en: 'Package contents information not available',
                      fr: "Informations sur le contenu du colis non disponibles",
                    })}
                  </p>
                )}
              </div>
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
