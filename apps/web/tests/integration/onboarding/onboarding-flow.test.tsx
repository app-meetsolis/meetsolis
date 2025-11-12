/**
 * Onboarding Flow Integration Tests
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { ONBOARDING_STEPS } from '@/lib/onboarding/constants';

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/onboarding',
}));

describe('Onboarding Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  describe('Complete Onboarding Flow', () => {
    it('should display welcome step initially', () => {
      render(<OnboardingContainer />);

      expect(screen.getByText('Welcome to MeetSolis!')).toBeInTheDocument();
    });

    it('should show step progress indicator', async () => {
      render(<OnboardingContainer />);

      // Wait for client-side rendering to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Should show step counter
      expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();

      // Should show current step title
      expect(screen.getByText('Welcome to MeetSolis')).toBeInTheDocument();
    });
  });

  describe('State Persistence', () => {
    it('should initialize with default state', () => {
      render(<OnboardingContainer />);

      const saved = localStorage.getItem('meetsolis_onboarding_state');
      expect(saved).toBeTruthy();
    });

    it('should restore state on mount', () => {
      const savedState = {
        step: 'permissions',
        progress: 25,
        completedSteps: ['welcome'],
        canSkip: false,
        timeEstimate: '1min',
        lastCompletedAt: new Date().toISOString()
      };

      localStorage.setItem('meetsolis_onboarding_state', JSON.stringify(savedState));

      render(<OnboardingContainer />);

      // Verify we're on the permissions step (Device Setup)
      const headings = screen.getAllByRole('heading', { name: 'Device Setup' });
      expect(headings.length).toBeGreaterThanOrEqual(1);
    });
  });
});
