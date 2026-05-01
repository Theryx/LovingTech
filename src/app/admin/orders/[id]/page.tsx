'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Loader2 } from 'lucide-react'
import { useNotifications } from '@/components/NotificationProvider'
import { Order, OrderStatus } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'

const STATUS_FLOW: { status: OrderStatus; labelFr: string; labelEn: string; color: string }[] = [
  { status: 'confirmed', labelFr: 'Confirmer', labelEn: 'Confirm', color: 'bg-brand-blue hover:bg-brand-blue/90' },
  {
    status: 'dispatched',
    labelFr: 'Marquer expédié',
    labelEn: 'Mark Shipped',
    color: 'bg-brand-orange hover:brightness-95',
  },
  {
    status: 'delivered',
    labelFr: 'Marquer livré',
    labelEn: 'Mark Delivered',
    color: 'bg-green-600 hover:bg-green-700',
  },
  { status: 'cancelled', labelFr: 'Annuler', labelEn: 'Cancel', color: 'bg-red-500 hover:bg-red-600' },
]

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  dispatched: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-brand-blue/10 text-brand-blue',
  dispatched: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
}

function OrderDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-brand-grey/10 animate-pulse" />
        <div className="space-y-2">
          <div className="h-7 w-40 rounded bg-brand-grey/10 animate-pulse" />
          <div className="h-5 w-20 rounded bg-brand-grey/10 animate-pulse" />
        </div>
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <div className="mb-4 h-4 w-24 rounded bg-brand-grey/10 animate-pulse" />
          <div className="space-y-3">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-4 w-full rounded bg-brand-grey/10 animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const { t } = useLanguage()
  const { confirm, error: notifyError, success } = useNotifications()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [updating, setUpdating] = useState<OrderStatus | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/orders/${params.id as string}`)
    if (res.ok) {
      const data = await res.json()
      setOrder(data)
      setNotes(data.admin_notes || '')
    }
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    load()
  }, [load])

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!order) return
    const action = STATUS_FLOW.find(s => s.status === status)
    const label = t({ en: action?.labelEn || status, fr: action?.labelFr || status })
    const confirmed = await confirm({
      title: t({ en: `${label} this order?`, fr: `${label} cette commande ?` }),
      confirmLabel: label,
      cancelLabel: t({ en: 'Cancel', fr: 'Annuler' }),
      tone: status === 'cancelled' ? 'danger' : 'default',
    })
    if (!confirmed) return
    setUpdating(status)
    try {
      await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await load()
      success(t({ en: 'Order status updated.', fr: 'Statut de la commande mis à jour.' }))
    } catch {
      notifyError(t({ en: 'Failed to update order status.', fr: 'Échec de mise à jour du statut.' }))
    } finally {
      setUpdating(null)
    }
  }

  const handleSaveNotes = async () => {
    if (!order) return
    setSavingNotes(true)
    try {
      await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes }),
      })
      success(t({ en: 'Notes saved.', fr: 'Notes enregistrées.' }))
    } catch {
      notifyError(t({ en: 'Failed to save notes.', fr: "Échec de l'enregistrement des notes." }))
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading) return <OrderDetailSkeleton />
  if (!order) return <div className="py-20 text-center text-brand-dark/40">Commande introuvable.</div>

  const whatsappLink = `https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${order.customer_name}, concernant votre commande ${order.order_ref}…`)}`

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/orders"
          className="rounded-lg p-2 text-brand-grey transition hover:bg-brand-grey/10 hover:text-brand-blue"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-mono text-brand-dark">{order.order_ref}</h1>
          <span
            className={`mt-1 inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[order.status || 'pending']}`}
          >
            {STATUS_LABEL[order.status || 'pending']}
          </span>
        </div>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex items-center gap-2 rounded-xl bg-brand-dark px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          {t({ en: 'Contact customer', fr: 'Contacter le client' })}
        </a>
      </div>

      <div className="space-y-5">
        <section className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="text-sm font-semibold text-brand-dark/40 mb-4">
            {t({ en: 'Customer', fr: 'Client' })}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-brand-dark/40 mb-0.5">{t({ en: 'Name', fr: 'Nom' })}</p>
              <p className="font-semibold text-brand-dark">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-brand-dark/40 mb-0.5">WhatsApp</p>
              <p className="font-semibold text-brand-dark">{order.customer_phone}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="text-sm font-semibold text-brand-dark/40 mb-4">
            {t({ en: 'Order', fr: 'Commande' })}
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-dark/60">{t({ en: 'Product', fr: 'Produit' })}</span>
              <span className="font-medium text-brand-dark">{order.product_name}</span>
            </div>
            {order.variant_chosen && (
              <div className="flex justify-between">
                <span className="text-brand-dark/60">Variante</span>
                <span className="font-medium text-brand-dark">{order.variant_chosen}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-brand-dark/60">{t({ en: 'Qty', fr: 'Qté' })}</span>
              <span className="font-medium text-brand-dark">{order.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-dark/60">{t({ en: 'Unit price', fr: 'Prix unitaire' })}</span>
              <span className="font-medium text-brand-dark">
                {order.unit_price.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <div className="flex justify-between border-t border-brand-grey/20 pt-2">
              <span className="text-brand-dark/60">{t({ en: 'Delivery', fr: 'Livraison' })}</span>
              <span className="font-medium text-brand-dark">
                {order.delivery_fee === 0
                  ? t({ en: 'Free', fr: 'Gratuite' })
                  : `${order.delivery_fee.toLocaleString('fr-FR')} FCFA`}
              </span>
            </div>
            {order.promo_discount && (
              <div className="flex justify-between">
                <span className="text-brand-dark/60">Promo ({order.promo_code})</span>
                <span className="font-medium text-green-700">
                  -{order.promo_discount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-brand-grey/20 pt-2 font-bold">
              <span className="text-brand-dark">Total</span>
              <span className="text-brand-blue">
                {order.total_price.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="text-sm font-semibold text-brand-dark/40 mb-4">
            {t({ en: 'Delivery', fr: 'Livraison' })}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-brand-dark/40 mb-0.5">{t({ en: 'City', fr: 'Ville' })}</p>
              <p className="font-semibold text-brand-dark">{order.city}</p>
            </div>
            <div>
              <p className="text-brand-dark/40 mb-0.5">{t({ en: 'Neighbourhood', fr: 'Quartier' })}</p>
              <p className="font-semibold text-brand-dark">{order.quartier}</p>
            </div>
            {order.bus_agency && (
              <div>
                <p className="text-brand-dark/40 mb-0.5">{t({ en: 'Agency', fr: 'Agence' })}</p>
                <p className="font-semibold text-brand-dark">{order.bus_agency}</p>
              </div>
            )}
            {order.address_details && (
              <div className="col-span-2">
                <p className="text-brand-dark/40 mb-0.5">Détails</p>
                <p className="font-semibold text-brand-dark">{order.address_details}</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="text-sm font-semibold text-brand-dark/40 mb-4">
            {t({ en: 'Update Status', fr: 'Mettre à jour le statut' })}
          </h2>
          <div className="flex flex-wrap gap-3">
            {STATUS_FLOW.filter(s => s.status !== order.status).map(s => (
              <button
                key={s.status}
                onClick={() => handleStatusUpdate(s.status)}
                disabled={updating !== null}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${s.color} ${
                  s.status === 'cancelled' ? 'focus-visible:ring-red-500' : 'focus-visible:ring-brand-blue'
                }`}
              >
                {updating === s.status && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                {updating === s.status
                  ? t({ en: 'Updating…', fr: 'Mise à jour…' })
                  : t({ en: s.labelEn, fr: s.labelFr })}
              </button>
            ))}
          </div>
        </section>

        {order.status_history && order.status_history.length > 0 && (
          <section className="rounded-xl border border-brand-grey/20 bg-white p-6">
            <h2 className="text-sm font-semibold text-brand-dark/40 mb-4">Timeline</h2>
            <div className="space-y-3">
              {[...order.status_history].reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-blue" aria-hidden="true" />
                  <div>
                    <span className="font-semibold capitalize text-brand-dark">
                      {STATUS_LABEL[h.status] || h.status}
                    </span>
                    <span className="ml-2 text-brand-dark/40">
                      {new Date(h.at).toLocaleString('fr-FR')}
                    </span>
                    {h.note && <p className="mt-0.5 text-brand-dark/60">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-brand-grey/20 bg-white p-6">
          <h2 className="text-sm font-semibold text-brand-dark/40 mb-4">
            {t({ en: 'Admin Notes', fr: 'Notes admin' })}
          </h2>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder={t({ en: 'Internal notes…', fr: 'Notes internes…' })}
            className="w-full resize-none rounded-xl border border-brand-grey/30 px-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="mt-3 flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
          >
            {savingNotes && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {savingNotes
              ? t({ en: 'Saving…', fr: 'Enregistrement…' })
              : t({ en: 'Save notes', fr: 'Enregistrer' })}
          </button>
        </section>
      </div>
    </div>
  )
}