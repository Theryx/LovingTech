'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Download, Eye, ShoppingBag } from 'lucide-react'
import { Order, OrderStatus } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'

const STATUS_STYLE: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'En attente' },
  confirmed: { bg: 'bg-brand-blue/10', text: 'text-brand-blue', label: 'Confirmée' },
  dispatched: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Expédiée' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Livrée' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Annulée' },
}

function OrderSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border border-brand-grey/20 bg-white">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-brand-grey/20">
            {[...Array(8)].map((_, i) => (
              <th key={i} className="px-5 py-4">
                <div className="h-3 w-16 rounded bg-brand-grey/10 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(6)].map((_, i) => (
            <tr key={i} className="border-b border-brand-grey/10">
              {[...Array(8)].map((_, j) => (
                <td key={j} className="px-5 py-4">
                  <div className="h-4 w-20 rounded animate-pulse bg-brand-grey/10" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminOrdersPage() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')

  useEffect(() => {
    fetch('/api/orders')
      .then(r => {
        if (!r.ok) return []
        return r.json()
      })
      .then(data => {
        setOrders(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    const matchSearch =
      !search ||
      o.order_ref.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search)
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const exportCSV = () => {
    const rows = [
      ['Référence', 'Produit', 'Client', 'Téléphone', 'Ville', 'Agence', 'Total', 'Statut', 'Date'],
      ...filtered.map(o => [
        o.order_ref,
        o.product_name,
        o.customer_name,
        o.customer_phone,
        o.city,
        o.bus_agency || '',
        `${o.total_price} FCFA`,
        o.status || '',
        o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '',
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">
          {t({ en: 'Orders', fr: 'Commandes' })}
        </h1>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl border border-brand-grey/30 px-4 py-2 text-sm font-medium text-brand-dark hover:bg-brand-grey/10 transition"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          {t({ en: 'Export CSV', fr: 'Exporter CSV' })}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={t({
              en: 'Search by ref, name, phone…',
              fr: 'Rechercher par réf, nom, téléphone…',
            })}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-grey/30 text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as OrderStatus | '')}
          className="rounded-xl border border-brand-grey/30 px-3 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer"
        >
          <option value="">{t({ en: 'All statuses', fr: 'Tous les statuts' })}</option>
          {(Object.keys(STATUS_STYLE) as OrderStatus[]).map(s => (
            <option key={s} value={s}>
              {STATUS_STYLE[s].label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <OrderSkeleton />
      ) : (
        <div className="relative">
          <div className="overflow-x-auto rounded-xl border border-brand-grey/20 bg-white [&::after]:absolute [&::after]:top-0 [&::after]:right-0 [&::after]:bottom-0 [&::after]:w-8 [&::after]:bg-gradient-to-l [&::after]:from-white [&::after]:to-transparent [&::after]:pointer-events-none">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-brand-grey/20">
                  {['Réf.', 'Produit', 'Client', 'Ville', 'Total', 'Statut', 'Date', ''].map(h => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-brand-dark/20" />
                      <p className="text-brand-dark/40">
                        {t({ en: 'No orders found', fr: 'Aucune commande trouvée' })}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(order => {
                    const style = STATUS_STYLE[order.status || 'pending']
                    const isPending = order.status === 'pending'
                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-brand-grey/10 transition hover:bg-brand-grey/5 ${isPending ? 'border-l-4 border-l-brand-orange' : ''}`}
                      >
                        <td className="px-5 py-4 font-mono text-sm font-semibold text-brand-dark whitespace-nowrap">
                          {order.order_ref}
                        </td>
                        <td className="px-5 py-4 text-sm text-brand-dark max-w-[150px] truncate">
                          {order.product_name}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <div className="font-medium text-brand-dark leading-tight">{order.customer_name}</div>
                          <div className="text-brand-dark/40 text-xs">{order.customer_phone}</div>
                        </td>
                        <td className="px-5 py-4 text-sm text-brand-dark/70 whitespace-nowrap">
                          {order.city}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-brand-dark whitespace-nowrap">
                          {order.total_price.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
                          >
                            {style.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-brand-dark/40 whitespace-nowrap">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="rounded-lg p-2 text-brand-dark/40 transition hover:bg-brand-grey/10 hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue inline-block"
                            aria-label={`View order ${order.order_ref}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}