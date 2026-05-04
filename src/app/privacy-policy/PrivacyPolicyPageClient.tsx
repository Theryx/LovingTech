'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useLanguage } from '@/context/LanguageContext'

export default function PrivacyPolicyPageClient() {
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
          {t({ en: 'Privacy Policy', fr: 'Politique de confidentialité' })}
        </h1>

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'What we collect', fr: 'Ce que nous collectons' })}
          </h2>
          <p className="text-sm text-brand-dark/70">
            {t({
              en: 'When you place an order, we collect your name, phone number, and email address via our order form. Automatically, we collect browsing data through Meta Pixel and Vercel Analytics.',
              fr: 'Lorsque vous passez une commande, nous collectons votre nom, numéro de téléphone et adresse e-mail via notre formulaire de commande. Automatiquement, nous collectons des données de navigation via Meta Pixel et Vercel Analytics.',
            })}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'How we use it', fr: 'Comment nous les utilisons' })}
          </h2>
          <p className="text-sm text-brand-dark/70">
            {t({
              en: 'We use your data to process orders, communicate with you via WhatsApp, and improve our website and services.',
              fr: 'Nous utilisons vos données pour traiter vos commandes, communiquer avec vous via WhatsApp et améliorer notre site et nos services.',
            })}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'Cookies', fr: 'Cookies' })}
          </h2>
          <p className="text-sm text-brand-dark/70">
            {t({
              en: 'We use Meta Pixel (Facebook) for ad measurement and conversion tracking. Vercel Analytics collects anonymous traffic data to help us understand site usage.',
              fr: 'Nous utilisons Meta Pixel (Facebook) pour la mesure des publicités et le suivi des conversions. Vercel Analytics collecte des données de trafic anonymes pour nous aider à comprendre l\'utilisation du site.',
            })}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'Data sharing', fr: 'Partage des données' })}
          </h2>
          <p className="text-sm text-brand-dark/70">
            {t({
              en: 'We never sell your personal data. Your information is shared only with: WhatsApp (Meta) for order communications, Vercel for hosting, and Supabase for our database.',
              fr: 'Nous ne vendons jamais vos données personnelles. Vos informations sont partagées uniquement avec : WhatsApp (Meta) pour les communications de commande, Vercel pour l\'hébergement, et Supabase pour notre base de données.',
            })}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'Data retention', fr: 'Conservation des données' })}
          </h2>
          <p className="text-sm text-brand-dark/70">
            {t({
              en: 'Order data is retained for legal and tax compliance purposes. Analytics data is retained according to each provider\'s policies.',
              fr: 'Les données de commande sont conservées à des fins légales et fiscales. Les données d\'analyse sont conservées selon les politiques de chaque fournisseur.',
            })}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'Your rights', fr: 'Vos droits' })}
          </h2>
          <p className="text-sm text-brand-dark/70">
            {t({
              en: 'You have the right to access, correct, or delete your personal data. To exercise these rights, contact us on WhatsApp.',
              fr: 'Vous avez le droit d\'accéder, de rectifier ou de supprimer vos données personnelles. Pour exercer ces droits, contactez-nous sur WhatsApp.',
            })}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {t({ en: 'Contact', fr: 'Contact' })}
          </h2>
          <p className="text-sm text-brand-dark/70">
            {t({
              en: 'For any privacy-related questions or requests, reach out to us on WhatsApp.',
              fr: 'Pour toute question ou demande relative à la confidentialité, contactez-nous sur WhatsApp.',
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
