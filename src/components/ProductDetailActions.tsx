'use client'

import { useState } from 'react'
import { MessageCircle, ShoppingCart, Minus, Plus } from 'lucide-react'
import { ProductWithFeatured } from '@/lib/localProducts'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import LeadModal from './LeadModal'
import Button from './ui/Button'

interface ProductDetailActionsProps {
  product: ProductWithFeatured
}

export default function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { t } = useLanguage()
  const { addItem } = useCart()
  const isOutOfStock = product.stock_status === 'out_of_stock'

  return (
    <>
      <div className="space-y-4">
        {!isOutOfStock && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-brand-dark/60">
              {t({ en: 'Quantity:', fr: 'Quantité :' })}
            </span>
            <div className="flex items-center rounded-lg border border-brand-grey/30">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-2.5 text-brand-dark/60 hover:text-brand-dark transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 text-sm font-semibold text-brand-dark min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => Math.min(99, q + 1))}
                className="p-2.5 text-brand-dark/60 hover:text-brand-dark transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => addItem(product, quantity)}
            variant="outline"
            disabled={isOutOfStock}
            className="rounded-2xl py-5 text-base font-semibold active:scale-[0.98] flex-1"
          >
            <ShoppingCart className="w-5 h-5" />
            {t({ en: 'Add to Cart', fr: 'Ajouter au panier' })}
          </Button>

          <Button
            onClick={() => setIsModalOpen(true)}
            variant="whatsapp"
            disabled={isOutOfStock}
            className="rounded-2xl py-5 text-base font-bold active:scale-[0.98] flex-1"
          >
            <MessageCircle className="w-5 h-5" />
            {isOutOfStock
              ? t({ en: 'Out of Stock', fr: 'Rupture de stock' })
              : t({ en: 'Order via WhatsApp', fr: 'Commander via WhatsApp' })}
          </Button>
        </div>
      </div>

      <LeadModal product={product} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
