import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { LOCAL_PRODUCTS } from '@/lib/localProducts';
import { productService } from '@/lib/supabase';
import { getRelatedProducts } from '@/lib/relatedProducts';
import Navbar from '@/components/Navbar';
import ProductGallery from '@/components/ProductGallery';
import ProductDetailActions from '@/components/ProductDetailActions';
import ProductCard from '@/components/ProductCard';
import ReviewSection from '@/components/ReviewSection';

const CONDITION_BADGE: Record<string, { bg: string; text: string; labelFr: string; labelEn: string }> = {
  new:          { bg: '#D1FAE5', text: '#065F46', labelFr: 'Neuf',          labelEn: 'New' },
  refurbished:  { bg: '#DBEAFE', text: '#1E3A8A', labelFr: 'Reconditionné', labelEn: 'Refurbished' },
  second_hand:  { bg: '#FEF3C7', text: '#92400E', labelFr: 'Occasion',      labelEn: 'Second-hand' },
};

export default async function ProductPage({ params }: { params: { id: string } }) {
  let product = LOCAL_PRODUCTS.find(p => p.id === params.id) as any;

  if (!product) {
    try {
      const db = await productService.getById(params.id);
      if (db) product = db;
    } catch {
      // fall through to notFound
    }
  }

  if (!product) notFound();

  const conditionStyle = product.condition ? CONDITION_BADGE[product.condition] : null;

  const isDbProduct = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);
  const related = isDbProduct
    ? await getRelatedProducts(product.id, product.category || '', product.tags || [])
    : [];

  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 pt-28 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <ProductGallery images={product.images ?? []} productName={product.name} />

        <div className="flex flex-col">
          <Link
            href="/"
            className="group mb-8 inline-flex items-center gap-2 text-brand-grey transition hover:text-brand-blue"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
            Back to Catalog
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
                {conditionStyle.labelFr} / {conditionStyle.labelEn}
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{product.name}</h1>

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
                ? 'En stock / In Stock'
                : product.stock_status === 'out_of_stock'
                ? 'Rupture / Out of Stock'
                : 'Pré-commande / Pre-order'}
            </span>
          </div>

          <div className="space-y-8 mb-12">
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-grey">
                Description
              </h3>
              {product.description_fr || product.description_en ? (
                <div className="space-y-3">
                  {product.description_fr && (
                    <p className="text-lg leading-relaxed text-brand-dark/60">{product.description_fr}</p>
                  )}
                  {product.description_en && product.description_fr && (
                    <hr className="border-brand-grey/20" />
                  )}
                  {product.description_en && (
                    <p className="text-lg leading-relaxed text-brand-dark/60">{product.description_en}</p>
                  )}
                </div>
              ) : (
                <p className="text-lg leading-relaxed text-brand-dark/60">{product.description}</p>
              )}
            </div>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-grey">
                  Technical Specs
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
                  Garantie / Warranty
                </h3>
                <p className="text-sm text-brand-dark/60">{product.warranty_info}</p>
              </div>
            )}
          </div>

          <ProductDetailActions product={product} />

          <div className="mt-12 grid grid-cols-1 gap-6 border-t border-brand-grey/20 pt-12 sm:grid-cols-3">
            <div className="flex items-center gap-3 text-sm text-brand-grey">
              <ShieldCheck className="h-5 w-5 text-brand-blue" />
              100% Authentic
            </div>
            <div className="flex items-center gap-3 text-sm text-brand-grey">
              <Truck className="h-5 w-5 text-brand-blue" />
              Fast Delivery
            </div>
            <div className="flex items-center gap-3 text-sm text-brand-grey">
              <ShoppingBag className="h-5 w-5 text-brand-blue" />
              Pay on Delivery
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
            Vous aimerez aussi / You might also like
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
