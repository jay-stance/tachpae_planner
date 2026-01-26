import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getActiveEvent } from '@/actions/event';
import { EventProvider } from '@/context/EventContext';
import { CartProvider } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import Footer from '@/components/layout/Footer';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = 'https://planner.tachpae.com';
const siteName = 'Tachpae';
const siteDescription = 'Create unforgettable Valentine\'s experiences. Curate personalized gift packages, send romantic proposals, and make February 14th magical. Trusted by 10,000+ couples across Nigeria.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Tachpae - Valentine\'s Day Gift Planner & Romantic Proposals',
    template: '%s | Tachpae'
  },
  description: siteDescription,
  keywords: [
    'Valentine gift Nigeria',
    'romantic proposal',
    'Valentine planner',
    'gift packages Lagos',
    'Tachpae',
    'Valentine surprise',
    'couples gifts',
    'February 14',
    'love gifts Nigeria',
    'romantic gifts Abuja'
  ],
  authors: [{ name: 'Tachpae' }],
  creator: 'Tachpae',
  publisher: 'Tachpae',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: siteUrl,
    siteName: siteName,
    title: 'Tachpae - Make This Valentine\'s Unforgettable 💕',
    description: siteDescription,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tachpae - Valentine\'s Day Gift Planner',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tachpae - Valentine\'s Day Gift Planner 💕',
    description: siteDescription,
    images: ['/og-image.png'],
    creator: '@tachpae',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  other: {
    'theme-color': '#3514F5',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const event = await getActiveEvent('val-2026');

  return (
    <html lang="en">
      <body className={cn(inter.className, "antialiased min-h-screen bg-background text-foreground theme-tachpae")} suppressHydrationWarning>
        <EventProvider initialEvent={event}>
          <main className="flex min-h-screen flex-col items-center justify-between">
            {children}
          </main>
          <Footer />
          <WhatsAppIcon />
          <Toaster richColors position="top-center" />
          <Analytics />
          {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
          )}
        </EventProvider>
      </body>
    </html>
  );
}
