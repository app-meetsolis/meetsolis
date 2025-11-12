/**
 * Onboarding Container Component
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

'use client';

import { useOnboarding } from '@/hooks/onboarding/useOnboarding';
import { OnboardingProgress } from './OnboardingProgress';
import { TutorialOverlay } from './TutorialOverlay';
import { WelcomeStep } from './steps/WelcomeStep';
import { PermissionsStep } from './steps/PermissionsStep';
import { ProfileStep } from './steps/ProfileStep';
import { FirstMeetingStep } from './steps/FirstMeetingStep';
import { ONBOARDING_STEPS } from '@/lib/onboarding/constants';
import { OnboardingComponent } from '@/types/onboarding';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { OnboardingAnalytics } from '@/lib/onboarding/OnboardingAnalytics';

export function OnboardingContainer() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const analytics = useMemo(() => new OnboardingAnalytics(), []);

  const {
    state,
    currentStepConfig,
    isComplete,
    progressPercentage,
    canSkipCurrent,
    goToNextStep,
    skipStep,
    goToPreviousStep,
    completeOnboarding
  } = useOnboarding();

  // API handlers for saving onboarding data (MUST be at top before any returns)
  const handleProfileSave = useCallback(async (data: any) => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to save profile');
    }

    return response.json();
  }, []);

  const handleMeetingSave = useCallback(async (data: any) => {
    const response = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create meeting');
    }

    return response.json();
  }, []);

  // Ensure client-side only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to dashboard when complete (only on client)
  useEffect(() => {
    if (isClient && isComplete) {
      router.push('/dashboard');
    }
  }, [isClient, isComplete, router]);

  // Track step changes (client-side only)
  useEffect(() => {
    if (isClient && currentStepConfig) {
      analytics.startStep(state.step);
      return () => {
        analytics.endStep(state.step);
      };
    }
  }, [state.step, currentStepConfig, isClient, analytics]);

  // Show loading state during SSR/hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // If complete, show nothing (redirect happens in useEffect)
  if (isComplete) {
    return null;
  }

  // If no current step, show nothing
  if (!currentStepConfig) {
    return null;
  }

  // From this point on, currentStepConfig is guaranteed to be non-null
  const currentIndex = ONBOARDING_STEPS.findIndex(s => s.id === state.step);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === ONBOARDING_STEPS.length - 1;

  // Tutorial overlay configuration
  const overlayConfig: OnboardingComponent = {
    showTooltip: true,
    highlightElement: true,
    blockInteraction: currentStepConfig.required,
    showProgress: true,
    allowSkip: canSkipCurrent
  };

  const renderStepContent = () => {
    switch (state.step) {
      case 'welcome':
        return <WelcomeStep />;
      case 'permissions':
        return <PermissionsStep />;
      case 'profile':
        return <ProfileStep onSave={handleProfileSave} />;
      case 'first-meeting':
        return <FirstMeetingStep onSave={handleMeetingSave} />;
      default:
        return null;
    }
  };

  const handleClose = () => {
    const confirmed = window.confirm('Are you sure you want to exit the onboarding? You can always complete it later from your settings.');
    if (confirmed) {
      router.push('/dashboard');
    }
  };

  const handleNext = async () => {
    try {
      setIsSaving(true);

      // Call save handler for steps that need to save data
      if (state.step === 'profile' && typeof (window as any).__profileStepSave === 'function') {
        await (window as any).__profileStepSave();
      }

      // For first-meeting step, the button is internal so no need to trigger here
      // The FirstMeetingStep component handles its own save

      // Move to next step or complete
      if (isLastStep) {
        // Mark onboarding as completed in database
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ onboarding_completed: true }),
        });
        completeOnboarding();
      } else {
        goToNextStep();
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      // Error is already displayed in the step component
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <TutorialOverlay
        title={currentStepConfig.title}
        description={currentStepConfig.description}
        content={renderStepContent()}
        onNext={handleNext}
        onPrevious={!isFirstStep ? goToPreviousStep : undefined}
        onSkip={canSkipCurrent ? skipStep : undefined}
        onClose={handleClose}
        config={overlayConfig}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        progressPercentage={progressPercentage}
        currentStepNumber={currentIndex + 1}
        totalSteps={ONBOARDING_STEPS.length}
        isLoading={isSaving}
      />
    </div>
  );
}
