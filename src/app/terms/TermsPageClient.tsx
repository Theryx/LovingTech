'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';

const ARTICLES = [
  {
    numFr: '1. Général', numEn: '1. General',
    fr: "L'utilisation de ce site et de nos services implique l'acceptation des présentes conditions.",
    en: 'Use of this site and our services implies acceptance of these terms.',
  },
  {
    numFr: '2. Commandes', numEn: '2. Orders',
    fr: "Les commandes sont confirmées uniquement via WhatsApp. Loving Tech se réserve le droit d'annuler toute commande pour raison de stock insuffisant ou de fraude suspectée.",
    en: 'Orders are confirmed only via WhatsApp. Loving Tech reserves the right to cancel any order due to insufficient stock or suspected fraud.',
  },
  {
    numFr: '3. Livraison', numEn: '3. Delivery',
    fr: "Livraison nationale via agences de bus. Frais: 2 000 FCFA à Douala, 3 000 FCFA ailleurs. Gratuit dès 50 000 FCFA. Le client choisit l'agence de transport.",
    en: 'Nationwide delivery via bus agencies. Fee: 2,000 FCFA in Douala, 3,000 FCFA elsewhere. Free above 50,000 FCFA. Customer selects the transport agency.',
  },
  {
    numFr: '4. Paiement', numEn: '4. Payment',
    fr: "Paiement à la livraison uniquement, en espèces en FCFA. Tout refus de paiement à réception peut entraîner une mise sur liste noire.",
    en: 'Cash on delivery only, in FCFA. Refusal to pay upon receipt may result in blacklisting.',
  },
  {
    numFr: '5. Conditions produits', numEn: '5. Product conditions',
    fr: "Tous les produits sont clairement étiquetés (Neuf / Reconditionné / Occasion). Les articles d'occasion sont vendus avec photos réelles et rapport d'état.",
    en: 'All products are clearly labelled (New / Refurbished / Second-hand). Second-hand items are sold with actual photos and condition report.',
  },
  {
    numFr: '6. Garantie', numEn: '6. Warranty',
    fr: "Neuf: garantie fabricant. Reconditionné: 30 jours. Occasion: aucune garantie.",
    en: 'New: manufacturer warranty. Refurbished: 30 days. Second-hand: no warranty.',
  },
  {
    numFr: '7. Avis', numEn: '7. Reviews',
    fr: "Les avis doivent être honnêtes et liés à un achat vérifié. Loving Tech se réserve le droit de supprimer tout avis.",
    en: 'Reviews must be honest and linked to a verified purchase. Loving Tech reserves the right to remove any review.',
  },
  {
    numFr: '8. Confidentialité', numEn: '8. Privacy',
    fr: "Les données personnelles sont utilisées uniquement pour le traitement des commandes. Elles ne sont jamais vendues. Aucune donnée de paiement n'est stockée.",
    en: 'Personal data is used for order fulfilment only. It is never sold. No payment data is stored.',
  },
  {
    numFr: '9. Responsabilité', numEn: '9. Liability',
    fr: "La responsabilité maximale de Loving Tech est limitée à la valeur de la commande concernée.",
    en: "Loving Tech's maximum liability is limited to the value of the relevant order.",
  },
  {
    numFr: '10. Contact', numEn: '10. Contact',
    fr: "WhatsApp: +237 655 163 248. Réponse sous 48h les jours ouvrables.",
    en: 'WhatsApp: +237 655 163 248. Response within 48h on business days.',
  },
];

export default function TermsPageClient() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <Navbar />
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <Link href="/" className="text-sm text-brand-dark/50 hover:text-brand-dark transition mb-8 inline-block">
          ← Loving Tech
        </Link>

        <h1 className="text-4xl font-bold mb-10">
          {t({ en: 'Terms & Conditions', fr: 'Conditions générales' })}
        </h1>

        <div className="space-y-8">
          {ARTICLES.map((a, i) => (
            <section key={i} className="border-t border-brand-grey/20 pt-6">
              <h2 className="text-lg font-bold text-brand-dark mb-3">
                {t({ en: a.numEn, fr: a.numFr })}
              </h2>
              <p className="text-sm text-brand-dark/70">
                {t({ en: a.en, fr: a.fr })}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-brand-grey/20 bg-white p-5 text-sm text-brand-dark/60">
          <p className="font-semibold text-brand-dark mb-1">Contact</p>
          <p>WhatsApp: <a href="https://wa.me/237655163248" className="text-brand-blue hover:underline">+237 655 163 248</a></p>
        </div>
      </article>

      <footer className="border-t border-brand-grey/20 px-6 py-8 text-center text-sm text-brand-dark/40">
        © 2026 Loving Tech Cameroun. {t({ en: 'All rights reserved.', fr: 'Tous droits réservés.' })}
      </footer>
    </main>
  );
}
