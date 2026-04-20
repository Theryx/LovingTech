'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductWithFeatured } from '@/lib/localProducts';
import LeadModal from './LeadModal';

interface ProductCardProps {
  product: ProductWithFeatured;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group cursor-pointer bg-white border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-900 rounded-3xl overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-700 transition"
      >
        <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              className="object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">No Image</div>
          )}
          <div className="absolute top-4 right-4 bg-white/70 dark:bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            {product.brand}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">{product.name}</h3>
          <p className="text-zinc-500 text-sm mt-1 line-clamp-1">{product.description}</p>

          <div className="flex justify-between items-center mt-6">
            <span className="text-lg font-bold text-zinc-900 dark:text-white">{product.price_xaf.toLocaleString('fr-FR')} XAF</span>
            <Link
              href={`/product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 text-white dark:bg-white dark:text-black text-xs px-5 py-2.5 rounded-full font-bold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition"
            >
              Details
            </Link>
          </div>
        </div>
      </div>

      <LeadModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
