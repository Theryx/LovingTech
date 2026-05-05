'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PLACEHOLDER = '/images/placeholder.svg'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const displayImages = images?.length > 0 ? images : [PLACEHOLDER]
  const [mainImgSrc, setMainImgSrc] = useState(displayImages[0])
  const [thumbErrors, setThumbErrors] = useState<Record<number, boolean>>({})
  const [thumbStart, setThumbStart] = useState(0)
  const thumbsPerPage = 4
  const hasThumbs = displayImages.length > 1
  const canScrollLeft = thumbStart > 0
  const canScrollRight = hasThumbs && thumbStart + thumbsPerPage < displayImages.length

  const scrollThumbsLeft = () => {
    setThumbStart(s => Math.max(0, s - thumbsPerPage))
  }

  const scrollThumbsRight = () => {
    setThumbStart(s => Math.min(displayImages.length - thumbsPerPage, s + thumbsPerPage))
  }

  const visibleThumbs = hasThumbs ? displayImages.slice(thumbStart, thumbStart + thumbsPerPage) : []

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

      {hasThumbs && (
        <div className="flex items-center gap-2">
          {displayImages.length > thumbsPerPage && (
            <button
              onClick={scrollThumbsLeft}
              disabled={!canScrollLeft}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-grey/20 bg-white text-brand-dark/60 transition hover:text-brand-dark disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous thumbnails"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          <div
            className="flex-1 grid grid-cols-4 gap-3"
            role="group"
            aria-label={`${productName} image thumbnails`}
          >
            {visibleThumbs.map((img, idx) => {
              const realIdx = thumbStart + idx
              return (
                <button
                  key={realIdx}
                  onClick={() => setMainImgSrc(thumbErrors[realIdx] ? PLACEHOLDER : img)}
                  aria-label={`View image ${realIdx + 1} of ${displayImages.length}`}
                  aria-pressed={mainImgSrc === img}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-brand-grey/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${
                    mainImgSrc === img
                      ? 'border-brand-blue'
                      : 'border-brand-grey/20 hover:border-brand-blue/60'
                  }`}
                >
                  <Image
                    src={thumbErrors[realIdx] ? PLACEHOLDER : img}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="25vw"
                    className="object-cover"
                    onError={() => setThumbErrors(prev => ({ ...prev, [realIdx]: true }))}
                  />
                </button>
              )
            })}
          </div>

          {displayImages.length > thumbsPerPage && (
            <button
              onClick={scrollThumbsRight}
              disabled={!canScrollRight}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-grey/20 bg-white text-brand-dark/60 transition hover:text-brand-dark disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next thumbnails"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
