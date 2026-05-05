'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useLanguage } from '@/context/LanguageContext'

const REASONS = [
  { key: 'authentic', en: '100% authentic products from trusted brands like Logitech, Keychron, Anker.', fr: 'Produits 100% authentiques de marques fiables comme Logitech, Keychron, Anker.' },
  { key: 'cod', en: 'Cash on delivery — inspect before you pay.', fr: 'Paiement à la livraison — inspectez avant de payer.' },
  { key: 'whatsapp', en: 'WhatsApp support — fast, personal, human.', fr: 'Support WhatsApp — rapide, personnel, humain.' },
  { key: 'freeship', en: 'Free delivery from 50,000 FCFA.', fr: 'Livraison gratuite à partir de 50 000 FCFA.' },
  { key: 'returns', en: '7-day return policy on new items.', fr: 'Politique de retour de 7 jours sur les articles neufs.' },
]

const SOCIALS = [
  {
    label: 'Facebook',
    en: 'Follow us on Facebook',
    fr: 'Suivez-nous sur Facebook',
    href: 'https://facebook.com/LovingTech',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    en: 'Follow us on Instagram',
    fr: 'Suivez-nous sur Instagram',
    href: 'https://instagram.com/lovingtechcmr',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    en: 'Follow us on TikTok',
    fr: 'Suivez-nous sur TikTok',
    href: 'https://tiktok.com/@lovingtech.shop',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
]

const FAQ_ITEMS = [
  {
    q: { en: 'How to order?', fr: 'Comment commander ?' },
    a: { en: 'Browse our catalog, click "Order via WhatsApp" on any product. We will confirm availability and deliver to you.', fr: 'Parcourez notre catalogue, cliquez sur "Commander via WhatsApp" sur le produit de votre choix. Nous confirmons la disponibilité et livrons chez vous.' },
  },
  {
    q: { en: 'Payment methods?', fr: 'Moyens de paiement ?' },
    a: { en: 'Cash on delivery. No online payment needed — you pay when you receive your package.', fr: 'Paiement à la livraison. Aucun paiement en ligne requis — vous payez à la réception de votre colis.' },
  },
  {
    q: { en: 'Delivery zones?', fr: 'Zones de livraison ?' },
    a: { en: 'Douala, Yaoundé, Bafoussam, and other cities via bus agencies. Contact us to confirm your city.', fr: 'Douala, Yaoundé, Bafoussam, et autres villes via agences de bus. Contactez-nous pour confirmer votre localité.' },
  },
  {
    q: { en: 'Delivery time?', fr: 'Délai de livraison ?' },
    a: { en: '2-3 business days after order confirmation.', fr: '2-3 jours ouvrables après confirmation de la commande.' },
  },
  {
    q: { en: 'Delivery cost?', fr: 'Frais de livraison ?' },
    a: { en: 'Free delivery for orders over 50,000 FCFA. Below that, cost depends on the city.', fr: 'Livraison gratuite à partir de 50 000 FCFA. En dessous, le coût dépend de la ville.' },
  },
  {
    q: { en: 'Returns and warranty?', fr: 'Retours et garantie ?' },
    a: { en: '7-day return policy if the product is defective. Manufacturer warranty applies where available.', fr: 'Politique de retour sous 7 jours si le produit est défectueux. Garantie constructeur applicable quand disponible.' },
  },
]

function FAQAccordion({ q, a, isOpen, onToggle }: { q: { en: string; fr: string }; a: { en: string; fr: string }; isOpen: boolean; onToggle: () => void }) {
  const { t } = useLanguage()
  return (
    <div className="border-b border-brand-grey/20">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 py-4 text-left">
        <span className="font-semibold text-brand-dark">{t(q)}</span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brand-grey/30 text-sm text-brand-dark/50">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && <div className="pb-4 text-sm text-brand-dark/70">{t(a)}</div>}
    </div>
  )
}

export default function AboutUsPageClient() {
  const { t } = useLanguage()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <Navbar />
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <Link href="/" className="text-sm text-brand-dark/50 hover:text-brand-dark transition mb-8 inline-block">
          ← Loving Tech
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {t({ en: 'About Us', fr: 'À propos de nous' })}
          </h1>
          <p className="text-lg text-brand-dark/60">
            {t({
              en: 'Discover who we are, how to reach us, and answers to common questions.',
              fr: 'Découvrez qui nous sommes, comment nous contacter, et les réponses aux questions fréquentes.',
            })}
          </p>
        </div>

        {/* Navigation pills */}
        <div className="flex gap-2 mb-10 flex-wrap">
          <a href="#about" className="rounded-full bg-brand-grey/10 px-4 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-grey/20 transition">
            {t({ en: 'Our Story', fr: 'Notre histoire' })}
          </a>
          <a href="#contact" className="rounded-full bg-brand-grey/10 px-4 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-grey/20 transition">
            {t({ en: 'Contact', fr: 'Contact' })}
          </a>
          <a href="#faq" className="rounded-full bg-brand-grey/10 px-4 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-grey/20 transition">
            FAQ
          </a>
        </div>

        {/* ───── About Section ───── */}
        <section id="about" className="mb-16 scroll-mt-28">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-brand-grey/20">
            {t({ en: 'Our Story', fr: 'Notre histoire' })}
          </h2>
          <p className="text-sm text-brand-dark/70 leading-relaxed mb-6">
            {t({
              en: 'Loving Tech was founded to bring premium, authentic tech accessories to Cameroon. We believe great gear shouldn\'t require international shipping, endless customs delays, or uncertainty about authenticity. Our journey started with a simple idea: everyone in Cameroon deserves access to the same quality tech that powers professionals, creators, and gamers worldwide.',
              fr: 'Loving Tech a été fondée pour apporter des accessoires tech premium et authentiques au Cameroun. Nous croyons que du bon équipement ne devrait pas nécessiter de livraison internationale, de délais douaniers interminables ni d\'incertitude sur l\'authenticité. Notre aventure a commencé avec une idée simple : chaque Camerounais mérite d\'avoir accès à la même qualité tech qui fait tourner les professionnels, créateurs et gamers du monde entier.',
            })}
          </p>

          <h3 className="text-lg font-bold mb-3">
            {t({ en: 'Our Mission', fr: 'Notre mission' })}
          </h3>
          <p className="text-sm text-brand-dark/70 leading-relaxed mb-6">
            {t({
              en: 'Make high-quality keyboards, mice, cables, speakers, and solar lamps accessible throughout Cameroon with reliable delivery and fair prices.',
              fr: 'Rendre les claviers, souris, câbles, enceintes et lampes solaires de haute qualité accessibles partout au Cameroun avec une livraison fiable et des prix justes.',
            })}
          </p>

          <h3 className="text-lg font-bold mb-3">
            {t({ en: 'Why choose us', fr: 'Pourquoi nous choisir' })}
          </h3>
          <ul className="space-y-2 text-sm text-brand-dark/70 mb-6">
            {REASONS.map((r) => (
              <li key={r.key} className="flex gap-3"><span className="text-brand-blue font-bold">✓</span><span>{t({ en: r.en, fr: r.fr })}</span></li>
            ))}
          </ul>

          <p className="text-sm text-brand-dark/70">
            {t({
              en: 'Based in Cameroon, delivering nationwide via trusted bus agencies. From Douala to Maroua, we reach every corner of the country.',
              fr: 'Basé au Cameroun, livraison nationale via des agences de bus de confiance. De Douala à Maroua, nous atteignons chaque recoin du pays.',
            })}
          </p>
        </section>

        {/* ───── Contact Section ───── */}
        <section id="contact" className="mb-16 scroll-mt-28">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-brand-grey/20">
            {t({ en: 'Contact', fr: 'Contact' })}
          </h2>

          <div className="space-y-4">
            <div className="rounded-xl border border-brand-grey/20 bg-brand-grey/5 p-5">
              <p className="font-semibold text-brand-dark mb-1">WhatsApp</p>
              <a href="https://wa.me/237655163248" target="_blank" rel="noreferrer" className="text-brand-blue text-lg font-semibold hover:underline">+237 655 163 248</a>
              <p className="mt-2 text-sm text-brand-dark/60">{t({ en: 'Fastest response — we reply within minutes during business hours.', fr: 'Réponse la plus rapide — nous répondons en quelques minutes pendant les heures ouvrables.' })}</p>
              <a href="https://wa.me/237655163248" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-600">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                {t({ en: 'Chat on WhatsApp', fr: 'Discuter sur WhatsApp' })}
              </a>
            </div>

            <div className="rounded-xl border border-brand-grey/20 bg-brand-grey/5 p-5">
              <p className="font-semibold text-brand-dark mb-1">{t({ en: 'Email', fr: 'Email' })}</p>
              <a href="mailto:ndouken@gmail.com" className="text-brand-blue text-lg font-semibold hover:underline">ndouken@gmail.com</a>
              <p className="mt-2 text-sm text-brand-dark/60">{t({ en: 'For inquiries, order follow-ups, or partnerships.', fr: 'Pour les demandes, le suivi de commandes ou les partenariats.' })}</p>
            </div>

            <div className="rounded-xl border border-brand-grey/20 bg-brand-grey/5 p-5">
              <p className="font-semibold text-brand-dark mb-2">{t({ en: 'Social Media', fr: 'Réseaux sociaux' })}</p>
              <div className="space-y-2">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg p-2 text-sm text-brand-dark hover:bg-brand-blue/5 transition">
                    <span className="text-brand-dark/60">{s.icon}</span>
                    <div><p className="font-medium">{s.label}</p></div>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-brand-grey/20 bg-white p-5 text-sm text-brand-dark/60">
              <p className="font-semibold text-brand-dark mb-1">{t({ en: 'Business hours', fr: 'Heures d\'ouverture' })}</p>
              <p>{t({ en: 'Monday – Saturday, 8:00 AM – 6:00 PM (GMT+1)', fr: 'Lundi – Samedi, 8h00 – 18h00 (GMT+1)' })}</p>
            </div>
          </div>
        </section>

        {/* ───── FAQ Section ───── */}
        <section id="faq" className="mb-16 scroll-mt-28">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-brand-grey/20">FAQ</h2>
          {FAQ_ITEMS.map((item, i) => (
            <FAQAccordion key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
          ))}
          <div className="mt-6 rounded-xl border border-brand-grey/20 bg-white p-5 text-sm text-brand-dark/60">
            <p className="font-semibold text-brand-dark mb-1">{t({ en: 'Still have questions?', fr: 'Encore des questions ?' })}</p>
            <p>WhatsApp: <a href="https://wa.me/237655163248" className="text-brand-blue hover:underline">+237 655 163 248</a></p>
          </div>
        </section>
      </article>

      <footer className="border-t border-brand-grey/20 px-6 py-8 text-center text-sm text-brand-dark/40">
        © 2026 Loving Tech Cameroun. {t({ en: 'All rights reserved.', fr: 'Tous droits réservés.' })}
      </footer>
    </main>
  )
}
