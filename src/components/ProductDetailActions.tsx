'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/supabase';
import LeadModal from './LeadModal';

interface ProductDetailActionsProps {
  product: Product;
}

export default function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-zinc-900 text-white dark:bg-white dark:text-black py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition active:scale-[0.98]"
      >
        <ShoppingCart className="w-6 h-6" />
        Order via WhatsApp
      </button>

      <LeadModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
