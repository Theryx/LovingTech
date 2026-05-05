import type { Metadata } from 'next'
import AboutUsPageClient from './AboutUsPageClient'

export const metadata: Metadata = {
  title: 'À propos / About Us — Loving Tech',
  description: 'Découvrez Loving Tech, nos contacts, et la FAQ. Accessoires tech premium livrés partout au Cameroun.',
}

export default function AboutUsPage() {
  return <AboutUsPageClient />
}
