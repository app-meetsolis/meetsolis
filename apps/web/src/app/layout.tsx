import type { Metadata } from 'next';
import { Outfit, DM_Sans, Instrument_Serif } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { cn } from '@/lib/utils';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from './providers';
import { CookieConsent } from '@/components/common/CookieConsent';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { DebugLoggerInit } from '@/components/debug/DebugLoggerInit';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MeetSolis - The AI Client Memory',
  description:
    'Professional video conferencing solution for freelancers and small agencies',
  icons: {
    icon: '/favicon.ico',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

import { NoiseOverlay } from '@/components/marketing/layout/NoiseOverlay';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        outfit.variable,
        dmSans.variable,
        instrumentSerif.variable,
        'scroll-smooth'
      )}
    >
      <body className={cn(dmSans.className, 'antialiased')}>
        {/* Apply dark class before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('ms-theme');if(t==='dark'||(t==null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}})()`,
          }}
        />
        <NoiseOverlay />
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
