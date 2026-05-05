'use client'

import { ProductWithFeatured } from '@/lib/localProducts'
import Card from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import { ShoppingCart } from 'lucide-react'

interface ProductCardProps {
  product: ProductWithFeatured
}

export default function ProductCard({ product }: ProductCardProps) {
  const { language } = useLanguage()
  const { addItem } = useCart()
  const isOutOfStock = product.stock_status === 'out_of_stock'

  const trackOutOfStockClick = () => {
    if (!isOutOfStock) return
    fetch('/api/out-of-stock-interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: product.id,
        product_name: product.name,
      }),
    }).catch(() => {})
  }

  return (
    <Card
      href={`/product/${product.id}`}
      onClick={trackOutOfStockClick}
      image={product.images?.[0] || '/images/placeholder.svg'}
      name={product.name}
      price={product.price_xaf}
      compareAtPrice={product.compare_at_price ?? undefined}
      brandLabel={product.brand}
      isOutOfStock={isOutOfStock}
      badge={
        isOutOfStock ? (
          <Badge
            variant="out_of_stock"
            label={language === 'fr' ? 'Rupture de stock' : 'Out of Stock'}
          />
        ) : product.condition === 'second_hand' ? (
          <Badge variant="second_hand" label={language === 'fr' ? 'Occasion' : 'Second-hand'} />
        ) : product.condition === 'refurbished' ? (
          <Badge
            variant="refurbished"
            label={language === 'fr' ? 'Reconditionné' : 'Refurbished'}
          />
        ) : (
          <Badge variant="new" label={language === 'fr' ? 'Neuf' : 'New'} />
        )
      }
      ctaSlot={
        <Button
          variant="primary"
          className="w-full justify-center gap-1.5 py-2 text-xs"
          disabled={isOutOfStock}
          onClick={() => addItem(product)}
          aria-label={language === 'fr' ? `Ajouter ${product.name} au panier` : `Add ${product.name} to cart`}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {language === 'fr' ? 'Ajouter' : 'Add to cart'}
        </Button>
      }
    />
  )
}
