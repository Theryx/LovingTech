'use client'

import { useState } from 'react'
import Image from 'next/image'

const PLACEHOLDER = '/images/placeholder.svg'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const displayImages = images?.length > 0 ? images : [PLACEHOLDER]
  const [mainImgSrc, setMainImgSrc] = useState(displayImages[0])
  const [thumbErrors, setThumbErrors] = useState<Record<number, boolean>>({})

  return (
    <div className="space-y-6">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-brand-grey/20 bg-brand-grey/10">
        <Image
          src={mainImgSrc}
          alt={productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
          onError={() => setMainImgSrc(PLACEHOLDER)}
        />
      </div>

      {displayImages.length > 1 && (
        <div
          className="grid grid-cols-4 gap-4"
          role="group"
          aria-label={`${productName} image thumbnails`}
        >
          {displayImages.slice(0, 4).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImgSrc(thumbErrors[idx] ? PLACEHOLDER : img)}
              aria-label={`View image ${idx + 1} of ${Math.min(displayImages.length, 4)}`}
              aria-pressed={mainImgSrc === img}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-brand-grey/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${
                mainImgSrc === img
                  ? 'border-brand-blue'
                  : 'border-brand-grey/20 hover:border-brand-blue/60'
              }`}
            >
              <Image
                src={thumbErrors[idx] ? PLACEHOLDER : img}
                alt=""
                aria-hidden="true"
                fill
                sizes="25vw"
                className="object-cover"
                onError={() => setThumbErrors(prev => ({ ...prev, [idx]: true }))}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
