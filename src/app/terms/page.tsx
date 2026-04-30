import type { Metadata } from 'next'
import TermsPageClient from './TermsPageClient'

export const metadata: Metadata = {
  title: 'Conditions générales / Terms & Conditions — Loving Tech',
  description: "Conditions générales de vente et d'utilisation de Loving Tech Cameroun.",
}

export default function TermsPage() {
  return <TermsPageClient />
}
