'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const displayImages = images.length > 0 ? images : ['/images/placeholder.svg'];
  const [mainImgSrc, setMainImgSrc] = useState(displayImages[0]);

  return (
    <div className="space-y-6">
      <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <Image
          src={mainImgSrc}
          alt={productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {displayImages.slice(0, 4).map((img, idx) => (
          <button
            key={idx}
            onClick={() => setMainImgSrc(img)}
            className={`aspect-square relative bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden border-2 transition ${
              mainImgSrc === img
                ? 'border-zinc-900 dark:border-white'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
            }`}
          >
            <Image
              src={img}
              alt={`${productName} view ${idx + 1}`}
              fill
              sizes="25vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
