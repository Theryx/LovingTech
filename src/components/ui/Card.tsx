'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const PLACEHOLDER = '/images/placeholder.svg'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CardProps {
  image: string
  badge?: React.ReactNode
  brandLabel?: string
  name: string
  price: number
  compareAtPrice?: number
  ctaSlot?: React.ReactNode
  isOutOfStock?: boolean
  className?: string
  priority?: boolean
}

const Card = ({
  image,
  badge,
  brandLabel,
  name,
  price,
  compareAtPrice,
  ctaSlot,
  isOutOfStock,
  className,
  priority = false,
}: CardProps) => {
  const [imgSrc, setImgSrc] = useState(image || PLACEHOLDER)

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-brand-grey/20 transition-all hover:scale-[1.01] hover:shadow-md',
        className
      )}
    >
      {/* Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-grey/10">
        <Image
          src={imgSrc}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          className={cn(
            'object-cover transition-transform duration-500',
            isOutOfStock ? 'grayscale opacity-60' : 'hover:scale-110'
          )}
          onError={() => setImgSrc(PLACEHOLDER)}
        />

        {badge && <div className="absolute top-3 left-3 z-10">{badge}</div>}

        {brandLabel && (
          <div className="absolute top-3 right-3 z-10">
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-dark backdrop-blur-sm border border-brand-grey/20">
              {brandLabel}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="mb-1 line-clamp-1 text-lg font-bold text-brand-dark">{name}</h3>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold text-brand-dark">{(price || 0).toLocaleString()} FCFA</span>
          {compareAtPrice && (
            <span className="text-sm text-brand-dark/40 line-through">
              {compareAtPrice.toLocaleString()} FCFA
            </span>
          )}
        </div>

        {ctaSlot && <div className="mt-auto pt-2">{ctaSlot}</div>}
      </div>
    </div>
  )
}

export default Card
