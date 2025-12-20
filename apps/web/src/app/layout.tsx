import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { cn } from '@/lib/utils';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from './providers';
import { CookieConsent } from '@/components/common/CookieConsent';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { DebugLoggerInit } from '@/components/debug/DebugLoggerInit';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MeetSolis - Video Conferencing Platform',
  description:
    'Professional video conferencing solution for freelancers and small agencies',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'overflow-x-hidden')}>
        <DebugLoggerInit />
        <AnalyticsProvider>
          <Providers>{children}</Providers>
          <CookieConsent />
        </AnalyticsProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
