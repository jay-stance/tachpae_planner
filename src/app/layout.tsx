import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getActiveEvent } from '@/actions/event';
import { EventProvider } from '@/context/EventContext';
import { CartProvider } from '@/context/CartContext';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tachpae Planner',
  description: 'Pro Event Planning Platform',
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
      <body className={cn(inter.className, "antialiased min-h-screen bg-background text-foreground")} suppressHydrationWarning>
        <EventProvider initialEvent={event}>
          <main className="flex min-h-screen flex-col items-center justify-between">
            {children}
          </main>
          <WhatsAppIcon />
        </EventProvider>
      </body>
    </html>
  );
}
