/**
 * Tutorial Overlay Component
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingComponent } from '@/types/onboarding';

interface TutorialOverlayProps {
  title: string;
  description: string;
  content: React.ReactNode;
  onNext: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  onClose: () => void;
  config: OnboardingComponent;
  isFirstStep: boolean;
  isLastStep: boolean;
  progressPercentage: number;
  currentStepNumber: number;
  totalSteps: number;
  isLoading?: boolean;
}

export function TutorialOverlay({
  title,
  description,
  content,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  config,
  isFirstStep,
  isLastStep,
  progressPercentage,
  currentStepNumber,
  totalSteps,
  isLoading = false
}: TutorialOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      {/* Backdrop - Always show for consistent UI */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        style={{ opacity: isVisible ? 1 : 0 }}
      />

      {/* Tutorial Card */}
      <div
        className={`
          fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          bg-white rounded-lg shadow-2xl overflow-hidden max-w-2xl w-full mx-4
          z-50 transition-all duration-300
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        {/* Progress Bar - Prominent blue line */}
        <div className="relative h-1.5 bg-gray-300">
          <div
            className="absolute left-0 top-0 h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Content Container */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Step {currentStepNumber} of {totalSteps}
                </span>
              </div>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            {content}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div>
              {!isFirstStep && onPrevious && (
                <Button
                  variant="ghost"
                  onClick={onPrevious}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {config.allowSkip && onSkip && (
                <Button
                  variant="outline"
                  onClick={onSkip}
                >
                  Skip
                </Button>
              )}
              <Button
                onClick={onNext}
                className="gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {isLastStep ? 'Complete' : 'Next'}
                    {!isLastStep && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tooltip */}
          {config.showTooltip && (
            <div className="mt-4 p-3 bg-primary-50 rounded-md">
              <p className="text-sm text-primary-700">
                💡 Tip: You can return to this tutorial anytime from your settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
