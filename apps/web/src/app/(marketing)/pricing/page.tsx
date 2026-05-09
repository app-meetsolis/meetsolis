import type { Metadata } from 'next';
import NoveraPricing from '@/components/novera-dark/NoveraPricing';
import NoveraFAQ from '@/components/novera-dark/NoveraFAQ';

export const metadata: Metadata = {
  title: 'Pricing — MeetSolis',
  description:
    'Start free with 3 clients and 5 sessions. Upgrade to Pro at $99/mo for unlimited coaching memory. No credit card required.',
};

const pricingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'MeetSolis Pro',
  description:
    'AI-powered client memory platform for executive coaches — unlimited clients, sessions, and Solis Intelligence queries.',
  brand: { '@type': 'Brand', name: 'MeetSolis' },
  offers: [
    {
      '@type': 'Offer',
      name: 'Pro Monthly',
      availability: 'https://schema.org/InStock',
      url: 'https://meetsolis.com/pricing',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '99.00',
        priceCurrency: 'USD',
        billingDuration: 1,
        billingIncrement: 'P1M',
        unitCode: 'MON',
      },
    },
    {
      '@type': 'Offer',
      name: 'Pro Annual',
      availability: 'https://schema.org/InStock',
      url: 'https://meetsolis.com/pricing',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '948.00',
        priceCurrency: 'USD',
        billingDuration: 1,
        billingIncrement: 'P1Y',
        unitCode: 'ANN',
      },
    },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <NoveraPricing />
      <NoveraFAQ />
    </>
  );
}
