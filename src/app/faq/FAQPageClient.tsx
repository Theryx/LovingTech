'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useLanguage } from '@/context/LanguageContext'

const faqItems = [
  {
    q: { en: 'How to order?', fr: 'Comment commander ?' },
    a: {
      en: 'Browse our catalog, click "Order via WhatsApp" on any product. We will confirm availability and deliver to you.',
      fr: 'Parcourez notre catalogue, cliquez sur "Commander via WhatsApp" sur le produit de votre choix. Nous confirmons la disponibilité et livrons chez vous.',
    },
  },
  {
    q: { en: 'Payment methods?', fr: 'Moyens de paiement ?' },
    a: {
      en: 'Cash on delivery (paiement à la livraison). No online payment needed — you pay when you receive your package.',
      fr: 'Paiement à la livraison. Aucun paiement en ligne requis — vous payez à la réception de votre colis.',
    },
  },
  {
    q: { en: 'Delivery zones?', fr: 'Zones de livraison ?' },
    a: {
      en: 'Douala, Yaoundé, Bafoussam, and other cities via bus agencies (General Express, Touristique, etc.). Contact us to confirm your city.',
      fr: 'Douala, Yaoundé, Bafoussam, et autres villes via agences de bus (General Express, Touristique, etc.). Contactez-nous pour confirmer votre localité.',
    },
  },
  {
    q: { en: 'Delivery time?', fr: 'Délai de livraison ?' },
    a: {
      en: '2-3 business days after order confirmation.',
      fr: '2-3 jours ouvrables après confirmation de la commande.',
    },
  },
  {
    q: { en: 'Delivery cost?', fr: 'Frais de livraison ?' },
    a: {
      en: 'Free delivery for orders over 50,000 FCFA. Below that, cost depends on the city — we will inform you on WhatsApp.',
      fr: 'Livraison gratuite à partir de 50 000 FCFA. En dessous, le coût dépend de la ville — nous vous informons par WhatsApp.',
    },
  },
  {
    q: { en: 'How to track my order?', fr: 'Comment suivre ma commande ?' },
    a: {
      en: 'Go to the tracking page /suivi and enter your order reference sent via WhatsApp.',
      fr: 'Rendez-vous sur la page de suivi /suivi et entrez votre référence de commande envoyée par WhatsApp.',
    },
  },
  {
    q: { en: 'Returns and warranty?', fr: 'Retours et garantie ?' },
    a: {
      en: '7-day return policy if the product is defective. Manufacturer warranty applies where available. See our Return Policy page for full details.',
      fr: 'Politique de retour sous 7 jours si le produit est défectueux. Garantie constructeur applicable quand disponible. Consultez notre page Politique de retour pour plus de détails.',
    },
  },
  {
    q: { en: 'Products are authentic?', fr: 'Les produits sont authentiques ?' },
    a: {
      en: 'Yes, all products sold by Loving Tech are 100% genuine and original. We source directly from authorized distributors.',
      fr: 'Oui, tous les produits vendus par Loving Tech sont 100 % authentiques et originaux. Nous nous approvisionnons auprès de distributeurs agréés.',
    },
  },
]

function FAQItem({ q, a, isOpen, onToggle }: { q: { en: string; fr: string }; a: { en: string; fr: string }; isOpen: boolean; onToggle: () => void }) {
  const { t } = useLanguage()

  return (
    <div className="border-b border-brand-grey/20">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-semibold text-brand-dark">{t(q)}</span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brand-grey/30 text-sm text-brand-dark/50">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-brand-dark/70">{t(a)}</div>
      )}
    </div>
  )
}

export default function FAQPageClient() {
  const { t } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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
          {t({ en: 'FAQ / Help', fr: 'FAQ / Aide' })}
        </h1>

        <section className="mb-10">
          {faqItems.map((item, i) => (
            <FAQItem
              key={i}
              q={item.q}
              a={item.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </section>

        <div className="rounded-xl border border-brand-grey/20 bg-white p-5 text-sm text-brand-dark/60">
          <p className="font-semibold text-brand-dark mb-1">
            {t({ en: 'Still have questions?', fr: 'Encore des questions ?' })}
          </p>
          <p>
            WhatsApp:{' '}
            <a href="https://wa.me/237655163248" className="text-brand-blue hover:underline">
              +237 655 163 248
            </a>
          </p>
          <p className="mt-1 text-xs text-brand-dark/40">
            {t({
              en: 'We reply within a few hours on business days',
              fr: 'Nous répondons sous quelques heures les jours ouvrables',
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
