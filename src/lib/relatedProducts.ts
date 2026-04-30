import { supabase, Product } from './supabase'

export async function getRelatedProducts(
  productId: string,
  category: string,
  tags: string[]
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .neq('id', productId)
    .limit(8)

  if (error || !data) return []

  const inStock = data.filter(
    p => p.stock_qty === undefined || p.stock_qty === null || p.stock_qty > 0
  )

  const scored = inStock.map(p => {
    const sharedTags = (p.tags || []).filter((t: string) => tags.includes(t))
    return { product: p, score: sharedTags.length * 2 }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, 4).map(s => s.product)
}
