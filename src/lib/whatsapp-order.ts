import type { Order } from '@/lib/supabase'

export function formatWhatsAppOrderMessage(order: Order): string {
  const fmt = (n: number) => n.toLocaleString('fr-FR')
  const subtotal = order.unit_price * order.quantity
  const delivery = order.delivery_fee || 0
  const discount = order.promo_discount || 0

  const productLine = order.variant_chosen
    ? `${order.product_name} — ${order.variant_chosen}`
    : order.product_name

  const lines = [
    `📋 *Bon de commande — ${order.order_ref}*`,
    '',
    `*Produit :* ${productLine}`,
    `*Quantité :* ${order.quantity}`,
    `*Prix unitaire :* ${fmt(order.unit_price)} FCFA`,
    '',
    `*Client :* ${order.customer_name}`,
    `*Téléphone :* ${order.customer_phone}`,
    `*Ville :* ${order.city}`,
    `*Quartier :* ${order.quartier}`,
  ]

  if (order.bus_agency) {
    lines.push(`*Agence :* ${order.bus_agency}`)
  }
  if (order.address_details) {
    lines.push(`*Adresse :* ${order.address_details}`)
  }

  lines.push('')
  lines.push(`*Sous-total :* ${fmt(subtotal)} FCFA`)
  lines.push(
    `*Livraison :* ${delivery === 0 ? 'GRATUITE' : `${fmt(delivery)} FCFA`}`
  )

  if (discount > 0 && order.promo_code) {
    lines.push(`*Promo (${order.promo_code}) :* -${fmt(discount)} FCFA`)
  }

  lines.push(`*TOTAL :* ${fmt(order.total_price)} FCFA`)
  lines.push('')
  lines.push('Merci pour votre confiance ! 🙏')

  return lines.join('\n')
}

export function getWhatsAppShareUrl(message: string): string {
  return `https://wa.me/237655163248?text=${encodeURIComponent(message)}`
}
