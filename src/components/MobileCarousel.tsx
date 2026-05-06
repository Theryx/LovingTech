'use client'

import { useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

interface Props<T> {
  items: T[]
  slidesToScroll?: number
  gap?: number
  renderItem: (item: T, index: number) => React.ReactNode
  children: React.ReactNode
}

export default function MobileCarousel<T>({
  items,
  slidesToScroll = 1,
  gap = 16,
  renderItem,
  children,
}: Props<T>) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      slidesToScroll,
      loop: true,
      dragFree: false,
    },
    [Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true })]
  )

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit()
    }
  }, [items, emblaApi])

  const itemWidth = slidesToScroll > 1
    ? `calc(${100 / slidesToScroll}% - ${(gap * (slidesToScroll - 1)) / slidesToScroll}px)`
    : 'auto'

  return (
    <>
      <div className="sm:hidden overflow-hidden" ref={emblaRef}>
        <div className="flex" style={{ marginLeft: `-${gap}px` }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex-[0_0_auto] min-w-0"
              style={{ width: itemWidth, paddingLeft: `${gap}px` }}
            >
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      </div>

      <div className="hidden sm:block">{children}</div>
    </>
  )
}
