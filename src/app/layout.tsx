import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/lib/env'
import SplashScreen from '@/components/SplashScreen'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import { NotificationProvider } from '@/components/NotificationProvider'
import { LanguageProvider } from '@/context/LanguageContext'
import { MetaPixel } from '@/components/MetaPixel'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Loving Tech — Accessoires Tech Premium | Cameroun',
  description:
    'Achetez des accessoires tech authentiques (claviers, souris, câbles) livrés partout au Cameroun. Paiement à la livraison. WhatsApp: +237 655 163 248',
  openGraph: {
    title: 'Loving Tech',
    description: 'Accessoires tech premium livrés partout au Cameroun. Paiement à la livraison.',
    url: 'https://loving-tech.vercel.app',
    siteName: 'Loving Tech',
    locale: 'fr_CM',
    type: 'website',
    images: [
      {
        url: 'https://loving-tech.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Loving Tech',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loving Tech — Accessoires Tech Premium | Cameroun',
    description: 'Achetez des accessoires tech authentiques livrés partout au Cameroun.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NotificationProvider>
          <LanguageProvider>
            <SplashScreen />
            {children}
            <FloatingWhatsApp />
            <MetaPixel pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID!} />
          </LanguageProvider>
        </NotificationProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
