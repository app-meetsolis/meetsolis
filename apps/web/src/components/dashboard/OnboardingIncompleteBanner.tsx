/**
 * Onboarding Incomplete Banner
 * Story 1.9: Onboarding Completion Enforcement & Optimization
 *
 * Displays a soft enforcement banner on the dashboard encouraging users
 * to complete onboarding with full WCAG 2.1 AA accessibility support.
 */

'use client';

import { useEffect, useState, useCallback, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lightbulb } from 'lucide-react';
import { OnboardingState } from '@/types/onboarding';
import { useAuth } from '@clerk/nextjs';

// UI Components - using inline definitions to avoid import issues in tests
const Alert = ({ children, className, ...props }: any) => (
  <div
    className={`relative w-full rounded-lg border p-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const AlertTitle = ({ children, className, ...props }: any) => (
  <h5
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h5>
);

const AlertDescription = ({ children, className, ...props }: any) => (
  <div className={`text-sm ${className}`} {...props}>
    {children}
  </div>
);

const Button = ({ children, className, variant, size, ...props }: any) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Constants
const BANNER_DISMISSED_KEY = 'onboarding_banner_dismissed';
const ONBOARDING_STORAGE_KEY = 'meetsolis_onboarding_state';
const DAYS_BEFORE_RESHOW = 7;

interface OnboardingIncompleteBannerProps {
  className?: string;
  onAnalyticsTrack?: (event: string, properties?: Record<string, any>) => void;
}

export function OnboardingIncompleteBanner({
  className,
  onAnalyticsTrack,
}: OnboardingIncompleteBannerProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isDismissed, setIsDismissed] = useState(true); // Default hidden until we check state
  const [onboardingState, setOnboardingState] =
    useState<OnboardingState | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Client-side only initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load onboarding state and dismissal status
  useEffect(() => {
    if (!isClient || !isSignedIn) return;

    try {
      // Get onboarding state
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const parsed: OnboardingState = JSON.parse(stored);
        setOnboardingState(parsed);

        // Check if banner was dismissed
        const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
        if (dismissed) {
          const dismissedAt = new Date(dismissed);
          const daysSinceDismiss =
            (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);

          // Re-show after 7 days if onboarding still incomplete
          setIsDismissed(daysSinceDismiss < DAYS_BEFORE_RESHOW);
        } else {
          setIsDismissed(false);
        }

        // Track banner display
        if (parsed.step !== 'complete' && !dismissed) {
          trackAnalytics('onboarding_banner_displayed', {
            last_step: parsed.step,
            progress: parsed.progress,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
    }
  }, [isClient, isSignedIn]);

  // Analytics tracking helper
  const trackAnalytics = useCallback(
    (event: string, properties?: Record<string, any>) => {
      if (onAnalyticsTrack) {
        onAnalyticsTrack(event, properties);
      } else if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track(event, properties);
      }
    },
    [onAnalyticsTrack]
  );

  // Handle resume onboarding
  const handleResume = useCallback(() => {
    trackAnalytics('onboarding_banner_clicked', {
      last_step: onboardingState?.step,
      progress: onboardingState?.progress,
    });
    router.push('/onboarding');
  }, [onboardingState, router, trackAnalytics]);

  // Handle banner dismissal
  const handleDismiss = useCallback(() => {
    trackAnalytics('onboarding_banner_dismissed', {
      last_step: onboardingState?.step,
      progress: onboardingState?.progress,
    });
    localStorage.setItem(BANNER_DISMISSED_KEY, new Date().toISOString());
    setIsDismissed(true);
  }, [onboardingState, trackAnalytics]);

  // Keyboard navigation handlers
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // Escape key: Dismiss banner
      if (event.key === 'Escape') {
        event.preventDefault();
        handleDismiss();
      }
    },
    [handleDismiss]
  );

  const handleResumeKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      // Enter or Space: Resume onboarding
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleResume();
      }
    },
    [handleResume]
  );

  const handleDismissKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      // Enter or Space: Dismiss banner
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleDismiss();
      }
    },
    [handleDismiss]
  );

  // Don't render if:
  // - Not client-side yet
  // - User not signed in
  // - No onboarding state
  // - Onboarding complete (step === 'complete' OR progress === 100)
  // - Banner dismissed
  if (
    !isClient ||
    !isSignedIn ||
    !onboardingState ||
    onboardingState.step === 'complete' ||
    onboardingState.progress === 100 ||
    isDismissed
  ) {
    return null;
  }

  // Dynamic message based on progress
  const getMessage = () => {
    if (onboardingState.progress >= 75) {
      return 'Almost there! Just one more step to unlock all features.';
    } else if (onboardingState.progress >= 50) {
      return `You're ${onboardingState.progress}% done! Continue setup to unlock all features.`;
    } else {
      return `You're ${onboardingState.progress}% done! Complete onboarding to unlock all features.`;
    }
  };

  return (
    <Alert
      className={`relative bg-blue-50 border-l-4 border-blue-600 shadow-sm mb-6 p-4 ${className || ''}`}
      role="region"
      aria-live="polite"
      aria-label="Onboarding completion reminder"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Lightbulb
            className="h-5 w-5 text-blue-600"
            aria-hidden="true"
            fill="currentColor"
          />
        </div>
        <div className="flex-1">
          <AlertTitle
            id="onboarding-banner-title"
            className="text-blue-900 font-semibold text-base mb-1"
          >
            Complete Your Setup
          </AlertTitle>
          <AlertDescription
            aria-describedby="onboarding-banner-title"
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="text-blue-800 text-sm leading-relaxed">
              {getMessage()}
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                onKeyDown={handleDismissKeyDown}
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px] px-4 border border-blue-200"
                aria-label="Dismiss onboarding reminder"
              >
                Dismiss
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleResume}
                onKeyDown={handleResumeKeyDown}
                className="bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[44px] px-4 shadow-sm"
                aria-label="Resume onboarding process"
              >
                Resume Onboarding
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
