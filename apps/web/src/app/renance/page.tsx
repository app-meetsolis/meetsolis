import { RenanceHeader } from '@/components/marketing/renance/RenanceHeader';
import { RenanceHero } from '@/components/marketing/renance/RenanceHero';
import { RenanceLogoCloud } from '@/components/marketing/renance/RenanceLogoCloud';
import { RenanceFeaturesGrid } from '@/components/marketing/renance/RenanceFeaturesGrid';
import { RenanceInlineCTA } from '@/components/marketing/renance/RenanceInlineCTA';
import {
  RenanceFeatureDeepDive,
  RiskRadarVisual,
  GrowthReadinessVisual,
  ComplianceVisual,
} from '@/components/marketing/renance/RenanceFeatureDeepDive';
import { RenanceAISection } from '@/components/marketing/renance/RenanceAISection';
import { RenanceManageFinances } from '@/components/marketing/renance/RenanceManageFinances';
import { RenanceStatsGrid } from '@/components/marketing/renance/RenanceStatsGrid';
import { RenancePricing } from '@/components/marketing/renance/RenancePricing';
import { RenanceComparisonTable } from '@/components/marketing/renance/RenanceComparisonTable';
import { RenanceTestimonials } from '@/components/marketing/renance/RenanceTestimonials';
import { RenanceFAQ } from '@/components/marketing/renance/RenanceFAQ';
import { RenanceFooter } from '@/components/marketing/renance/RenanceFooter';

/* Deep dive content data */
const riskRadarData = {
  badge: 'Track finances',
  title: 'Stay one step ahead of financial risk.',
  description:
    'Renance continuously monitors your burn rate, commitments, and cash position—and alerts you the moment a risk pattern emerges, before it becomes a crisis.',
  features: [
    'Real-time risk radar',
    'Early warning alerts',
    'Automated risk scoring',
  ],
};

const growthReadinessData = {
  badge: 'AI Growth Readiness',
  title: 'Make growth moves with financial certainty.',
  description:
    "Before you expand or increase spend, AI checks if your finances are ready—and tells you what needs to change if they're not.",
  features: [
    'Readiness score for growth moves',
    'Checks runway, burn, revenue stability',
    'Clear "Ready / Not yet" outcome',
  ],
};

const complianceData = {
  badge: 'AI Compliance Watch',
  title: 'Stay compliant without tracking regulations.',
  description:
    'Monitors your financials against regulatory, tax, and reporting requirements. Flags gaps early, before audits, deadlines, or penalties.',
  features: [
    'Catch compliance issues early',
    'Stay aligned with regulations',
    'Reduce risk',
  ],
};

export default function RenancePage() {
  return (
    <div style={{ backgroundColor: 'var(--rn-bg)' }}>
      <RenanceHeader />

      <main>
        {/* Hero */}
        <RenanceHero />

        {/* Logo cloud */}
        <RenanceLogoCloud />

        {/* Features 2×2 grid */}
        <RenanceFeaturesGrid />

        {/* Inline CTA */}
        <div style={{ padding: '32px 0 0' }}>
          <RenanceInlineCTA />
        </div>

        {/* Deep Dive 1 — Risk Radar */}
        <RenanceFeatureDeepDive
          badge={riskRadarData.badge}
          title={riskRadarData.title}
          description={riskRadarData.description}
          features={riskRadarData.features}
          visual={<RiskRadarVisual />}
        />

        {/* Deep Dive 2 — Growth Readiness (reversed) */}
        <RenanceFeatureDeepDive
          badge={growthReadinessData.badge}
          title={growthReadinessData.title}
          description={growthReadinessData.description}
          features={growthReadinessData.features}
          visual={<GrowthReadinessVisual />}
          reverse
        />

        {/* Deep Dive 3 — Compliance */}
        <RenanceFeatureDeepDive
          badge={complianceData.badge}
          title={complianceData.title}
          description={complianceData.description}
          features={complianceData.features}
          visual={<ComplianceVisual />}
        />

        {/* AI that understands your money */}
        <RenanceAISection />

        {/* Manage finances */}
        <RenanceManageFinances />

        {/* Stats / Why teams rely on us */}
        <RenanceStatsGrid />

        {/* Pricing */}
        <RenancePricing />

        {/* Comparison table */}
        <RenanceComparisonTable />

        {/* Testimonials */}
        <RenanceTestimonials />

        {/* FAQ */}
        <RenanceFAQ />
      </main>

      <RenanceFooter />
    </div>
  );
}
