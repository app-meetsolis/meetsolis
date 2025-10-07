import { Metadata } from 'next';
import { Hero } from '@/components/marketing/Hero';
import { FeatureSection } from '@/components/marketing/FeatureSection';
import { ComparisonTable } from '@/components/marketing/ComparisonTable';
import { PricingSection } from '@/components/marketing/PricingSection';
import { TestimonialSection } from '@/components/marketing/TestimonialSection';
import { FAQSection } from '@/components/marketing/FAQSection';
import { CTASection } from '@/components/marketing/CTASection';
import { StructuredData } from '@/components/marketing/StructuredData';

export const metadata: Metadata = {
  title: 'MeetSolis - Professional Video Meetings for Freelancers & Agencies',
  description:
    'HD video calls, AI summaries, and collaborative tools for freelancers and agencies. Unlimited meetings from $15/month. Zoom alternative built for professionals.',
  keywords: [
    'video conferencing',
    'zoom alternative',
    'freelancer tools',
    'agency meetings',
    'AI meeting summaries',
    'online meetings',
    'video calls',
    'collaborative whiteboard',
  ],
  openGraph: {
    title: 'MeetSolis - Professional Video Meetings',
    description:
      'HD video calls with AI summaries and collaborative tools. Unlimited meetings from $15/month.',
    type: 'website',
    url: 'https://meetsolis.com',
    siteName: 'MeetSolis',
    images: [
      {
        url: 'https://meetsolis.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MeetSolis Platform Screenshot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeetSolis - Professional Video Meetings',
    description:
      'HD video calls with AI summaries and collaborative tools. Unlimited meetings from $15/month.',
    images: ['https://meetsolis.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://meetsolis.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function LandingPage() {
  return (
    <>
      <StructuredData />
      <Hero />
      <FeatureSection />
      <ComparisonTable />
      <PricingSection />
      <TestimonialSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
