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
        className="group cursor-pointer bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden hover:border-zinc-700 transition"
      >
        <div className="aspect-square relative bg-zinc-900 overflow-hidden">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              className="object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700">No Image</div>
          )}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {product.brand}
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold tracking-tight">{product.name}</h3>
          <p className="text-zinc-500 text-sm mt-1 line-clamp-1">{product.description}</p>
          
          <div className="flex justify-between items-center mt-6">
            <span className="text-lg font-bold">{product.price_xaf.toLocaleString()} XAF</span>
            <Link 
              href={`/product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-black text-xs px-5 py-2.5 rounded-full font-bold hover:bg-zinc-200 transition"
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
