import type { OrderStatus } from '@/lib/supabase'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
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
  { key: 'order_ref', label: 'Ref' },
  { key: 'product_name', label: 'Product' },
  { key: 'customer_name', label: 'Customer' },
  { key: 'city', label: 'City' },
  { key: 'total_price', label: 'Total' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Date' },
  { key: 'actions', label: '' },
] as const
