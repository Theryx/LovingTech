'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { ProductWithFeatured } from '@/lib/localProducts';
import { useLanguage } from '@/context/LanguageContext';
import LeadModal from './LeadModal';
import Button from './ui/Button';

interface ProductDetailActionsProps {
  product: ProductWithFeatured;
}

export default function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="whatsapp"
        className="rounded-2xl py-5 text-lg font-bold active:scale-[0.98]"
      >
        <ShoppingCart className="w-6 h-6" />
        {t({ en: 'Order via WhatsApp', fr: 'Commander via WhatsApp' })}
      </Button>

      <LeadModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
