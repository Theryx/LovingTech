import type { OrderStatus } from '@/lib/supabase'

export const ORDER_STATUS_LABELS: Record<OrderStatus, { en: string; fr: string }> = {
  pending: { en: 'Pending', fr: 'En attente' },
  confirmed: { en: 'Confirmed', fr: 'Confirmée' },
  dispatched: { en: 'Dispatched', fr: 'Expédiée' },
  delivered: { en: 'Delivered', fr: 'Livrée' },
  cancelled: { en: 'Cancelled', fr: 'Annulée' },
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-800' },
  confirmed: { bg: 'bg-brand-blue/10', text: 'text-brand-blue' },
  dispatched: { bg: 'bg-orange-100', text: 'text-orange-800' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
}

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  'pending',
  'confirmed',
  'dispatched',
  'delivered',
]

export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['dispatched', 'cancelled'],
  dispatched: ['delivered'],
  delivered: [],
  cancelled: [],
}

export const TABLE_HEADERS = [
  { key: 'order_ref', en: 'Ref', fr: 'Réf.' },
  { key: 'product_name', en: 'Product', fr: 'Produit' },
  { key: 'customer_name', en: 'Customer', fr: 'Client' },
  { key: 'city', en: 'City', fr: 'Ville' },
  { key: 'total_price', en: 'Total', fr: 'Total' },
  { key: 'status', en: 'Status', fr: 'Statut' },
  { key: 'created_at', en: 'Date', fr: 'Date' },
  { key: 'actions', en: '', fr: '' },
] as const
