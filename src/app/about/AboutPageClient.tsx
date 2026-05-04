'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useLanguage } from '@/context/LanguageContext'

const REASONS = [
  {
    icon: '✓',
    key: 'authentic',
    en: '100% authentic products from trusted brands like Logitech, Keychron, Anker.',
    fr: 'Produits 100% authentiques de marques fiables comme Logitech, Keychron, Anker.',
  },
  {
    icon: '✓',
    key: 'cod',
    en: 'Cash on delivery — inspect before you pay.',
    fr: 'Paiement à la livraison — inspectez avant de payer.',
  },
  {
    icon: '✓',
    key: 'whatsapp',
    en: 'WhatsApp support — fast, personal, human.',
    fr: 'Support WhatsApp — rapide, personnel, humain.',
  },
  {
    icon: '✓',
    key: 'freeship',
    en: 'Free delivery from 50,000 FCFA.',
    fr: 'Livraison gratuite à partir de 50 000 FCFA.',
  },
  {
    icon: '✓',
    key: 'returns',
    en: '7-day return policy on new items.',
    fr: 'Politique de retour de 7 jours sur les articles neufs.',
  },
]

export default function AboutPageClient() {
  const { t } = useLanguage()

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
          {t({ en: 'About Us', fr: 'À propos' })}
        </h1>

        {/* Our Story */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'Our Story', fr: 'Notre histoire' })}
          </h2>
          <p className="text-sm text-brand-dark/70 leading-relaxed">
            {t({
              en: 'Loving Tech was founded to bring premium, authentic tech accessories to Cameroon. We believe great gear shouldn\'t require international shipping, endless customs delays, or uncertainty about authenticity. Our journey started with a simple idea: everyone in Cameroon deserves access to the same quality tech that powers professionals, creators, and gamers worldwide.',
              fr: 'Loving Tech a été fondée pour apporter des accessoires tech premium et authentiques au Cameroun. Nous croyons que du bon équipement ne devrait pas nécessiter de livraison internationale, de délais douaniers interminables ni d\'incertitude sur l\'authenticité. Notre aventure a commencé avec une idée simple : chaque Camerounais mérite d\'avoir accès à la même qualité tech qui fait tourner les professionnels, créateurs et gamers du monde entier.',
            })}
          </p>
        </section>

        {/* Our Mission */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'Our Mission', fr: 'Notre mission' })}
          </h2>
          <p className="text-sm text-brand-dark/70 leading-relaxed">
            {t({
              en: 'Make high-quality keyboards, mice, cables, speakers, and solar lamps accessible throughout Cameroon with reliable delivery and fair prices. We eliminate the middlemen and source directly so you pay what the product is worth — not more.',
              fr: 'Rendre les claviers, souris, câbles, enceintes et lampes solaires de haute qualité accessibles partout au Cameroun avec une livraison fiable et des prix justes. Nous éliminons les intermédiaires et nous approvisionnons directement pour que vous payiez ce que vaut le produit — pas plus.',
            })}
          </p>
        </section>

        {/* Why choose us */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'Why choose us', fr: 'Pourquoi nous choisir' })}
          </h2>
          <ul className="space-y-3 text-sm text-brand-dark/70">
            {REASONS.map((reason) => (
              <li key={reason.key} className="flex gap-3">
                <span className="text-brand-blue font-bold mt-0.5">{reason.icon}</span>
                <span>{t({ en: reason.en, fr: reason.fr })}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Based in */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'Based in', fr: 'Basé à' })}
          </h2>
          <p className="text-sm text-brand-dark/70 leading-relaxed">
            {t({
              en: 'Cameroon, delivering nationwide via trusted bus agencies. From Douala to Maroua, we reach every corner of the country.',
              fr: 'Cameroun, livraison nationale via des agences de bus de confiance. De Douala à Maroua, nous atteignons chaque recoin du pays.',
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
