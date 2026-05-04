'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  MessageSquare,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { Order, OrderStatus } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'
import { useNotifications } from '@/components/NotificationProvider'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ALLOWED_STATUS_TRANSITIONS,
} from '@/lib/order-constants'

function DetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="h-6 w-48 rounded animate-pulse bg-brand-grey/10" />
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6 space-y-4">
        <div className="h-4 w-32 rounded animate-pulse bg-brand-grey/10" />
        <div className="h-4 w-64 rounded animate-pulse bg-brand-grey/10" />
        <div className="h-4 w-48 rounded animate-pulse bg-brand-grey/10" />
      </div>
      <div className="rounded-xl border border-brand-grey/20 bg-white p-6 space-y-4">
        <div className="h-4 w-24 rounded animate-pulse bg-brand-grey/10" />
        <div className="h-4 w-56 rounded animate-pulse bg-brand-grey/10" />
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  const { t } = useLanguage()
  const { success, error: notifyError } = useNotifications()
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesDirty, setNotesDirty] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [prevOrderId, setPrevOrderId] = useState<string | null>(null)
  const [nextOrderId, setNextOrderId] = useState<string | null>(null)
  const [showUndoConfirm, setShowUndoConfirm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired')
        if (res.status === 404) throw new Error('not_found')
        throw new Error('Failed to load')
      }
      const data = await res.json()
      setOrder(data)
      setNotes(data.admin_notes || '')
      setNotesDirty(false)

      // Fetch neighbors
      fetch(`/api/orders?limit=2&page=1`)
        .then(r => r.json())
        .then(d => {
          const all = (d.orders || []) as Order[]
          const idx = all.findIndex((o: Order) => o.id === orderId)
          if (idx > 0) setPrevOrderId(all[idx - 1].id || null)
          if (idx >= 0 && idx < all.length - 1) setNextOrderId(all[idx + 1].id || null)
        })
        .catch(() => {})
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    }
    setLoading(false)
  }, [orderId])

  useEffect(() => {
    load()
  }, [load])

  async function handleStatusUpdate(newStatus: OrderStatus) {
    if (!order) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Update failed' }))
        throw new Error(err.error || 'Update failed')
      }
      const updated = await res.json()
      setOrder(updated)
      setNotes(updated.admin_notes || '')
      setNotesDirty(false)
      success(
        t({
          en: `Status updated to ${ORDER_STATUS_LABELS[newStatus].en}.`,
          fr: `Statut mis à jour : ${ORDER_STATUS_LABELS[newStatus].fr}.`,
        })
      )
    } catch (e: any) {
      notifyError(e.message || t({ en: 'Failed to update status.', fr: 'Échec de la mise à jour.' }))
    }
    setUpdating(false)
  }

  async function handleUndoStatus() {
    if (!order || !order.status_history || order.status_history.length < 2) return
    const previousEntry = order.status_history[order.status_history.length - 2]
    const previousStatus = previousEntry.status as OrderStatus
    setShowUndoConfirm(false)
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: previousStatus }),
      })
      if (!res.ok) throw new Error('Undo failed')
      const updated = await res.json()
      setOrder(updated)
      success(
        t({
          en: `Reverted to ${ORDER_STATUS_LABELS[previousStatus].en}.`,
          fr: `Rétabli à : ${ORDER_STATUS_LABELS[previousStatus].fr}.`,
        })
      )
    } catch (e: any) {
      notifyError(e.message || t({ en: 'Failed to undo.', fr: 'Échec de l\'annulation.' }))
    }
    setUpdating(false)
  }

  async function handleSaveNotes() {
    if (!order || !notesDirty) return
    setSavingNotes(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes }),
      })
      if (!res.ok) throw new Error('Save failed')
      const updated = await res.json()
      setOrder(updated)
      setNotesDirty(false)
      success(t({ en: 'Notes saved.', fr: 'Notes enregistrées.' }))
    } catch (e: any) {
      notifyError(e.message || t({ en: 'Failed to save notes.', fr: 'Échec de l\'enregistrement.' }))
    }
    setSavingNotes(false)
  }

  // Loading
  if (loading) return <DetailSkeleton />

  // Error
  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        {error === 'not_found' ? (
          <>
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-brand-dark/20" />
            <h1 className="text-xl font-bold text-brand-dark mb-2">
              {t({ en: 'Order not found', fr: 'Commande introuvable' })}
            </h1>
            <p className="text-brand-dark/50 mb-6">
              {t({ en: 'This order may have been deleted or the link is incorrect.', fr: 'Cette commande a peut-être été supprimée ou le lien est incorrect.' })}
            </p>
          </>
        ) : (
          <>
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-400" />
            <h1 className="text-xl font-bold text-brand-dark mb-2">
              {t({ en: 'Error loading order', fr: 'Erreur de chargement' })}
            </h1>
            <p className="text-brand-dark/50 mb-4">{error}</p>
          </>
        )}
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-grey/30 px-4 py-2 text-sm font-medium text-brand-dark hover:bg-brand-grey/10 transition"
          >
            {t({ en: 'Back to orders', fr: 'Retour aux commandes' })}
          </Link>
          {error !== 'not_found' && (
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue/90 transition"
            >
              <RefreshCw className="w-4 h-4" />
              {t({ en: 'Try again', fr: 'Réessayer' })}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!order) return null

  const status = (order.status || 'pending') as OrderStatus
  const statusLabel = t(ORDER_STATUS_LABELS[status])
  const colors = ORDER_STATUS_COLORS[status]
  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[status] || []
  const canUndo = (order.status_history?.length || 0) >= 2

  const whatsappLink = `https://wa.me/${order.customer_phone.replace(/\D/g, '')}`

  const infoCls = 'text-sm'
  const labelCls = 'text-xs text-brand-dark/40 font-medium uppercase tracking-wider mb-0.5'
  const valueCls = 'text-sm font-medium text-brand-dark'
  const cardCls = 'rounded-xl border border-brand-grey/20 bg-white p-5'

  return (
    <div className="max-w-3xl mx-auto px-4 pb-12">
      {/* Breadcrumb + navigation */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm text-brand-dark/40">
          <Link href="/admin" className="hover:text-brand-blue transition">
            {t({ en: 'Admin', fr: 'Admin' })}
          </Link>
          <span>/</span>
          <Link href="/admin/orders" className="hover:text-brand-blue transition">
            {t({ en: 'Orders', fr: 'Commandes' })}
          </Link>
          <span>/</span>
          <span className="text-brand-dark/70 font-mono text-xs">{order.order_ref}</span>
        </div>

        <div className="flex items-center gap-1">
          {prevOrderId ? (
            <button
              onClick={() => router.push(`/admin/orders/${prevOrderId}`)}
              className="rounded-lg p-1.5 text-brand-dark/40 hover:text-brand-blue hover:bg-brand-grey/10 transition"
              aria-label={t({ en: 'Previous order', fr: 'Commande précédente' })}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <span className="w-7" />
          )}
          {nextOrderId ? (
            <button
              onClick={() => router.push(`/admin/orders/${nextOrderId}`)}
              className="rounded-lg p-1.5 text-brand-dark/40 hover:text-brand-blue hover:bg-brand-grey/10 transition"
              aria-label={t({ en: 'Next order', fr: 'Commande suivante' })}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="w-7" />
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark font-mono">{order.order_ref}</h1>
          <p className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
            {statusLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canUndo && (
            <button
              onClick={() => setShowUndoConfirm(true)}
              disabled={updating}
              className="flex items-center gap-1.5 rounded-xl border border-brand-grey/30 px-3 py-2 text-sm text-brand-dark/60 hover:bg-brand-grey/10 transition disabled:opacity-40"
            >
              <ArrowLeftRight className="w-4 h-4" />
              {t({ en: 'Undo', fr: 'Annuler' })}
            </button>
          )}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
          >
            <ExternalLink className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>

      {/* Undo confirmation */}
      {showUndoConfirm && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 flex-wrap">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800">
              {t({
                en: 'Revert to previous status?',
                fr: 'Revenir au statut précédent ?',
              })}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              {order.status_history && order.status_history.length >= 2
                ? (() => {
                    const prev = order.status_history[order.status_history.length - 2]
                    return t({
                      en: `Will revert to "${prev.status}".`,
                      fr: `Sera rétabli à "${ORDER_STATUS_LABELS[prev.status as OrderStatus]?.fr || prev.status}".`,
                    })
                    return ''
                  })()
                : ''}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleUndoStatus}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition"
              >
                {t({ en: 'Yes, revert', fr: 'Oui, rétablir' })}
              </button>
              <button
                onClick={() => setShowUndoConfirm(false)}
                className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition"
              >
                {t({ en: 'Cancel', fr: 'Annuler' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status update buttons */}
      {allowedTransitions.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-xs text-brand-dark/40 self-center mr-1">
            {t({ en: 'Update status:', fr: 'Changer le statut :' })}
          </span>
          {allowedTransitions.map(next => (
            <button
              key={next}
              onClick={() => handleStatusUpdate(next)}
              disabled={updating}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-40 ${
                ORDER_STATUS_COLORS[next].bg
              } ${ORDER_STATUS_COLORS[next].text} hover:brightness-95`}
              aria-label={t({
                en: `Mark as ${ORDER_STATUS_LABELS[next].en}`,
                fr: `Marquer comme ${ORDER_STATUS_LABELS[next].fr}`,
              })}
            >
              {updating ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t({ en: 'Updating…', fr: 'Mise à jour…' })}
                </span>
              ) : (
                t({
                  en: `Mark ${ORDER_STATUS_LABELS[next].en.toLowerCase()}`,
                  fr: `Marquer ${ORDER_STATUS_LABELS[next].fr.toLowerCase()}`,
                })
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        {/* Customer info */}
        <div className={cardCls}>
          <h2 className="text-sm font-semibold text-brand-dark mb-3">
            {t({ en: 'Customer', fr: 'Client' })}
          </h2>
          <div className="space-y-2.5">
            <div>
              <p className={labelCls}>{t({ en: 'Name', fr: 'Nom' })}</p>
              <p className={valueCls}>{order.customer_name}</p>
            </div>
            <div>
              <p className={labelCls}>{t({ en: 'Phone', fr: 'Téléphone' })}</p>
              <p className={valueCls}>{order.customer_phone}</p>
            </div>
            {order.customer_email && (
              <div>
                <p className={labelCls}>Email</p>
                <p className={valueCls}>{order.customer_email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order info */}
        <div className={cardCls}>
          <h2 className="text-sm font-semibold text-brand-dark mb-3">
            {t({ en: 'Order', fr: 'Commande' })}
          </h2>
          <div className="space-y-2.5">
            <div>
              <p className={labelCls}>{t({ en: 'Product', fr: 'Produit' })}</p>
              <p className={valueCls}>{order.product_name}</p>
            </div>
            {order.variant_chosen && (
              <div>
                <p className={labelCls}>{t({ en: 'Variant', fr: 'Variante' })}</p>
                <p className={valueCls}>{order.variant_chosen}</p>
              </div>
            )}
            <div className="flex gap-6">
              <div>
                <p className={labelCls}>{t({ en: 'Qty', fr: 'Qté' })}</p>
                <p className={valueCls}>{order.quantity}</p>
              </div>
              <div>
                <p className={labelCls}>{t({ en: 'Unit price', fr: 'Prix unit.' })}</p>
                <p className={valueCls}>{order.unit_price.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className={cardCls}>
          <h2 className="text-sm font-semibold text-brand-dark mb-3">
            {t({ en: 'Delivery', fr: 'Livraison' })}
          </h2>
          <div className="space-y-2.5">
            <div>
              <p className={labelCls}>{t({ en: 'City', fr: 'Ville' })}</p>
              <p className={valueCls}>{order.city}</p>
            </div>
            {order.bus_agency && (
              <div>
                <p className={labelCls}>{t({ en: 'Agency', fr: 'Agence' })}</p>
                <p className={valueCls}>{order.bus_agency}</p>
              </div>
            )}
            <div>
              <p className={labelCls}>{t({ en: 'Quarter', fr: 'Quartier' })}</p>
              <p className={valueCls}>{order.quartier}</p>
            </div>
            {order.address_details && (
              <div>
                <p className={labelCls}>{t({ en: 'Details', fr: 'Détails' })}</p>
                <p className={valueCls}>{order.address_details}</p>
              </div>
            )}
            <div>
              <p className={labelCls}>{t({ en: 'Delivery fee', fr: 'Frais de livraison' })}</p>
              <p className={valueCls}>
                {order.delivery_fee === 0
                  ? t({ en: 'FREE', fr: 'GRATUIT' })
                  : `${order.delivery_fee.toLocaleString('fr-FR')} FCFA`}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className={cardCls}>
          <h2 className="text-sm font-semibold text-brand-dark mb-3">
            {t({ en: 'Pricing', fr: 'Prix' })}
          </h2>
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-sm text-brand-dark/60">
                {t({ en: 'Subtotal', fr: 'Sous-total' })}
              </span>
              <span className="text-sm text-brand-dark">
                {(order.unit_price * order.quantity).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-brand-dark/60">
                {t({ en: 'Delivery', fr: 'Livraison' })}
              </span>
              <span className="text-sm text-brand-dark">
                {order.delivery_fee === 0
                  ? t({ en: 'FREE', fr: 'GRATUIT' })
                  : `${order.delivery_fee.toLocaleString('fr-FR')} FCFA`}
              </span>
            </div>
            {order.promo_code && (
              <div className="flex justify-between">
                <span className="text-sm text-brand-dark/60">
                  {t({ en: 'Promo', fr: 'Promo' })} ({order.promo_code})
                </span>
                <span className="text-sm text-green-600 font-medium">
                  −{order.promo_discount?.toLocaleString('fr-FR') || 0} FCFA
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-brand-grey/20">
              <span className="text-sm font-semibold text-brand-dark">
                {t({ en: 'Total', fr: 'Total' })}
              </span>
              <span className="text-sm font-bold text-brand-dark">
                {order.total_price.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {order.status_history && order.status_history.length > 0 && (
        <div className={cardCls}>
          <h2 className="text-sm font-semibold text-brand-dark mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-dark/30" />
            {t({ en: 'Timeline', fr: 'Chronologie' })}
          </h2>
          <div className="space-y-0" role="list">
            {[...order.status_history].reverse().map((entry, i) => {
              const entryStatus = entry.status as OrderStatus
              const entryColors = ORDER_STATUS_COLORS[entryStatus] || ORDER_STATUS_COLORS.pending
              const isLast = i === order.status_history!.length - 1
              return (
                <div key={i} className="flex gap-3" role="listitem">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${entryColors.bg} border-2 ${entryColors.text.replace('text-', 'border-')}`} />
                    {!isLast && <div className="w-px flex-1 bg-brand-grey/20 my-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-brand-dark">
                      {t(ORDER_STATUS_LABELS[entryStatus]) || entryStatus}
                    </p>
                    <p className="text-xs text-brand-dark/40">
                      {new Date(entry.at).toLocaleString('fr-FR')}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-brand-dark/50 mt-0.5 italic">{entry.note}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Admin notes */}
      <div className={cardCls}>
        <h2 className="text-sm font-semibold text-brand-dark mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-dark/30" />
          {t({ en: 'Admin notes', fr: 'Notes admin' })}
          {notesDirty && (
            <span className="text-xs text-amber-600 font-normal">
              ({t({ en: 'unsaved', fr: 'non enregistré' })})
            </span>
          )}
        </h2>
        <label htmlFor="admin-notes" className="sr-only">
          {t({ en: 'Admin notes', fr: 'Notes admin' })}
        </label>
        <textarea
          id="admin-notes"
          value={notes}
          onChange={e => {
            setNotes(e.target.value)
            setNotesDirty(true)
          }}
          rows={4}
          className={`w-full rounded-xl border px-4 py-3 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-y ${
            notesDirty ? 'border-amber-400 bg-amber-50/50' : 'border-brand-grey/30'
          }`}
          placeholder={t({
            en: 'Internal notes about this order…',
            fr: 'Notes internes sur cette commande…',
          })}
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleSaveNotes}
            disabled={!notesDirty || savingNotes}
            className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-blue/90 disabled:opacity-40"
          >
            {savingNotes
              ? t({ en: 'Saving…', fr: 'Enregistrement…' })
              : t({ en: 'Save notes', fr: 'Enregistrer' })}
          </button>
        </div>
      </div>
    </div>
  )
}
