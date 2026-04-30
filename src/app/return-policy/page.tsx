import type { Metadata } from 'next'
import ReturnPolicyPageClient from './ReturnPolicyPageClient'

export const metadata: Metadata = {
  title: 'Politique de retour / Return Policy — Loving Tech',
  description: 'Conditions de retour et de remboursement pour vos achats Loving Tech au Cameroun.',
}

export default function ReturnPolicyPage() {
  return <ReturnPolicyPageClient />
}
