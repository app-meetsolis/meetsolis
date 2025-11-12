/**
 * Onboarding Page
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { BrowserCompatibilityBanner } from '@/components/onboarding/BrowserCompatibilityBanner';
import { ContextualHelp } from '@/components/onboarding/ContextualHelp';

export default function OnboardingPage() {
  return (
    <>
      <BrowserCompatibilityBanner />
      <OnboardingContainer />
      <ContextualHelp />
    </>
  );
}
