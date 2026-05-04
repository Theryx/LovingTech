'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useLanguage } from '@/context/LanguageContext'

interface DeliveryZone {
  id: number
  city: string
  fee: number
  estimated_days: string
  agencies: string
}

interface DeliverySettings {
  free_delivery_threshold: number
}

export default function ShippingPageClient() {
  const { t } = useLanguage()
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [settings, setSettings] = useState<DeliverySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [zonesRes, settingsRes] = await Promise.all([
          fetch('/api/delivery-zones'),
          fetch('/api/delivery-settings'),
        ])

        if (!zonesRes.ok || !settingsRes.ok) throw new Error('Fetch failed')

        const zonesData = await zonesRes.json()
        const settingsData = await settingsRes.json()

        // Map API response to expected format
        const mappedZones = (Array.isArray(zonesData) ? zonesData : zonesData.data ?? zonesData.zones ?? []).map(
          (z: any) => ({
            id: z.id,
            city: z.city_name_en || z.city_name_fr || z.city || 'Unknown',
            fee: z.delivery_fee ?? z.fee ?? 0,
            estimated_days: z.estimated_days || z.delay || '2-3 days',
            agencies: z.agencies?.join(', ') || z.agency || 'N/A',
          })
        )

        setZones(mappedZones)
        setSettings(settingsData)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const threshold = settings?.free_delivery_threshold ?? 50000

  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <Navbar />
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <Link
          href="/"
          className="text-sm text-brand-dark/50 hover:text-brand-dark transition mb-8 inline-block"
        >
          ← Loving Tech
        </Link>

        <h1 className="text-4xl font-bold mb-10">
          {t({ en: 'Shipping Info', fr: 'Livraison' })}
        </h1>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'How it works', fr: 'Comment ça marche' })}
          </h2>
          <ol className="space-y-3 text-sm text-brand-dark/70">
            {[
              t({
                en: 'Browse the catalog and pick your gear.',
                fr: 'Parcourez le catalogue et choisissez votre équipement.',
              }),
              t({
                en: 'Order via WhatsApp — send your product choice and delivery city.',
                fr: 'Commandez via WhatsApp — envoyez votre choix de produit et votre ville de livraison.',
              }),
              t({
                en: 'We confirm availability and total (product + delivery fee).',
                fr: 'Nous confirmons la disponibilité et le total (produit + frais de livraison).',
              }),
              t({
                en: 'We ship via trusted bus agency — you receive a tracking reference.',
                fr: 'Nous expédions via une agence de bus de confiance — vous recevez une référence de suivi.',
              }),
              t({
                en: 'You receive in 2–3 days depending on your zone.',
                fr: 'Vous recevez en 2–3 jours selon votre zone.',
              }),
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Delivery zones table */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'Delivery zones', fr: 'Zones de livraison' })}
          </h2>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-12 animate-pulse rounded-lg bg-brand-grey/10"
                />
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">
              {t({
                en: 'Failed to load delivery zones. Please try again later.',
                fr: 'Échec du chargement des zones de livraison. Veuillez réessayer plus tard.',
              })}
            </p>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto rounded-xl border border-brand-grey/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-grey/20 bg-brand-grey/10">
                    <th className="px-4 py-3 text-left font-semibold text-brand-dark">
                      {t({ en: 'City', fr: 'Ville' })}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-brand-dark">
                      {t({ en: 'Fee', fr: 'Tarif' })}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-brand-dark">
                      {t({ en: 'Delay', fr: 'Délai' })}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-brand-dark">
                      {t({ en: 'Agencies', fr: 'Agences' })}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone) => (
                    <tr key={zone.id} className="border-b border-brand-grey/10">
                      <td className="px-4 py-3 font-medium">{zone.city}</td>
                      <td className="px-4 py-3">
                          {zone.fee === 0 || !zone.fee
                            ? 'Free'
                            : `${zone.fee.toLocaleString()} FCFA`}
                      </td>
                      <td className="px-4 py-3">{zone.estimated_days}</td>
                      <td className="px-4 py-3 text-brand-dark/60">{zone.agencies}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Free delivery */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'Free delivery', fr: 'Livraison gratuite' })}
          </h2>
          {loading ? (
            <div className="h-12 animate-pulse rounded-lg bg-brand-grey/10" />
          ) : settings ? (
            <div className="rounded-xl border border-brand-grey/20 bg-brand-blue/5 p-5">
              <p className="text-sm text-brand-dark/70">
                {t({
                  en: `Free delivery on orders from ${threshold.toLocaleString()} FCFA.`,
                  fr: `Livraison gratuite à partir de ${threshold.toLocaleString()} FCFA.`,
                })}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-brand-grey/20 bg-brand-blue/5 p-5">
              <p className="text-sm text-brand-dark/70">
                {t({
                  en: 'Free delivery on orders from 50,000 FCFA.',
                  fr: 'Livraison gratuite à partir de 50 000 FCFA.',
                })}
              </p>
            </div>
          )}
        </section>

        {/* Payment */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'Payment', fr: 'Paiement' })}
          </h2>
          <p className="text-sm text-brand-dark/70 leading-relaxed">
            {t({
              en: 'Cash on delivery — you pay when you receive. Inspect the product before handing over payment. No advance payments, no hidden fees.',
              fr: 'Paiement à la livraison — vous payez quand vous recevez. Inspectez le produit avant de remettre le paiement. Aucun paiement anticipé, aucun frais caché.',
            })}
          </p>
        </section>

        {/* Tracking */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'Tracking', fr: 'Suivi' })}
          </h2>
          <p className="text-sm text-brand-dark/70 leading-relaxed">
            {t({
              en: 'Track your order on the',
              fr: 'Suivez votre commande sur la',
            })}{' '}
            <Link href="/suivi" className="text-brand-blue hover:underline">
              {t({ en: 'tracking page', fr: 'page de suivi' })}
            </Link>{' '}
            {t({
              en: 'with your order reference.',
              fr: 'avec votre référence de commande.',
            })}
          </p>
        </section>

        <div className="rounded-xl border border-brand-grey/20 bg-white p-5 text-sm text-brand-dark/60">
          <p className="font-semibold text-brand-dark mb-1">Contact</p>
          <p>
            WhatsApp:{' '}
            <a href="https://wa.me/237655163248" className="text-brand-blue hover:underline">
              +237 655 163 248
            </a>
          </p>
          <p className="mt-1 text-xs text-brand-dark/40">
            {t({
              en: 'Response within 48h on business days',
              fr: 'Réponse sous 48h les jours ouvrables',
            })}
          </p>
        </div>
      </article>

      <footer className="border-t border-brand-grey/20 px-6 py-8 text-center text-sm text-brand-dark/40">
        © 2026 Loving Tech Cameroun.{' '}
        {t({ en: 'All rights reserved.', fr: 'Tous droits réservés.' })}
      </footer>
    </main>
  )
}
