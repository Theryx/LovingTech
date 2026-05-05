'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { ProductWithFeatured } from '@/lib/localProducts'
import { useLanguage } from '@/context/LanguageContext'
import LeadModal from './LeadModal'
import Button from './ui/Button'

interface ProductDetailActionsProps {
  product: ProductWithFeatured
}

export default function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useLanguage()
  const isOutOfStock = product.stock_status === 'out_of_stock'

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="whatsapp"
        disabled={isOutOfStock}
        className="rounded-2xl py-5 text-lg font-bold active:scale-[0.98]"
      >
        <MessageCircle className="w-6 h-6" />
        {isOutOfStock
          ? t({ en: 'Out of Stock', fr: 'Rupture de stock' })
          : t({ en: 'Order via WhatsApp', fr: 'Commander via WhatsApp' })}
      </Button>

      <LeadModal product={product} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
