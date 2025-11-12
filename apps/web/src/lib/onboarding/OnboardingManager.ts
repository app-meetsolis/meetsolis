/**
 * Onboarding Manager
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

import { OnboardingState, OnboardingStepConfig } from '@/types/onboarding';
import { ONBOARDING_STEPS, ONBOARDING_STORAGE_KEY } from './constants';

export class OnboardingManager {
  private currentStep: number = 0;
  private totalSteps: number;
  private steps: OnboardingStepConfig[];

  constructor(steps: OnboardingStepConfig[] = ONBOARDING_STEPS) {
    this.steps = steps;
    this.totalSteps = steps.length;
  }

  /**
   * Initialize onboarding state from storage or create new
   */
  initializeState(): OnboardingState {
    if (typeof window === 'undefined') {
      return this.createDefaultState();
    }

    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          lastCompletedAt: new Date(parsed.lastCompletedAt)
        };
      } catch (error) {
        console.error('Failed to parse onboarding state:', error);
      }
    }

    return this.createDefaultState();
  }

  /**
   * Create default onboarding state
   */
  private createDefaultState(): OnboardingState {
    return {
      step: 'welcome',
      progress: 0,
      completedSteps: [],
      canSkip: false,
      timeEstimate: this.steps[0]?.timeEstimate || '0s',
      lastCompletedAt: new Date()
    };
  }

  /**
   * Move to next step
   */
  next(): void {
    if (this.canProceed()) {
      this.currentStep++;
      this.updateProgress();
    }
  }

  /**
   * Skip current step if allowed
   */
  skip(): void {
    if (this.canSkip()) {
      this.markStepSkipped();
      this.next();
    }
  }

  /**
   * Check if can proceed to next step
   */
  private canProceed(): boolean {
    return this.currentStep < this.totalSteps;
  }

  /**
   * Check if current step can be skipped
   */
  canSkip(): boolean {
    const currentStepConfig = this.steps[this.currentStep];
    return currentStepConfig ? !currentStepConfig.required : false;
  }

  /**
   * Mark step as skipped
   */
  private markStepSkipped(): void {
    // Implementation for tracking skipped steps
    console.log(`Step ${this.currentStep} skipped`);
  }

  /**
   * Update progress calculation
   */
  private updateProgress(): void {
    // Implementation for progress tracking
    console.log(`Progress: ${this.currentStep}/${this.totalSteps}`);
  }

  /**
   * Get current step configuration
   */
  getCurrentStep(): OnboardingStepConfig | null {
    return this.steps[this.currentStep] || null;
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  /**
   * Save state to storage
   */
  saveState(state: OnboardingState): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    }
  }

  /**
   * Clear onboarding state
   */
  clearState(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  }

  /**
   * Complete onboarding
   */
  completeOnboarding(): OnboardingState {
    return {
      step: 'complete',
      progress: 100,
      completedSteps: this.steps.map(s => s.id),
      canSkip: false,
      timeEstimate: '0s',
      lastCompletedAt: new Date()
    };
  }
}
