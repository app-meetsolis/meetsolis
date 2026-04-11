import React from 'react';
import HeroSection from '@/components/marketing/HeroSection';
import PartnersSection from '@/components/marketing/PartnersSection';
import HowItWorksSection from '@/components/marketing/HowItWorksSection';
import FeaturesSection from '@/components/marketing/FeaturesSection';
import BuiltForEfficiencySection from '@/components/marketing/BuiltForEfficiencySection';
import MetricsSection from '@/components/marketing/MetricsSection';
import IntegrationsSection from '@/components/marketing/IntegrationsSection';
import BentoCardsSection from '@/components/marketing/BentoCardsSection';
import BlogSection from '@/components/marketing/BlogSection';
import TestimonialsSection from '@/components/marketing/TestimonialsSection';
import FAQSection from '@/components/marketing/FAQSection';
import CTASection from '@/components/marketing/CTASection';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <PartnersSection />
      <HowItWorksSection />
      <FeaturesSection />
      <BuiltForEfficiencySection />
      <MetricsSection />
      <IntegrationsSection />
      <BentoCardsSection />
      <BlogSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
