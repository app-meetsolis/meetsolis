/**
 * Onboarding Manager Unit Tests
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

import { OnboardingManager } from '@/lib/onboarding/OnboardingManager';
import { ONBOARDING_STEPS } from '@/lib/onboarding/constants';

describe('OnboardingManager', () => {
  let manager: OnboardingManager;

  beforeEach(() => {
    manager = new OnboardingManager(ONBOARDING_STEPS);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('State Initialization', () => {
    it('should create default state when no saved state exists', () => {
      const state = manager.initializeState();

      expect(state.step).toBe('welcome');
      expect(state.progress).toBe(0);
      expect(state.completedSteps).toEqual([]);
      expect(state.canSkip).toBe(false);
      expect(state.lastCompletedAt).toBeInstanceOf(Date);
    });

    it('should restore state from localStorage', () => {
      const savedState = {
        step: 'permissions',
        progress: 50,
        completedSteps: ['welcome'],
        canSkip: true,
        timeEstimate: '1min',
        lastCompletedAt: new Date().toISOString()
      };

      localStorage.setItem('meetsolis_onboarding_state', JSON.stringify(savedState));

      const state = manager.initializeState();
      expect(state.step).toBe('permissions');
      expect(state.completedSteps).toEqual(['welcome']);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('meetsolis_onboarding_state', 'invalid json');

      const state = manager.initializeState();
      expect(state.step).toBe('welcome');
      expect(state.progress).toBe(0);
    });
  });

  describe('Step Navigation', () => {
    it('should get current step configuration', () => {
      const currentStep = manager.getCurrentStep();

      expect(currentStep).not.toBeNull();
      expect(currentStep?.id).toBe('welcome');
      expect(currentStep?.title).toBe('Welcome to MeetSolis');
    });

    it('should calculate progress percentage correctly', () => {
      const initialProgress = manager.getProgressPercentage();
      expect(initialProgress).toBe(0);

      manager.next();
      const progress = manager.getProgressPercentage();
      expect(progress).toBe(25); // 1 out of 4 steps
    });
  });

  describe('Skip Functionality', () => {
    it('should not allow skipping required steps', () => {
      // Welcome step is required
      expect(manager.canSkip()).toBe(false);
    });

    it('should allow skipping optional steps', () => {
      // Navigate to profile step (optional)
      manager.next(); // permissions
      manager.next(); // profile

      expect(manager.canSkip()).toBe(true);
    });
  });

  describe('State Persistence', () => {
    it('should save state to localStorage', () => {
      const state = manager.initializeState();
      manager.saveState(state);

      const saved = localStorage.getItem('meetsolis_onboarding_state');
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed.step).toBe('welcome');
    });

    it('should clear saved state', () => {
      const state = manager.initializeState();
      manager.saveState(state);

      manager.clearState();

      const saved = localStorage.getItem('meetsolis_onboarding_state');
      expect(saved).toBeNull();
    });
  });

  describe('Onboarding Completion', () => {
    it('should complete onboarding with all steps marked', () => {
      const completedState = manager.completeOnboarding();

      expect(completedState.step).toBe('complete');
      expect(completedState.progress).toBe(100);
      expect(completedState.completedSteps.length).toBe(ONBOARDING_STEPS.length);
      expect(completedState.completedSteps).toContain('welcome');
      expect(completedState.completedSteps).toContain('permissions');
      expect(completedState.completedSteps).toContain('profile');
      expect(completedState.completedSteps).toContain('first-meeting');
    });
  });
});
