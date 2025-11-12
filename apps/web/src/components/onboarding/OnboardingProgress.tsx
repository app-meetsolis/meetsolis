/**
 * Onboarding Progress Component
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

'use client';

import { OnboardingStepConfig } from '@/types/onboarding';
import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  steps: OnboardingStepConfig[];
  currentStep: string;
  completedSteps: string[];
  progressPercentage: number;
}

export function OnboardingProgress({
  steps,
  currentStep,
  completedSteps,
  progressPercentage
}: OnboardingProgressProps) {
  return (
    <div className="w-full space-y-6">
      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-sm">
        <div
          className="absolute left-0 top-0 h-full bg-primary-600 transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-start relative">
        {/* Connector Line Background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" style={{ left: '5%', right: '5%' }} />

        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isUpcoming = !isCompleted && !isCurrent;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center flex-1 relative z-10"
            >
              {/* Step Circle */}
              <div
                className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${isCompleted ? 'bg-primary-600 text-white' : ''}
                  ${isCurrent ? 'bg-primary-100 text-primary-600 ring-4 ring-primary-200' : ''}
                  ${isUpcoming ? 'bg-gray-100 text-gray-400' : ''}
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 text-center">
                <p
                  className={`
                    text-xs font-medium
                    ${isCurrent ? 'text-primary-600' : ''}
                    ${isCompleted ? 'text-gray-700' : ''}
                    ${isUpcoming ? 'text-gray-400' : ''}
                  `}
                >
                  {step.title}
                </p>
                {!step.required && (
                  <p className="text-xs text-gray-400 mt-0.5">Optional</p>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Time Estimate */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Estimated time: <span className="font-semibold">{steps.find(s => s.id === currentStep)?.timeEstimate || '0s'}</span>
        </p>
      </div>
    </div>
  );
}
