import type { Metadata } from 'next'
import ShippingPageClient from './ShippingPageClient'

export const metadata: Metadata = {
  title: 'Livraison / Shipping — Loving Tech',
  description: 'Informations de livraison : zones, tarifs et délais partout au Cameroun.',
}

export default function ShippingPage() {
  return <ShippingPageClient />
}
