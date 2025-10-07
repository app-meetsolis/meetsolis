/**
 * JSON-LD Structured Data for SEO
 * @see https://schema.org/SoftwareApplication
 */
export function StructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MeetSolis',
    applicationCategory: 'CommunicationApplication',
    operatingSystem: 'Web Browser',
    description:
      'Professional video conferencing platform for freelancers and agencies with HD video, AI summaries, and collaborative tools.',
    offers: {
      '@type': 'Offer',
      price: '15.00',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Organization',
      name: 'MeetSolis',
      url: 'https://meetsolis.com',
    },
    featureList: [
      'HD Video Calls',
      'AI Meeting Summaries',
      'Collaborative Whiteboard',
      'Screen Sharing',
      'File Sharing',
      'Calendar Integration',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
