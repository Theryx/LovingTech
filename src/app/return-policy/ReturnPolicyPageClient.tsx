'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';

export default function ReturnPolicyPageClient() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <Navbar />
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <Link href="/" className="text-sm text-brand-dark/50 hover:text-brand-dark transition mb-8 inline-block">
          ← Loving Tech
        </Link>

        <h1 className="text-4xl font-bold mb-10">
          {t({ en: 'Return Policy', fr: 'Politique de retour' })}
        </h1>

        {/* Table */}
        <section className="mb-10">
          <div className="overflow-x-auto rounded-xl border border-brand-grey/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-grey/20 bg-brand-grey/10">
                  <th className="px-4 py-3 text-left font-semibold text-brand-dark">{t({ en: 'Condition', fr: 'État' })}</th>
                  <th className="px-4 py-3 text-left font-semibold text-brand-dark">{t({ en: 'Window', fr: 'Délai' })}</th>
                  <th className="px-4 py-3 text-left font-semibold text-brand-dark">{t({ en: 'Accepted reasons', fr: 'Motifs acceptés' })}</th>
                  <th className="px-4 py-3 text-left font-semibold text-brand-dark">{t({ en: 'Not accepted', fr: 'Non accepté' })}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-brand-grey/10">
                  <td className="px-4 py-3 font-medium">{t({ en: 'New', fr: 'Neuf' })}</td>
                  <td className="px-4 py-3">{t({ en: '7 days', fr: '7 jours' })}</td>
                  <td className="px-4 py-3">{t({ en: 'Defective on arrival, wrong item, damaged packaging', fr: "Défectueux à l'arrivée, mauvais article, emballage endommagé" })}</td>
                  <td className="px-4 py-3 text-brand-dark/60">{t({ en: 'Change of mind, opened and functional', fr: "Changement d'avis, ouvert et fonctionnel" })}</td>
                </tr>
                <tr className="border-b border-brand-grey/10">
                  <td className="px-4 py-3 font-medium">{t({ en: 'Refurbished', fr: 'Reconditionné' })}</td>
                  <td className="px-4 py-3">{t({ en: '5 days', fr: '5 jours' })}</td>
                  <td className="px-4 py-3">{t({ en: 'Defective, undisclosed fault, wrong item', fr: 'Défectueux, défaut non divulgué, mauvais article' })}</td>
                  <td className="px-4 py-3 text-brand-dark/60">{t({ en: 'Customer-caused physical damage', fr: 'Dommages physiques causés par le client' })}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">{t({ en: 'Second-hand', fr: 'Occasion' })}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{t({ en: 'No returns', fr: 'Aucun retour' })}</td>
                  <td className="px-4 py-3 text-brand-dark/40">{t({ en: 'sold as-is', fr: "vendu en l'état" })}</td>
                  <td className="px-4 py-3 text-brand-dark/60">{t({ en: 'All claims', fr: 'Toutes les réclamations' })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Process */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">{t({ en: 'Return process', fr: 'Procédure de retour' })}</h2>
          <ol className="space-y-3 text-sm text-brand-dark/70">
            {[
              t({ en: 'Contact us via WhatsApp +237 655 163 248 within the return window.', fr: 'Contactez-nous via WhatsApp +237 655 163 248 dans le délai de retour.' }),
              t({ en: 'Provide: order number + photo or video of the defect.', fr: 'Fournissez: numéro de commande + photo ou vidéo du défaut.' }),
              t({ en: 'Admin reviews within 48 hours.', fr: "L'administration examine la demande sous 48h." }),
              t({ en: 'If accepted: replacement or store credit valid 90 days.', fr: 'Si accepté: remplacement ou crédit valable 90 jours.' }),
              t({ en: 'If rejected: written explanation via WhatsApp.', fr: 'Si refusé: explication écrite via WhatsApp.' }),
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Void conditions */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">{t({ en: 'Void conditions', fr: "Conditions d'annulation" })}</h2>
          <ul className="space-y-2 text-sm text-brand-dark/70">
            {[
              t({ en: 'After the return window', fr: 'Après le délai de retour' }),
              t({ en: 'Physical damage caused after delivery', fr: 'Dommages physiques causés après la livraison' }),
              t({ en: 'Missing original packaging (New products)', fr: "Emballage d'origine manquant (produits neufs)" }),
              t({ en: 'Second-hand items — no exceptions', fr: "Articles d'occasion — aucune exception" }),
            ].map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-brand-orange mt-0.5">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="rounded-xl border border-brand-grey/20 bg-white p-5 text-sm text-brand-dark/60">
          <p className="font-semibold text-brand-dark mb-1">Contact</p>
          <p>WhatsApp: <a href="https://wa.me/237655163248" className="text-brand-blue hover:underline">+237 655 163 248</a></p>
          <p className="mt-1 text-xs text-brand-dark/40">{t({ en: 'Response within 48h on business days', fr: 'Réponse sous 48h les jours ouvrables' })}</p>
        </div>
      </article>

      <footer className="border-t border-brand-grey/20 px-6 py-8 text-center text-sm text-brand-dark/40">
        © 2026 Loving Tech Cameroun. {t({ en: 'All rights reserved.', fr: 'Tous droits réservés.' })}
      </footer>
    </main>
  );
}
