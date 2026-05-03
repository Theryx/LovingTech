'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
    _fbq: unknown
  }
}

export function MetaPixel({ pixelId }: { pixelId: string }) {
  useEffect(() => {
    if (!pixelId) return

    const f = window as Window & { _fbq: unknown }
    if (!f._fbq) {
      f._fbq = 1
      window.fbq = function (this: { callMethod?: (...a: unknown[]) => void; queue?: unknown[] }) {
        if (this.callMethod) {
          this.callMethod.apply(this, arguments as unknown as unknown[])
        } else if (this.queue) {
          Array.prototype.push.apply(this.queue, arguments as unknown as unknown[])
        }
      } as unknown as typeof window.fbq
      window.fbq.push = window.fbq as unknown as (...args: unknown[]) => number
      window.fbq.loaded = true
      window.fbq.version = '2.0'
      ;(window.fbq as unknown as { queue: unknown[] }).queue = []

      const script = document.createElement('script')
      script.async = true
      script.src = 'https://connect.facebook.net/en_US/fbevents.js'
      const first = document.getElementsByTagName('script')[0]
      first.parentNode?.insertBefore(script, first)
    }
    window.fbq('init', pixelId)
    window.fbq('track', 'PageView')
  }, [pixelId])

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  )
}
