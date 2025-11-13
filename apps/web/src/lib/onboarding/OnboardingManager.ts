/**
 * Onboarding Manager
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 * Story 1.9: Onboarding Completion Enforcement & Optimization (Database Sync)
 */

import { OnboardingState, OnboardingStepConfig } from '@/types/onboarding';
import { ONBOARDING_STEPS, ONBOARDING_STORAGE_KEY } from './constants';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export class OnboardingManager {
  private currentStep: number = 0;
  private totalSteps: number;
  private steps: OnboardingStepConfig[];
  private syncInProgress: boolean = false;
  private syncRetryCount: number = 0;

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
          lastCompletedAt: new Date(parsed.lastCompletedAt),
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
      lastCompletedAt: new Date(),
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
      lastCompletedAt: new Date(),
    };
  }

  // =============================================================================
  // DATABASE SYNC METHODS (Story 1.9)
  // =============================================================================

  /**
   * Sync onboarding state to database with optimistic UI updates
   */
  async syncToDatabase(
    state: OnboardingState
  ): Promise<{ success: boolean; error?: string }> {
    // Prevent concurrent syncs
    if (this.syncInProgress) {
      return { success: false, error: 'Sync already in progress' };
    }

    this.syncInProgress = true;

    try {
      // Optimistically save to localStorage first
      this.saveState(state);

      // Attempt database sync with retry logic
      const result = await this.attemptDatabaseSync(state);

      this.syncInProgress = false;
      this.syncRetryCount = 0;

      return result;
    } catch (error) {
      this.syncInProgress = false;
      console.error('Sync to database failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Attempt database sync with retry logic
   */
  private async attemptDatabaseSync(
    state: OnboardingState,
    retryCount: number = 0
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/onboarding/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: state.step,
          completed: state.step === 'complete',
          onboarding_last_step: state.step,
        }),
      });

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          return {
            success: false,
            error: `Rate limit exceeded. Retry after ${retryAfter} seconds.`,
          };
        }

        // Handle server errors with retry
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          await this.delay(RETRY_DELAY_MS * (retryCount + 1)); // Exponential backoff
          return this.attemptDatabaseSync(state, retryCount + 1);
        }

        const errorData = await response.json().catch(() => null);
        return {
          success: false,
          error: errorData?.error?.message || `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      return { success: true };
    } catch (error) {
      // Network error - retry if attempts remain
      if (retryCount < MAX_RETRIES) {
        await this.delay(RETRY_DELAY_MS * (retryCount + 1));
        return this.attemptDatabaseSync(state, retryCount + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Fetch onboarding status from database
   */
  async fetchFromDatabase(): Promise<OnboardingState | null> {
    try {
      const response = await fetch('/api/onboarding/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch onboarding status:', response.status);
        return null;
      }

      const data = await response.json();

      // Convert database format to OnboardingState
      if (data.onboarding_completed) {
        return this.completeOnboarding();
      }

      if (data.onboarding_last_step) {
        const state = this.initializeState();
        return {
          ...state,
          step: data.onboarding_last_step as OnboardingState['step'],
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      return null;
    }
  }

  /**
   * Resolve conflict between localStorage and database state
   */
  async resolveStateConflict(): Promise<OnboardingState> {
    const localState = this.initializeState();
    const dbState = await this.fetchFromDatabase();

    // If no database state, use local
    if (!dbState) {
      return localState;
    }

    // If database shows completed, that takes precedence
    if (dbState.step === 'complete') {
      this.saveState(dbState);
      return dbState;
    }

    // If local is further ahead, sync to database
    const localStepIndex = this.steps.findIndex(s => s.id === localState.step);
    const dbStepIndex = this.steps.findIndex(s => s.id === dbState.step);

    if (localStepIndex > dbStepIndex) {
      await this.syncToDatabase(localState);
      return localState;
    }

    // Otherwise, use database state
    this.saveState(dbState);
    return dbState;
  }

  /**
   * Helper: Delay for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
