import { Metadata } from 'next';
import { Hero } from '@/components/marketing/Hero';
import { SocialProof } from '@/components/marketing/SocialProof';
import { ClientCardDeepDive } from '@/components/marketing/ClientCardDeepDive';
import { BentoGrid } from '@/components/marketing/BentoGrid';
import { WorkflowScroll } from '@/components/marketing/WorkflowScroll';
import { SecuritySection } from '@/components/marketing/SecuritySection';
import { TestimonialSection } from '@/components/marketing/TestimonialSection';

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
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <SocialProof />
      <ClientCardDeepDive />
      <BentoGrid />
      <WorkflowScroll />
      <SecuritySection />
      <TestimonialSection />
    </>
  );
}
