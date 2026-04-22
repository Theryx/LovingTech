'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { ProductWithFeatured } from '@/lib/localProducts';
import { useLanguage } from '@/context/LanguageContext';
import LeadModal from './LeadModal';

interface ProductDetailActionsProps {
  product: ProductWithFeatured;
}

export default function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-zinc-900 text-white dark:bg-white dark:text-black py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition active:scale-[0.98]"
      >
        <ShoppingCart className="w-6 h-6" />
        {t({ en: 'Order via WhatsApp', fr: 'Commander via WhatsApp' })}
      </button>

      <LeadModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
