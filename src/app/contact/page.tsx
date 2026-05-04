import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'Contact — Loving Tech',
  description: 'Contactez Loving Tech via WhatsApp, email ou réseaux sociaux.',
}

export default function ContactPage() {
  return <ContactPageClient />
}
