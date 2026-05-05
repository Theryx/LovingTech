'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Search, X } from 'lucide-react'

interface OOSInteraction {
  product_id: string
  product_name: string
  total_clicks: number
  last_clicked: string
}

function escapeCSV(val: string | number): string {
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export default function OutOfStockDemandPage() {
  const [data, setData] = useState<OOSInteraction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      params.set('sort', sortDir)
      if (dateFrom) params.set('from', dateFrom + 'T00:00:00Z')
      if (dateTo) params.set('to', dateTo + 'T23:59:59Z')

      const res = await fetch(`/api/out-of-stock-interactions?${params}`)
      if (res.status === 401) {
        setError('Please log in again.')
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error('Failed to load')
      const result = await res.json()
      setData(result || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    }
    setLoading(false)
  }, [sortDir, dateFrom, dateTo])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleSort = () => {
    setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))
  }

  const filtered = data.filter(row =>
    !search ||
    row.product_name.toLowerCase().includes(search.toLowerCase())
  )

  const exportCSV = () => {
    const rows = [
      ['Product', 'Total Clicks', 'Last Clicked'],
      ...filtered.map(r => [
        r.product_name,
        r.total_clicks,
        r.last_clicked ? new Date(r.last_clicked).toLocaleString('en-US') : '',
      ].map(escapeCSV)),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `oos-demand-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const inputCls =
    'rounded-xl border border-brand-grey/30 px-3 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue'

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">
          Out of Stock Demand
        </h1>
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-xl border border-brand-grey/30 px-4 py-2 text-sm font-medium text-brand-dark hover:bg-brand-grey/10 transition disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-dark/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inputCls} w-full pl-10`}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-brand-dark/50 whitespace-nowrap">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className={inputCls}
          />
          <label className="text-sm text-brand-dark/50 whitespace-nowrap">to</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className={inputCls}
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo('') }}
              className="flex items-center gap-1.5 rounded-xl border border-brand-grey/30 px-3 py-2 text-sm text-brand-dark/60 hover:bg-brand-grey/10 transition"
            >
              <X className="w-4 h-4" />
              Clear dates
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className="h-12 animate-pulse rounded-lg bg-brand-grey/10" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={loadData}
            className="mt-3 text-sm text-brand-blue hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="py-16 text-center text-brand-dark/40">
          {dateFrom || dateTo || search
            ? 'No interactions found matching your filters.'
            : 'No out-of-stock product clicks recorded yet.'}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-brand-grey/20 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-grey/20">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                  Product
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                  <button
                    onClick={toggleSort}
                    className="inline-flex items-center gap-1 hover:text-brand-dark transition"
                  >
                    Total Clicks
                    {sortDir === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                  </button>
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                  Last Clicked
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.product_id} className="border-b border-brand-grey/10 hover:bg-brand-grey/5">
                  <td className="px-5 py-3.5 text-sm font-medium text-brand-dark">
                    <Link
                      href={`/admin/products/${row.product_id}`}
                      className="hover:text-brand-blue transition"
                    >
                      {row.product_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-brand-dark">
                    {row.total_clicks}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-brand-dark/50">
                    {row.last_clicked
                      ? new Date(row.last_clicked).toLocaleString('en-US')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
