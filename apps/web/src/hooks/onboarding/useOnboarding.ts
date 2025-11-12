/**
 * Onboarding Hook
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { OnboardingState, OnboardingStepConfig } from '@/types/onboarding';
import { OnboardingManager } from '@/lib/onboarding/OnboardingManager';
import { ONBOARDING_STEPS } from '@/lib/onboarding/constants';

export function useOnboarding() {
  const [manager] = useState(() => new OnboardingManager(ONBOARDING_STEPS));

  // Initialize state on client only to avoid hydration mismatch
  const [state, setState] = useState<OnboardingState>(() => ({
    step: 'welcome',
    progress: 0,
    completedSteps: [],
    canSkip: false,
    timeEstimate: '30s',
    lastCompletedAt: new Date()
  }));

  const [currentStepConfig, setCurrentStepConfig] = useState<OnboardingStepConfig | null>(
    () => ONBOARDING_STEPS[0]
  );

  const [isClient, setIsClient] = useState(false);

  // Initialize from localStorage only on client
  useEffect(() => {
    setIsClient(true);
    const savedState = manager.initializeState();
    setState(savedState);

    const currentIndex = ONBOARDING_STEPS.findIndex(s => s.id === savedState.step);
    if (currentIndex >= 0) {
      setCurrentStepConfig(ONBOARDING_STEPS[currentIndex]);
    }
  }, [manager]);

  // Save state to storage whenever it changes (client-side only)
  useEffect(() => {
    if (isClient) {
      manager.saveState(state);
    }
  }, [state, manager, isClient]);

  const goToNextStep = useCallback(() => {
    const currentIndex = ONBOARDING_STEPS.findIndex(s => s.id === state.step);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      const nextStep = ONBOARDING_STEPS[currentIndex + 1];
      setState(prev => ({
        ...prev,
        step: nextStep.id as any,
        progress: ((currentIndex + 2) / ONBOARDING_STEPS.length) * 100,
        completedSteps: [...prev.completedSteps, prev.step],
        canSkip: !nextStep.required,
        timeEstimate: nextStep.timeEstimate,
        lastCompletedAt: new Date()
      }));
      setCurrentStepConfig(nextStep);
    } else {
      completeOnboarding();
    }
  }, [state.step]);

  const skipStep = useCallback(() => {
    if (currentStepConfig && !currentStepConfig.required) {
      goToNextStep();
    }
  }, [currentStepConfig, goToNextStep]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = ONBOARDING_STEPS.findIndex(s => s.id === state.step);
    if (currentIndex > 0) {
      const prevStep = ONBOARDING_STEPS[currentIndex - 1];
      setState(prev => ({
        ...prev,
        step: prevStep.id as any,
        progress: (currentIndex / ONBOARDING_STEPS.length) * 100,
        canSkip: !prevStep.required,
        timeEstimate: prevStep.timeEstimate,
        lastCompletedAt: new Date()
      }));
      setCurrentStepConfig(prevStep);
    }
  }, [state.step]);

  const completeOnboarding = useCallback(() => {
    const completedState = manager.completeOnboarding();
    setState(completedState);
    setCurrentStepConfig(null);
  }, [manager]);

  const resetOnboarding = useCallback(() => {
    manager.clearState();
    const newState = manager.initializeState();
    setState(newState);
    setCurrentStepConfig(manager.getCurrentStep());
  }, [manager]);

  const isComplete = state.step === 'complete';
  const progressPercentage = state.progress;
  const canSkipCurrent = currentStepConfig ? !currentStepConfig.required : false;

  return {
    state,
    currentStepConfig,
    isComplete,
    progressPercentage,
    canSkipCurrent,
    goToNextStep,
    skipStep,
    goToPreviousStep,
    completeOnboarding,
    resetOnboarding
  };
}
