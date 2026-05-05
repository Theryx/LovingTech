'use client'

import { useState } from 'react'
import { ProductWithFeatured } from '@/lib/localProducts'
import LeadModal from './LeadModal'
import Card from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'
import { useLanguage } from '@/context/LanguageContext'

interface ProductCardProps {
  product: ProductWithFeatured
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { language } = useLanguage()

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
    <>
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
          <div className="flex gap-2">
            <span onClick={e => e.preventDefault()}>
              <Button
                variant="primary"
                className="flex-1 py-2 text-xs"
                onClick={() => setIsModalOpen(true)}
                aria-label={language === 'fr' ? `Commander ${product.name}` : `Order ${product.name}`}
              >
                {language === 'fr' ? 'Commander' : 'Order'}
              </Button>
            </span>
          </div>
        }
      />

      <LeadModal product={product} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
