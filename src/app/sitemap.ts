import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const BASE_URL = 'https://loving-tech.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: products } = await supabase
    .from('products')
    .select('id, created_at')
    .eq('stock_status', 'in_stock')

  const productUrls: MetadataRoute.Sitemap = (products || []).map(p => ({
    url: `${BASE_URL}/product/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categories = ['keyboard', 'mouse', 'cable', 'speaker', 'solar_lamp']

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categories.map(c => ({
      url: `${BASE_URL}/products?category=${c}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    { url: `${BASE_URL}/return-policy`, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${BASE_URL}/politique-de-retour`, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${BASE_URL}/conditions`, changeFrequency: 'monthly' as const, priority: 0.4 },
    ...productUrls,
  ]
}
