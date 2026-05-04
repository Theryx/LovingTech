import type { Metadata } from 'next'
import AboutPageClient from './AboutPageClient'

export const metadata: Metadata = {
  title: 'À propos / About Us — Loving Tech',
  description: 'Découvrez Loving Tech : accessoires tech premium livrés partout au Cameroun.',
}

export default function AboutPage() {
  return <AboutPageClient />
}
