import type { Metadata } from 'next'
import PrivacyPolicyPageClient from './PrivacyPolicyPageClient'

export const metadata: Metadata = {
  title: 'Privacy Policy — Loving Tech',
  description: 'How Loving Tech collects, uses, and protects your personal data.',
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyPageClient />
}
