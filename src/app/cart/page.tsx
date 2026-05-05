import type { Metadata } from 'next'
import CartPageClient from './CartPageClient'

export const metadata: Metadata = {
  title: 'Panier — Loving Tech',
  description: 'Finalisez votre commande d\'accessoires tech premium. Livraison partout au Cameroun.',
}

export default function CartPage() {
  return <CartPageClient />
}
