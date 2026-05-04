'use client'

import { useEffect } from 'react'

interface Fbq {
  (action: string, param: string): void
  (action: string, param: string, data: Record<string, unknown>): void
  push: (...args: unknown[]) => number
  loaded: boolean
  version: string
  queue: unknown[]
  callMethod?: (...a: unknown[]) => void
}

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: unknown
  }
}

export function MetaPixel({ pixelId }: { pixelId: string }) {
  useEffect(() => {
    if (!pixelId || pixelId === 'undefined' || pixelId === '') return
    const w = window as Window & { _fbq?: unknown }
    if (!w._fbq) {
      w._fbq = 1
      const f = function (this: Fbq | void) {
        // eslint-disable-next-line prefer-rest-params
        const args = arguments
        if (this && this.callMethod) {
          this.callMethod.apply(this, args as unknown as unknown[])
        } else if (this && this.queue) {
          Array.prototype.push.apply(this.queue, args as unknown as unknown[])
        }
      } as unknown as Fbq
      f.push = f as unknown as (...a: unknown[]) => number
      f.loaded = true
      f.version = '2.0'
      f.queue = []
      window.fbq = f

      const script = document.createElement('script')
      script.async = true
      script.src = 'https://connect.facebook.net/en_US/fbevents.js'
      const first = document.getElementsByTagName('script')[0]
      first.parentNode?.insertBefore(script, first)
    }
    window.fbq?.('init', pixelId)
    window.fbq?.('track', 'PageView')
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
