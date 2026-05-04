import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { LOCAL_PRODUCTS } from '@/lib/localProducts'
import { productService } from '@/lib/supabase'
import { getRelatedProducts } from '@/lib/relatedProducts'
import ProductPageClient from './ProductPageClient'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  let product = await productService.getById(params.id)

  if (
    !product &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)
  ) {
    const local = LOCAL_PRODUCTS.find(p => p.id === params.id)
    if (local) product = await productService.getByName(local.name)
  }

  if (!product) return {}
  const title = `${product.name_fr || product.name} — ${product.price_xaf ? product.price_xaf.toLocaleString('fr-FR') : '0'} FCFA | Loving Tech`
  const description = (product.description_fr || product.description || '').slice(0, 155)
  const image = product.images?.[0]
  return {
    title,
    description,
    openGraph: { title, description, images: image ? [{ url: image }] : [] },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : [] },
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProductPage({ params }: { params: { id: string } }) {
  let product: any = null

  // Try DB first
  try {
    let db = await productService.getById(params.id)

    // If not found by ID, and it's a legacy ID (like "12"), try matching by name in DB
    if (!db && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)) {
      const local = LOCAL_PRODUCTS.find(p => p.id === params.id)
      if (local) {
        db = await productService.getByName(local.name)
      }
    }

    if (db) product = db
  } catch (err) {
    console.error('DB fetch error on product page:', err)
  }

  // Fallback to local
  if (!product) {
    product = LOCAL_PRODUCTS.find(p => p.id === params.id)
  }

  if (!product) notFound()

  const isDbProduct = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    product.id
  )
  const related = isDbProduct
    ? await getRelatedProducts(product.id, product.category || '', product.tags || [])
    : []

  const isInStock = product.stock_status === 'in_stock'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name_fr || product.name,
    image: product.images || [],
    description: product.description_fr || product.description || '',
    brand: { '@type': 'Brand', name: product.brand || 'Loving Tech' },
    offers: {
      '@type': 'Offer',
      price: product.price_xaf,
      priceCurrency: 'XAF',
      availability: `https://schema.org/${isInStock ? 'InStock' : 'OutOfStock'}`,
      seller: {
        '@type': 'Organization',
        name: 'Loving Tech',
        url: 'https://loving-tech.vercel.app',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient product={product} related={related} isDbProduct={isDbProduct} />
    </>
  )
}
