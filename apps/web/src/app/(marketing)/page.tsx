import { Metadata } from 'next';
import { Hero } from '@/components/marketing/Hero';
import { ProblemSection } from '@/components/marketing/ProblemSection';
import { CompatibleAppsSection } from '@/components/marketing/CompatibleAppsSection';
import { SolutionSection } from '@/components/marketing/SolutionSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { FAQSection } from '@/components/marketing/FAQSection';
import { FinalCTASection } from '@/components/marketing/FinalCTASection';
import { OrganizeSection } from '@/components/marketing/OrganizeSection';
import { ReviewSection } from '@/components/marketing/ReviewSection';

import { SectionAnimation } from '@/components/marketing/layout/SectionAnimation';
import { GridSeparator } from '@/components/marketing/layout/GridSeparator';

export const metadata: Metadata = {
  title: 'MeetSolis - The AI Client Memory for Freelancers',
  description:
    'Never walk into a meeting unprepared. MeetSolis remembers client context, decisions, and action items for you. Join the waitlist.',
};

export default function LandingPage() {
  return (
    <>
      <div id="hero">
        <Hero />
      </div>

      <SectionAnimation>
        <CompatibleAppsSection />
      </SectionAnimation>

      <GridSeparator />

      <div id="problem" className="scroll-mt-24">
        <SectionAnimation>
          <ProblemSection />
        </SectionAnimation>
      </div>

      <GridSeparator />

      <div id="features" className="scroll-mt-24">
        <SectionAnimation>
          <SolutionSection />
        </SectionAnimation>
      </div>

      <GridSeparator />

      <div id="how-it-works" className="scroll-mt-24">
        <SectionAnimation>
          <HowItWorksSection />
        </SectionAnimation>
      </div>

      <SectionAnimation>
        <ReviewSection />
      </SectionAnimation>

      <div id="faq" className="scroll-mt-24">
        <SectionAnimation>
          <FAQSection />
        </SectionAnimation>
      </div>

      <SectionAnimation>
        <OrganizeSection />
      </SectionAnimation>

      <SectionAnimation>
        <FinalCTASection />
      </SectionAnimation>


    </>
  );
}
