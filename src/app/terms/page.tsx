import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Conditions générales / Terms & Conditions — Loving Tech',
  description: "Conditions générales de vente et d'utilisation de Loving Tech Cameroun.",
};

const ARTICLES = [
  {
    numFr: '1. Général', numEn: 'General',
    fr: "L'utilisation de ce site et de nos services implique l'acceptation des présentes conditions.",
    en: 'Use of this site and our services implies acceptance of these terms.',
  },
  {
    numFr: '2. Commandes', numEn: 'Orders',
    fr: "Les commandes sont confirmées uniquement via WhatsApp. Loving Tech se réserve le droit d'annuler toute commande pour raison de stock insuffisant ou de fraude suspectée.",
    en: 'Orders are confirmed only via WhatsApp. Loving Tech reserves the right to cancel any order due to insufficient stock or suspected fraud.',
  },
  {
    numFr: '3. Livraison', numEn: 'Delivery',
    fr: "Livraison nationale via agences de bus. Frais: 2 000 FCFA à Douala, 3 000 FCFA ailleurs. Gratuit dès 50 000 FCFA. Le client choisit l'agence de transport.",
    en: 'Nationwide delivery via bus agencies. Fee: 2,000 FCFA in Douala, 3,000 FCFA elsewhere. Free above 50,000 FCFA. Customer selects the transport agency.',
  },
  {
    numFr: '4. Paiement', numEn: 'Payment',
    fr: "Paiement à la livraison uniquement, en espèces en FCFA. Tout refus de paiement à réception peut entraîner une mise sur liste noire.",
    en: 'Cash on delivery only, in FCFA. Refusal to pay upon receipt may result in blacklisting.',
  },
  {
    numFr: '5. Conditions produits', numEn: 'Product conditions',
    fr: "Tous les produits sont clairement étiquetés (Neuf / Reconditionné / Occasion). Les articles d'occasion sont vendus avec photos réelles et rapport d'état.",
    en: 'All products are clearly labelled (New / Refurbished / Second-hand). Second-hand items are sold with actual photos and condition report.',
  },
  {
    numFr: '6. Garantie', numEn: 'Warranty',
    fr: "Neuf: garantie fabricant. Reconditionné: 30 jours. Occasion: aucune garantie.",
    en: 'New: manufacturer warranty. Refurbished: 30 days. Second-hand: no warranty.',
  },
  {
    numFr: '7. Avis', numEn: 'Reviews',
    fr: "Les avis doivent être honnêtes et liés à un achat vérifié. Loving Tech se réserve le droit de supprimer tout avis.",
    en: 'Reviews must be honest and linked to a verified purchase. Loving Tech reserves the right to remove any review.',
  },
  {
    numFr: '8. Confidentialité', numEn: 'Privacy',
    fr: "Les données personnelles sont utilisées uniquement pour le traitement des commandes. Elles ne sont jamais vendues. Aucune donnée de paiement n'est stockée.",
    en: 'Personal data is used for order fulfilment only. It is never sold. No payment data is stored.',
  },
  {
    numFr: '9. Responsabilité', numEn: 'Liability',
    fr: "La responsabilité maximale de Loving Tech est limitée à la valeur de la commande concernée.",
    en: "Loving Tech's maximum liability is limited to the value of the relevant order.",
  },
  {
    numFr: '10. Contact', numEn: 'Contact',
    fr: "WhatsApp: +237 655 163 248. Réponse sous 48h les jours ouvrables.",
    en: 'WhatsApp: +237 655 163 248. Response within 48h on business days.',
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <Navbar />
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <Link href="/" className="text-sm text-brand-dark/50 hover:text-brand-dark transition mb-8 inline-block">
          ← Loving Tech
        </Link>

        <h1 className="text-4xl font-bold mb-2">Conditions générales</h1>
        <p className="text-2xl font-bold text-brand-dark/50 mb-10">Terms &amp; Conditions</p>

        <div className="space-y-8">
          {ARTICLES.map((a, i) => (
            <section key={i} className="border-t border-brand-grey/20 pt-6">
              <h2 className="text-lg font-bold text-brand-dark mb-0.5">{a.numFr}</h2>
              <p className="text-sm font-semibold text-brand-dark/40 mb-3">{a.numEn}</p>
              <p className="text-sm text-brand-dark/70 mb-1">{a.fr}</p>
              <p className="text-sm text-brand-dark/40">{a.en}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-brand-grey/20 bg-white p-5 text-sm text-brand-dark/60">
          <p className="font-semibold text-brand-dark mb-1">Contact</p>
          <p>WhatsApp: <a href="https://wa.me/237655163248" className="text-brand-blue hover:underline">+237 655 163 248</a></p>
        </div>
      </article>

      <footer className="border-t border-brand-grey/20 px-6 py-8 text-center text-sm text-brand-dark/40">
        © 2026 Loving Tech Cameroun. Tous droits réservés.
      </footer>
    </main>
  );
}
