import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Politique de retour / Return Policy — Loving Tech',
  description: 'Conditions de retour et de remboursement pour vos achats Loving Tech au Cameroun.',
};

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-brand-dark">
      <Navbar />
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <Link href="/" className="text-sm text-brand-dark/50 hover:text-brand-dark transition mb-8 inline-block">
          ← Loving Tech
        </Link>

        <h1 className="text-4xl font-bold mb-2">Politique de retour</h1>
        <p className="text-2xl font-bold text-brand-dark/50 mb-10">Return Policy</p>

        {/* Table */}
        <section className="mb-10">
          <div className="overflow-x-auto rounded-xl border border-brand-grey/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-grey/20 bg-brand-grey/10">
                  <th className="px-4 py-3 text-left font-semibold text-brand-dark">État / Condition</th>
                  <th className="px-4 py-3 text-left font-semibold text-brand-dark">Délai / Window</th>
                  <th className="px-4 py-3 text-left font-semibold text-brand-dark">Motifs acceptés / Accepted reasons</th>
                  <th className="px-4 py-3 text-left font-semibold text-brand-dark">Non accepté / Not accepted</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-brand-grey/10">
                  <td className="px-4 py-3 font-medium">Neuf / New</td>
                  <td className="px-4 py-3">7 jours / 7 days</td>
                  <td className="px-4 py-3">Défectueux à l'arrivée, mauvais article, emballage endommagé / Defective on arrival, wrong item, damaged packaging</td>
                  <td className="px-4 py-3 text-brand-dark/60">Changement d'avis, ouvert et fonctionnel / Change of mind, opened and functional</td>
                </tr>
                <tr className="border-b border-brand-grey/10">
                  <td className="px-4 py-3 font-medium">Reconditionné / Refurbished</td>
                  <td className="px-4 py-3">5 jours / 5 days</td>
                  <td className="px-4 py-3">Défectueux, défaut non divulgué, mauvais article / Defective, undisclosed fault, wrong item</td>
                  <td className="px-4 py-3 text-brand-dark/60">Dommages physiques causés par le client / Customer-caused physical damage</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Occasion / Second-hand</td>
                  <td className="px-4 py-3 text-red-600 font-medium">Aucun retour / No returns</td>
                  <td className="px-4 py-3 text-brand-dark/40">N/A — vendu en l'état / sold as-is</td>
                  <td className="px-4 py-3 text-brand-dark/60">Toutes les réclamations / All claims</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Process */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-1">Procédure de retour</h2>
          <p className="text-brand-dark/50 mb-4">Return process</p>
          <ol className="space-y-3 text-sm text-brand-dark/70">
            {[
              'Contactez-nous via WhatsApp +237 655 163 248 dans le délai de retour / Contact us via WhatsApp +237 655 163 248 within the return window.',
              'Fournissez: numéro de commande + photo ou vidéo du défaut / Provide: order number + photo or video of the defect.',
              "L'administration examine la demande sous 48h / Admin reviews within 48 hours.",
              'Si accepté: remplacement ou crédit valable 90 jours / If accepted: replacement or store credit valid 90 days.',
              'Si refusé: explication écrite via WhatsApp / If rejected: written explanation via WhatsApp.',
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
          <h2 className="text-xl font-bold mb-1">Conditions d&apos;annulation</h2>
          <p className="text-brand-dark/50 mb-4">Void conditions</p>
          <ul className="space-y-2 text-sm text-brand-dark/70">
            {[
              "Après le délai de retour / After the return window",
              "Dommages physiques causés après la livraison / Physical damage caused after delivery",
              "Emballage d'origine manquant (produits neufs) / Missing original packaging (New products)",
              "Articles d'occasion — aucune exception / Second-hand items — no exceptions",
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
          <p className="mt-1 text-xs text-brand-dark/40">Réponse sous 48h les jours ouvrables / Response within 48h on business days</p>
        </div>
      </article>

      <footer className="border-t border-brand-grey/20 px-6 py-8 text-center text-sm text-brand-dark/40">
        © 2026 Loving Tech Cameroun. Tous droits réservés.
      </footer>
    </main>
  );
}
