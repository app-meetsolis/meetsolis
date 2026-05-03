import NoveraNavbar from '@/components/novera-dark/NoveraNavbar';
import NoveraHeroSection from '@/components/novera-dark/NoveraHeroSection';
import NoveraSocialProof from '@/components/novera-dark/NoveraSocialProof';
import NoveraFeaturesOverview from '@/components/novera-dark/NoveraFeaturesOverview';
import NoveraDetailedFeatures from '@/components/novera-dark/NoveraDetailedFeatures';
import NoveraTrustSafety from '@/components/novera-dark/NoveraTrustSafety';
import NoveraPricing from '@/components/novera-dark/NoveraPricing';
import NoveraFeaturedTestimonial from '@/components/novera-dark/NoveraFeaturedTestimonial';
import NoveraTestimonials from '@/components/novera-dark/NoveraTestimonials';
import NoveraFAQ from '@/components/novera-dark/NoveraFAQ';
import NoveraCTASection from '@/components/novera-dark/NoveraCTASection';
import NoveraFooter from '@/components/novera-dark/NoveraFooter';

export const metadata = {
  title: 'MeetSolis — Design Test (Dark Green)',
  description: 'Design test: dark green theme variant.',
};

export default function DesignTestPage() {
  return (
    <main
      className="w-full"
      style={{ backgroundColor: '#0b1612', overflowX: 'clip' }}
    >
      <NoveraNavbar />
      <NoveraHeroSection />
      <NoveraSocialProof />
      <NoveraFeaturesOverview />
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
