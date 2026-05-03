import NoveraNavbar from '@/components/novera-dark/NoveraNavbar';
import NoveraHeroSection from '@/components/novera-dark/NoveraHeroSection';
import NoveraSocialProof from '@/components/novera-dark/NoveraSocialProof';
import NoveraHowItWorks from '@/components/novera-dark/NoveraHowItWorks';
import NoveraDetailedFeatures from '@/components/novera-dark/NoveraDetailedFeatures';
import NoveraTrustSafety from '@/components/novera-dark/NoveraTrustSafety';
import NoveraPricing from '@/components/novera-dark/NoveraPricing';
import NoveraFeaturedTestimonial from '@/components/novera-dark/NoveraFeaturedTestimonial';
import NoveraTestimonials from '@/components/novera-dark/NoveraTestimonials';
import NoveraFAQ from '@/components/novera-dark/NoveraFAQ';
import NoveraCTASection from '@/components/novera-dark/NoveraCTASection';
import NoveraFooter from '@/components/novera-dark/NoveraFooter';

export const metadata = {
  title: "MeetSolis — Never forget a client's breakthrough moment again",
  description:
    'Post-meeting intelligence platform built for executive coaches. Capture every insight, recall any moment, never lose client context again.',
};

export default function HomePage() {
  return (
    <main
      className="w-full"
      style={{ backgroundColor: '#0b1612', overflowX: 'clip' }}
    >
      <NoveraNavbar />
      <NoveraHeroSection />
      <NoveraSocialProof />
      <NoveraHowItWorks />
      <NoveraDetailedFeatures />
      <NoveraTrustSafety />
      <NoveraPricing />
      <NoveraFeaturedTestimonial />
      <NoveraTestimonials />
      <NoveraFAQ />
      <NoveraCTASection />
      <NoveraFooter />
    </main>
  );
}
