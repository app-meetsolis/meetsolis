/**
 * Cookie Consent Component Tests
 * Tests for GDPR-compliant cookie consent banner
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CookieConsent } from '@/components/common/CookieConsent';

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  analytics: {
    setConsent: jest.fn(),
    track: jest.fn(),
  },
}));

const { analytics } = require('@/lib/analytics');

describe('CookieConsent', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Banner Display', () => {
    it('should show banner when no consent is saved', async () => {
      render(<CookieConsent />);

      // Fast-forward past the delay
      jest.advanceTimersByTime(1000);

      // Wait for banner to appear (1 second delay)
      await waitFor(() => {
        expect(screen.getByText(/We value your privacy/i)).toBeInTheDocument();
      });
    });

    it('should not show banner when consent is already saved', () => {
      localStorage.setItem(
        'cookie-consent',
        JSON.stringify({
          necessary: true,
          analytics: true,
          marketing: false,
        })
      );

      render(<CookieConsent />);

      expect(
        screen.queryByText(/We value your privacy/i)
      ).not.toBeInTheDocument();
    });

    it('should show banner after delay for better UX', async () => {
      render(<CookieConsent />);

      // Should not be visible immediately
      expect(
        screen.queryByText(/We value your privacy/i)
      ).not.toBeInTheDocument();

      // Fast-forward past the delay
      jest.advanceTimersByTime(1000);

      // Should appear after delay
      await waitFor(() => {
        expect(screen.getByText(/We value your privacy/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accept All Button', () => {
    it('should accept all cookies when clicked', async () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('Accept All')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Accept All'));

      // Check localStorage
      const consent = JSON.parse(
        localStorage.getItem('cookie-consent') || '{}'
      );
      expect(consent).toEqual({
        necessary: true,
        analytics: true,
        marketing: true,
      });

      // Check analytics consent was enabled
      expect(analytics.setConsent).toHaveBeenCalledWith(true);
    });

    it('should hide banner after accepting', async () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('Accept All')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Accept All'));

      await waitFor(() => {
        expect(
          screen.queryByText(/We value your privacy/i)
        ).not.toBeInTheDocument();
      });
    });

    it('should track consent decision', async () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('Accept All')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Accept All'));

      await waitFor(() => {
        expect(analytics.track).toHaveBeenCalledWith('cookie_consent_updated', {
          analytics: true,
          marketing: true,
        });
      });
    });
  });

  describe('Necessary Only Button', () => {
    it('should accept only necessary cookies when clicked', async () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('Necessary Only')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Necessary Only'));

      // Check localStorage
      const consent = JSON.parse(
        localStorage.getItem('cookie-consent') || '{}'
      );
      expect(consent).toEqual({
        necessary: true,
        analytics: false,
        marketing: false,
      });

      // Check analytics consent was disabled
      expect(analytics.setConsent).toHaveBeenCalledWith(false);
    });

    it('should not track consent when analytics disabled', async () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('Necessary Only')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Necessary Only'));

      // Should not call track since analytics is disabled
      expect(analytics.track).not.toHaveBeenCalled();
    });
  });

  describe('Customize Button', () => {
    it('should show preferences modal when clicked', async () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('Customize')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Customize'));

      await waitFor(() => {
        expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
      });
    });

    it('should show all cookie categories in preferences', async () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('Customize')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Customize'));

      await waitFor(() => {
        expect(screen.getByText('Necessary Cookies')).toBeInTheDocument();
        expect(screen.getByText('Analytics Cookies')).toBeInTheDocument();
        expect(screen.getByText('Marketing Cookies')).toBeInTheDocument();
      });
    });
  });

  describe('Preferences Modal', () => {
    beforeEach(async () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('Customize')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Customize'));

      await waitFor(() => {
        expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
      });
    });

    it('should have necessary cookies always enabled', () => {
      const alwaysActiveButton = screen.getByText('Always Active');
      expect(alwaysActiveButton).toBeDisabled();
    });

    it('should toggle analytics preference', () => {
      const analyticsButtons = screen
        .getAllByRole('button')
        .filter(
          button =>
            button.textContent === 'Disabled' ||
            button.textContent === 'Enabled'
        );

      // Find analytics toggle (first toggle button)
      const analyticsToggle = analyticsButtons[0];
      expect(analyticsToggle.textContent).toBe('Disabled');

      fireEvent.click(analyticsToggle);

      expect(screen.getAllByText('Enabled')[0]).toBeInTheDocument();
    });

    it('should save custom preferences', async () => {
      // Toggle analytics on
      const analyticsButtons = screen
        .getAllByRole('button')
        .filter(
          button =>
            button.textContent === 'Disabled' ||
            button.textContent === 'Enabled'
        );
      fireEvent.click(analyticsButtons[0]);

      // Click Save Preferences
      fireEvent.click(screen.getByText('Save Preferences'));

      await waitFor(() => {
        const consent = JSON.parse(
          localStorage.getItem('cookie-consent') || '{}'
        );
        expect(consent.analytics).toBe(true);
      });
    });

    it('should show privacy policy links', () => {
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Cookie Policy')).toBeInTheDocument();
    });
  });

  describe('Saved Preferences', () => {
    it('should load saved preferences on mount', () => {
      const savedPreferences = {
        necessary: true,
        analytics: true,
        marketing: false,
      };

      localStorage.setItem('cookie-consent', JSON.stringify(savedPreferences));

      render(<CookieConsent />);

      // Analytics consent should be applied
      expect(analytics.setConsent).toHaveBeenCalledWith(true);
    });

    it('should handle corrupted saved preferences', async () => {
      localStorage.setItem('cookie-consent', 'invalid-json');

      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      // Should show banner when preferences can't be parsed
      await waitFor(() => {
        expect(screen.getByText(/We value your privacy/i)).toBeInTheDocument();
      });
    });
  });
});
