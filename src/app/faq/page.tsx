import type { Metadata } from 'next'
import FAQPageClient from './FAQPageClient'

export const metadata: Metadata = {
  title: 'FAQ / Help — Loving Tech',
  description: 'Frequently asked questions about orders, delivery, payments, and returns at Loving Tech Cameroun.',
}

export default function FAQPage() {
  return <FAQPageClient />
}
