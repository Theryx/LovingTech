import { supabase, Product } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import ProductDetailActions from '@/components/ProductDetailActions';

async function getProduct(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data;
  } catch (e) {
    return null;
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="p-6 max-w-7xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
          Back to Catalog
        </Link>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Gallery */}
        <div className="space-y-6">
          <div className="aspect-square relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700">No Image</div>
            )}
          </div>
          
          {/* Thumbnails if multiple images exist */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <div key={idx} className="aspect-square relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${idx}`}
                    fill
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-zinc-500 font-mono uppercase tracking-[0.3em] text-sm mb-4">
            {product.brand}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold text-zinc-300 mb-8">
            {product.price_xaf.toLocaleString()} XAF
          </p>

          <div className="space-y-8 mb-12">
            <div>
              <h3 className="text-zinc-500 uppercase text-xs font-bold tracking-widest mb-4">Description</h3>
              <p className="text-zinc-400 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            {/* Technical Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div>
                <h3 className="text-zinc-500 uppercase text-xs font-bold tracking-widest mb-4">Technical Specs</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 border-t border-zinc-900 pt-4">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-zinc-600 text-xs mb-1 uppercase tracking-wider">{key}</p>
                      <p className="text-zinc-300 font-medium">{value as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Component (Client-side for Modal) */}
          <ProductDetailActions product={product} />

          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-zinc-900">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <ShieldCheck className="w-5 h-5 text-white" />
              100% Authentic
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Truck className="w-5 h-5 text-white" />
              Fast Delivery
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <ShoppingBag className="w-5 h-5 text-white" />
              Pay on Delivery
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
