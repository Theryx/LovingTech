'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { OrderStatus } from '@/lib/supabase'

const STATUS_INFO: Record<
  OrderStatus,
  { icon: string; labelFr: string; labelEn: string; color: string }
> = {
  pending: {
    icon: '🕐',
    labelFr: 'En attente',
    labelEn: 'Pending',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  confirmed: {
    icon: '✅',
    labelFr: 'Confirmée',
    labelEn: 'Confirmed',
    color: 'text-brand-blue bg-brand-blue/5 border-brand-blue/20',
  },
  dispatched: {
    icon: '🚚',
    labelFr: 'Expédiée',
    labelEn: 'Shipped',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
  },
  delivered: {
    icon: '🎉',
    labelFr: 'Livrée',
    labelEn: 'Delivered',
    color: 'text-green-700 bg-green-50 border-green-200',
  },
  cancelled: {
    icon: '❌',
    labelFr: 'Annulée',
    labelEn: 'Cancelled',
    color: 'text-red-700 bg-red-50 border-red-200',
  },
}

const STATUS_MESSAGE: Record<OrderStatus, { fr: string; en: string }> = {
  pending: {
    fr: 'Votre commande a été reçue. Nous vous contacterons bientôt.',
    en: 'Your order has been received. We will contact you shortly.',
  },
  confirmed: {
    fr: 'Votre commande est confirmée et en cours de préparation.',
    en: 'Your order is confirmed and being prepared.',
  },
  dispatched: { fr: 'Votre commande a été expédiée.', en: 'Your order has been shipped.' },
  delivered: {
    fr: 'Votre commande a été livrée. Merci!',
    en: 'Your order has been delivered. Thank you!',
  },
  cancelled: {
    fr: 'Votre commande a été annulée. Contactez-nous sur WhatsApp.',
    en: 'Your order was cancelled. Contact us on WhatsApp.',
  },
}

export default function TrackingPageClient({ order }: { order: any }) {
  const { t } = useLanguage()
  const status = order.status || ('pending' as OrderStatus)
  const info = STATUS_INFO[status as OrderStatus]

  return (
    <main className="min-h-screen bg-white text-brand-dark flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="text-sm text-brand-dark/50 hover:text-brand-dark transition mb-8 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
        >
          ← Loving Tech
        </Link>

        <h1 className="text-2xl font-bold text-brand-dark mb-1">
          {t({ en: 'Order Tracking', fr: 'Suivi de commande' })}
        </h1>
        <p className="font-mono text-brand-dark/50 text-sm mb-8">{order.order_ref}</p>

        {/* Status card */}
        <div className={`rounded-2xl border p-6 mb-6 ${info.color}`}>
          <div className="text-3xl mb-3">{info.icon}</div>
          <p className="font-bold text-lg">{t({ en: info.labelEn, fr: info.labelFr })}</p>
          <p className="mt-2 text-sm opacity-80">
            {t({
              en: STATUS_MESSAGE[status as OrderStatus].en,
              fr: STATUS_MESSAGE[status as OrderStatus].fr,
            })}
          </p>
        </div>

        {/* Order summary */}
        <div className="rounded-xl border border-brand-grey/20 bg-white p-5 space-y-3 text-sm mb-6">
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
            <span className="text-brand-dark/60">{t({ en: 'City', fr: 'Ville' })}</span>
            <span className="font-medium text-brand-dark">
              {order.city}
              {order.quartier ? `, ${order.quartier}` : ''}
            </span>
          </div>
          {order.bus_agency && (
            <div className="flex justify-between">
              <span className="text-brand-dark/60">{t({ en: 'Agency', fr: 'Agence' })}</span>
              <span className="font-medium text-brand-dark">{order.bus_agency}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-brand-grey/20 pt-3 font-bold">
            <span className="text-brand-dark">Total</span>
            <span className="text-brand-blue">
              {order.total_price.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>

        {/* Timeline */}
        {order.status_history && order.status_history.length > 0 && (
          <div className="rounded-xl border border-brand-grey/20 bg-white p-5 mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-dark/40 mb-4">
              {t({ en: 'Timeline', fr: 'Historique' })}
            </h2>
            <div className="space-y-3">
              {[...order.status_history].reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 shrink-0" />
                  <div>
                    <span className="font-medium text-brand-dark capitalize">
                      {t({
                        en: STATUS_INFO[h.status as OrderStatus]?.labelEn || h.status,
                        fr: STATUS_INFO[h.status as OrderStatus]?.labelFr || h.status,
                      })}
                    </span>
                    <span className="text-brand-dark/40 ml-2 text-xs">
                      {new Date(h.at).toLocaleString(t({ en: 'en-US', fr: 'fr-FR' }))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <a
          href="https://wa.me/237655163248"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-brand-dark text-white py-3 font-medium hover:bg-brand-dark/90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2"
        >
          {t({ en: 'Help — WhatsApp', fr: 'Aide — WhatsApp' })}
        </a>
      </div>
    </main>
  )
}
