/**
 * Tests for OnboardingIncompleteBanner Component
 * Story 1.9: Onboarding Completion Enforcement & Optimization
 */

import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingIncompleteBanner } from '../OnboardingIncompleteBanner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Clerk auth
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

const mockPush = jest.fn();

describe('OnboardingIncompleteBanner', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Setup mocks
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useAuth as jest.Mock).mockReturnValue({
      isSignedIn: true,
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Banner Visibility Logic', () => {
    it('should not render if user not signed in', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isSignedIn: false,
      });

      const { container } = render(<OnboardingIncompleteBanner />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render if onboarding complete', () => {
      localStorage.setItem(
        'meetsolis_onboarding_state',
        JSON.stringify({
          step: 'complete',
          progress: 100,
        })
      );

      const { container } = render(<OnboardingIncompleteBanner />);
      waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('should not render if progress is 100% even if step is not complete', () => {
      localStorage.setItem(
        'meetsolis_onboarding_state',
        JSON.stringify({
          step: 'first-meeting',
          progress: 100,
        })
      );

      const { container } = render(<OnboardingIncompleteBanner />);
      waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('should render if onboarding incomplete', async () => {
      localStorage.setItem(
        'meetsolis_onboarding_state',
        JSON.stringify({
          step: 'profile',
          progress: 50,
        })
      );

      render(<OnboardingIncompleteBanner />);

      await waitFor(() => {
        expect(screen.getByText(/Complete Your Setup/i)).toBeInTheDocument();
        expect(screen.getByText(/50% done/i)).toBeInTheDocument();
      });
    });

    it('should not render if dismissed within 7 days', async () => {
      localStorage.setItem(
        'meetsolis_onboarding_state',
        JSON.stringify({
          step: 'profile',
          progress: 50,
        })
      );

      // Set dismissed timestamp to 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      localStorage.setItem(
        'onboarding_banner_dismissed',
        threeDaysAgo.toISOString()
      );

      const { container } = render(<OnboardingIncompleteBanner />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('should render if dismissed more than 7 days ago', async () => {
      localStorage.setItem(
        'meetsolis_onboarding_state',
        JSON.stringify({
          step: 'profile',
          progress: 50,
        })
      );

      // Set dismissed timestamp to 8 days ago
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
      localStorage.setItem(
        'onboarding_banner_dismissed',
        eightDaysAgo.toISOString()
      );

      render(<OnboardingIncompleteBanner />);

      await waitFor(() => {
        expect(screen.getByText(/Complete Your Setup/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      localStorage.setItem(
        'meetsolis_onboarding_state',
        JSON.stringify({
          step: 'profile',
          progress: 50,
        })
      );
    });

    it('should navigate to onboarding when Resume clicked', async () => {
      render(<OnboardingIncompleteBanner />);

      await waitFor(() => {
        const resumeButton = screen.getByText('Resume Onboarding');
        fireEvent.click(resumeButton);
      });

      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });

    it('should dismiss banner when Dismiss clicked', async () => {
      render(<OnboardingIncompleteBanner />);

      await waitFor(async () => {
        const dismissButton = screen.getByText('Dismiss');
        fireEvent.click(dismissButton);

        await waitFor(() => {
          const dismissed = localStorage.getItem('onboarding_banner_dismissed');
          expect(dismissed).toBeTruthy();
        });
      });
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      localStorage.setItem(
        'meetsolis_onboarding_state',
        JSON.stringify({
          step: 'profile',
          progress: 50,
        })
      );
    });

    it('should dismiss on Escape key', async () => {
      render(<OnboardingIncompleteBanner />);

      await waitFor(() => {
        const banner = screen.getByRole('region');
        fireEvent.keyDown(banner, { key: 'Escape' });
      });

      await waitFor(() => {
        const dismissed = localStorage.getItem('onboarding_banner_dismissed');
        expect(dismissed).toBeTruthy();
      });
    });

    it('should navigate on Enter key for Resume button', async () => {
      render(<OnboardingIncompleteBanner />);

      await waitFor(() => {
        const resumeButton = screen.getByText('Resume Onboarding');
        fireEvent.keyDown(resumeButton, { key: 'Enter' });
      });

      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });

    it('should navigate on Space key for Resume button', async () => {
      render(<OnboardingIncompleteBanner />);

      await waitFor(() => {
        const resumeButton = screen.getByText('Resume Onboarding');
        fireEvent.keyDown(resumeButton, { key: ' ' });
      });

      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      localStorage.setItem(
        'meetsolis_onboarding_state',
        JSON.stringify({
          step: 'profile',
          progress: 50,
        })
      );
    });

    it('should have proper ARIA attributes', async () => {
      render(<OnboardingIncompleteBanner />);

      await waitFor(() => {
        const banner = screen.getByRole('region');
        expect(banner).toHaveAttribute('aria-live', 'polite');
        expect(banner).toHaveAttribute(
          'aria-label',
          'Onboarding completion reminder'
        );
      });
    });

    it('should have proper button labels', async () => {
      render(<OnboardingIncompleteBanner />);

      await waitFor(() => {
        const dismissButton = screen.getByLabelText(
          'Dismiss onboarding reminder'
        );
        const resumeButton = screen.getByLabelText('Resume onboarding process');

        expect(dismissButton).toBeInTheDocument();
        expect(resumeButton).toBeInTheDocument();
      });
    });

    it('should have minimum touch target size (44px)', async () => {
      render(<OnboardingIncompleteBanner />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          const styles = window.getComputedStyle(button);
          const minHeight = parseInt(styles.minHeight);
          expect(minHeight).toBeGreaterThanOrEqual(44);
        });
      });
    });

    it('should be keyboard accessible', async () => {
      render(<OnboardingIncompleteBanner />);

      await waitFor(() => {
        const banner = screen.getByRole('region');
        expect(banner).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('Analytics Tracking', () => {
    let mockAnalytics: jest.Mock;

    beforeEach(() => {
      mockAnalytics = jest.fn();
      localStorage.setItem(
        'meetsolis_onboarding_state',
        JSON.stringify({
          step: 'profile',
          progress: 50,
        })
      );
    });

    it('should track banner display', async () => {
      render(<OnboardingIncompleteBanner onAnalyticsTrack={mockAnalytics} />);

      await waitFor(() => {
        expect(mockAnalytics).toHaveBeenCalledWith(
          'onboarding_banner_displayed',
          expect.objectContaining({
            last_step: 'profile',
            progress: 50,
          })
        );
      });
    });

    it('should track resume click', async () => {
      render(<OnboardingIncompleteBanner onAnalyticsTrack={mockAnalytics} />);

      await waitFor(() => {
        const resumeButton = screen.getByText('Resume Onboarding');
        fireEvent.click(resumeButton);
      });

      expect(mockAnalytics).toHaveBeenCalledWith(
        'onboarding_banner_clicked',
        expect.objectContaining({
          last_step: 'profile',
          progress: 50,
        })
      );
    });

    it('should track dismissal', async () => {
      render(<OnboardingIncompleteBanner onAnalyticsTrack={mockAnalytics} />);

      await waitFor(() => {
        const dismissButton = screen.getByText('Dismiss');
        fireEvent.click(dismissButton);
      });

      expect(mockAnalytics).toHaveBeenCalledWith(
        'onboarding_banner_dismissed',
        expect.objectContaining({
          last_step: 'profile',
          progress: 50,
        })
      );
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      localStorage.setItem(
        'meetsolis_onboarding_state',
        JSON.stringify({
          step: 'profile',
          progress: 50,
        })
      );
    });

    it('should render correctly on mobile (375px)', async () => {
      // Mock window.matchMedia for mobile
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(max-width: 640px)',
          media: query,
          onchange: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<OnboardingIncompleteBanner />);

      await waitFor(() => {
        const banner = screen.getByRole('region');
        expect(banner).toBeInTheDocument();
      });
    });
  });

  describe('Color Contrast (WCAG 2.1 AA)', () => {
    beforeEach(() => {
      localStorage.setItem(
        'meetsolis_onboarding_state',
        JSON.stringify({
          step: 'profile',
          progress: 50,
        })
      );
    });

    it('should have sufficient color contrast', async () => {
      render(<OnboardingIncompleteBanner />);

      await waitFor(() => {
        // This would typically use a tool like axe-core
        // For now, we verify the classes are applied correctly
        const banner = screen.getByRole('region');
        expect(banner).toHaveClass('bg-blue-50');
        expect(banner).toHaveClass('border-blue-600');
      });
    });
  });
});
