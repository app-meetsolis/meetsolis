import type { Metadata } from 'next';
import { Instrument_Serif, Inter } from 'next/font/google';
import './renance.css';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Renance — The Finance Renaissance',
  description:
    'Renance is an AI-first finance platform that understands your numbers, watches for risk, and helps you make the right call before it matters.',
  openGraph: {
    title: 'Renance — The Finance Renaissance',
    description: 'AI-first finance platform for smarter decisions at scale.',
    type: 'website',
  },
};

export default function RenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${instrumentSerif.variable} ${inter.variable} renance-root`}
    >
      {children}
    </div>
  );
}
