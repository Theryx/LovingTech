'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Download, Eye, ShoppingBag, X, Filter, ChevronLeft, ChevronRight, AlertTriangle, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { Order, OrderStatus } from '@/lib/supabase'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, TABLE_HEADERS } from '@/lib/order-constants'
import { useNotifications } from '@/components/NotificationProvider'

const PAGE_SIZE = 50

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

function escapeCSV(val: string | number): string {
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams()
  const { error: notifyError, success: notifySuccess } = useNotifications()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>(
    (searchParams.get('status') as OrderStatus) || ''
  )
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(PAGE_SIZE))
      if (statusFilter) params.set('status', statusFilter)
      if (dateFrom) params.set('from', dateFrom + 'T00:00:00Z')
      if (dateTo) params.set('to', dateTo + 'T23:59:59Z')

      const res = await fetch(`/api/orders?${params}`)
      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired')
        throw new Error('Failed to load orders')
      }

      const data = await res.json()
      setOrders(data.orders || [])
      setTotalCount(data.total || 0)
      setTotalPages(data.totalPages || 0)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    }
    setLoading(false)
  }, [page, statusFilter, dateFrom, dateTo])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const filtered = useMemo(() => {
    if (!search) return orders
    const s = search.toLowerCase()
    return orders.filter(
      o =>
        o.order_ref.toLowerCase().includes(s) ||
        o.customer_name.toLowerCase().includes(s) ||
        o.customer_phone.includes(s)
    )
  }, [orders, search])

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const hasFilters = search || statusFilter || dateFrom || dateTo

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      const next = new Set(prev)
      if (next.has(orderId)) {
        next.delete(orderId)
      } else {
        next.add(orderId)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedOrders.size === filtered.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(filtered.map(o => o.id!).filter(Boolean)))
    }
  }

  const bulkUpdateStatus = async (newStatus: OrderStatus) => {
    if (selectedOrders.size === 0) return
    setBulkActionLoading(true)
    try {
      const results = await Promise.all(
        Array.from(selectedOrders).map(async (orderId) => {
          const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          })
          return res.ok
        })
      )
      const successCount = results.filter(Boolean).length
      notifySuccess(
        `Successfully updated ${successCount} order${successCount > 1 ? 's' : ''} to ${newStatus}`
      )
      setSelectedOrders(new Set())
      await loadOrders()
    } catch (e: any) {
      notifyError('Failed to update orders')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const exportCSV = () => {
    const rows = [
      ['Reference', 'Product', 'Customer', 'Phone', 'City', 'Agency', 'Total', 'Status', 'Date'],
      ...filtered.map(o => [
        o.order_ref,
        o.product_name,
        o.customer_name,
        o.customer_phone,
        o.city,
        o.bus_agency || '',
        `${o.total_price} FCFA`,
        o.status || '',
        o.created_at ? new Date(o.created_at).toLocaleDateString('en-US') : '',
      ].map(escapeCSV)),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const inputCls =
    'rounded-xl border border-brand-grey/30 px-3 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue'

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">
          Orders
        </h1>
        <div className="flex items-center gap-2">
          {selectedOrders.size > 0 && (
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm text-brand-dark/60">
                {selectedOrders.size} selected
              </span>
              <button
                onClick={() => bulkUpdateStatus('delivered')}
                disabled={bulkActionLoading}
                className="flex items-center gap-1.5 rounded-xl bg-brand-blue px-3 py-2 text-sm font-medium text-white hover:bg-brand-blue/90 transition disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Complete
              </button>
              <button
                onClick={() => bulkUpdateStatus('cancelled')}
                disabled={bulkActionLoading}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-xl border border-brand-grey/30 px-4 py-2 text-sm font-medium text-brand-dark hover:bg-brand-grey/10 transition disabled:opacity-40"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <label htmlFor="order-search" className="sr-only">
            Search orders
          </label>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="order-search"
            type="text"
            placeholder="Search by ref, name, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inputCls} w-full pl-10`}
          />
        </div>

        <div>
          <label htmlFor="order-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="order-status"
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as OrderStatus | '')
              setPage(1)
            }}
            className={inputCls}
          >
            <option value="">All statuses</option>
            {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map(s => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="date-from" className="text-sm text-brand-dark/50 whitespace-nowrap">
            From
          </label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1) }}
            className={inputCls}
          />
          <label htmlFor="date-to" className="text-sm text-brand-dark/50 whitespace-nowrap">
            to
          </label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1) }}
            className={inputCls}
          />
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 rounded-xl border border-brand-grey/30 px-3 py-2 text-sm text-brand-dark/60 hover:bg-brand-grey/10 transition"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Result count + pagination */}
      {!loading && !error && (
        <div className="flex items-center justify-between mb-4 text-sm text-brand-dark/50">
          <span>
            {totalCount > 0
              ? `Showing ${filtered.length} of ${totalCount} orders`
              : 'No orders found'}
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg p-1.5 text-brand-dark/50 hover:text-brand-dark disabled:opacity-30 transition"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-brand-dark">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg p-1.5 text-brand-dark/50 hover:text-brand-dark disabled:opacity-30 transition"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <OrderSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-400" />
          <p className="text-red-700 font-medium mb-2">
            {error === 'Session expired'
              ? 'Session expired. Please log in again.'
              : 'Failed to load orders.'}
          </p>
          <button
            onClick={() => loadOrders()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue/90 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-grey/20 bg-white">
          <table className="w-full min-w-[800px]" aria-label="Orders list">
            <caption className="sr-only">
              List of all orders with filters
            </caption>
            <thead>
              <tr className="border-b border-brand-grey/20">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40 w-12">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedOrders.size === filtered.length}
                    onChange={toggleSelectAll}
                    className="rounded border-brand-grey/30 text-brand-blue focus:ring-brand-blue"
                    aria-label="Select all orders"
                  />
                </th>
                {TABLE_HEADERS.map(h => (
                  <th
                    key={h.key}
                    scope="col"
                    className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40"
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-brand-dark/20" />
                    <p className="text-brand-dark/40">
                      No orders found
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map(order => {
                  const status = (order.status || 'pending') as OrderStatus
                  const colors = ORDER_STATUS_COLORS[status]
                  const label = ORDER_STATUS_LABELS[status]
                  const isPending = status === 'pending'
                  const isCancelled = status === 'cancelled'
                  return (
                    <tr
                      key={order.id}
                      onClick={() => window.location.href = `/admin/orders/${order.id}`}
                      className={`border-b border-brand-grey/10 transition hover:bg-brand-grey/5 cursor-pointer ${
                        isPending ? 'border-l-4 border-l-brand-orange' : ''
                      } ${isCancelled ? 'opacity-50' : ''}`}
                    >
                      <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={order.id ? selectedOrders.has(order.id) : false}
                          onChange={() => order.id && toggleSelectOrder(order.id)}
                          className="rounded border-brand-grey/30 text-brand-blue focus:ring-brand-blue"
                          aria-label={`Select order ${order.order_ref}`}
                        />
                      </td>
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
                          {(order.total_price || 0).toLocaleString('en-US')} FCFA
                        </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}
                        >
                          {label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-brand-dark/40 whitespace-nowrap">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US') : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          onClick={e => e.stopPropagation()}
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
      )}
    </div>
  )
}
