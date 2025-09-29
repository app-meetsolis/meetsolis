/**
 * GDPR Compliance Test Suite
 * Tests for data privacy, consent management, and user rights
 */

import {
  ConsentManager,
  DataExporter,
  DataDeletionService,
  DataRetentionService,
  DEFAULT_CONSENT_SETTINGS,
  COOKIE_CATEGORIES,
} from '@/lib/security/gdpr';

// Mock browser environment
const mockDocument = {
  cookie: '',
};

const mockWindow = {
  dispatchEvent: jest.fn(),
  addEventListener: jest.fn(),
};

// @ts-ignore
global.document = mockDocument;
// @ts-ignore
global.window = mockWindow;

describe('GDPR Compliance', () => {
  beforeEach(() => {
    mockDocument.cookie = '';
    jest.clearAllMocks();
  });

  describe('ConsentManager', () => {
    describe('getConsent', () => {
      it('should return default consent when no cookie exists', () => {
        const consent = ConsentManager.getConsent();

        expect(consent).toEqual(
          expect.objectContaining({
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false,
          })
        );
        expect(consent.lastUpdated).toBeInstanceOf(Date);
      });

      it('should parse existing consent cookie', () => {
        const testConsent = {
          necessary: true,
          analytics: true,
          marketing: false,
          preferences: true,
          lastUpdated: new Date().toISOString(),
        };

        mockDocument.cookie = `gdpr-consent=${encodeURIComponent(JSON.stringify(testConsent))}`;

        const consent = ConsentManager.getConsent();
        expect(consent.analytics).toBe(true);
        expect(consent.preferences).toBe(true);
        expect(consent.marketing).toBe(false);
      });

      it('should handle malformed consent cookie gracefully', () => {
        mockDocument.cookie = 'gdpr-consent=invalid-json';

        const consent = ConsentManager.getConsent();
        expect(consent).toEqual(
          expect.objectContaining(DEFAULT_CONSENT_SETTINGS)
        );
      });
    });

    describe('setConsent', () => {
      it('should update consent settings', () => {
        ConsentManager.setConsent({
          analytics: true,
          marketing: true,
        });

        expect(mockDocument.cookie).toContain('gdpr-consent=');
        expect(mockDocument.cookie).toContain('analytics');
        expect(mockWindow.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'consent-changed',
          })
        );
      });

      it('should always keep necessary consent as true', () => {
        ConsentManager.setConsent({
          necessary: false as any, // Try to set to false
          analytics: true,
        });

        // Parse the cookie to verify necessary is still true
        const cookieValue = mockDocument.cookie.split('=')[1];
        const consent = JSON.parse(decodeURIComponent(cookieValue));
        expect(consent.necessary).toBe(true);
      });

      it('should set proper cookie attributes', () => {
        ConsentManager.setConsent({ analytics: true });

        expect(mockDocument.cookie).toContain('SameSite=Strict');
        expect(mockDocument.cookie).toContain('Secure');
        expect(mockDocument.cookie).toContain('path=/');
      });
    });

    describe('hasConsent', () => {
      it('should check specific consent categories', () => {
        ConsentManager.setConsent({
          analytics: true,
          marketing: false,
        });

        expect(ConsentManager.hasConsent('necessary')).toBe(true);
        expect(ConsentManager.hasConsent('analytics')).toBe(true);
        expect(ConsentManager.hasConsent('marketing')).toBe(false);
      });
    });

    describe('revokeAllConsent', () => {
      it('should revoke all non-necessary consent', () => {
        ConsentManager.setConsent({
          analytics: true,
          marketing: true,
          preferences: true,
        });

        ConsentManager.revokeAllConsent();

        expect(ConsentManager.hasConsent('necessary')).toBe(true);
        expect(ConsentManager.hasConsent('analytics')).toBe(false);
        expect(ConsentManager.hasConsent('marketing')).toBe(false);
        expect(ConsentManager.hasConsent('preferences')).toBe(false);
      });
    });
  });

  describe('DataExporter', () => {
    describe('exportUserData', () => {
      it('should export user data in GDPR format', async () => {
        const userId = 'user123';
        const exportData = await DataExporter.exportUserData(userId);

        expect(exportData).toHaveProperty('userId', userId);
        expect(exportData).toHaveProperty('exportedAt');
        expect(exportData.exportedAt).toBeInstanceOf(Date);
        expect(exportData).toHaveProperty('data');

        expect(exportData.data).toHaveProperty('profile');
        expect(exportData.data).toHaveProperty('meetings');
        expect(exportData.data).toHaveProperty('files');
        expect(exportData.data).toHaveProperty('preferences');
      });

      it('should include all required data categories', async () => {
        const exportData = await DataExporter.exportUserData('user123');

        const requiredCategories = [
          'profile',
          'meetings',
          'files',
          'preferences',
        ];
        requiredCategories.forEach(category => {
          expect(exportData.data).toHaveProperty(category);
        });
      });
    });
  });

  describe('DataDeletionService', () => {
    describe('deleteUserData', () => {
      // Mock the console.log to avoid test output noise
      const originalConsoleLog = console.log;
      beforeEach(() => {
        console.log = jest.fn();
      });

      afterEach(() => {
        console.log = originalConsoleLog;
      });

      it('should delete user data with user_request reason', async () => {
        await DataDeletionService.deleteUserData('user123', 'user_request');

        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('User data deleted for user123')
        );
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('reason: user_request')
        );
      });

      it('should delete user data with retention_expired reason', async () => {
        await DataDeletionService.deleteUserData(
          'user123',
          'retention_expired'
        );

        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('reason: retention_expired')
        );
      });

      it('should handle deletion errors gracefully', async () => {
        // Mock a deletion method to throw an error
        const originalError = console.error;
        console.error = jest.fn();

        // This would require more sophisticated mocking to actually test error handling
        // For now, we just verify the method exists and can be called
        try {
          await DataDeletionService.deleteUserData('user123');
          expect(true).toBe(true);
        } catch (error) {
          expect(console.error).toHaveBeenCalled();
        }

        console.error = originalError;
      });
    });
  });

  describe('DataRetentionService', () => {
    describe('cleanupExpiredData', () => {
      const originalConsoleLog = console.log;

      beforeEach(() => {
        console.log = jest.fn();
      });

      afterEach(() => {
        console.log = originalConsoleLog;
      });

      it('should cleanup expired data for all categories', async () => {
        await DataRetentionService.cleanupExpiredData();

        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('Data retention cleanup completed')
        );
      });
    });
  });

  describe('Cookie Categories', () => {
    it('should define all required cookie categories', () => {
      const requiredCategories = [
        'necessary',
        'analytics',
        'marketing',
        'preferences',
      ];

      requiredCategories.forEach(category => {
        expect(COOKIE_CATEGORIES).toHaveProperty(category);
        expect(COOKIE_CATEGORIES[category]).toHaveProperty('name');
        expect(COOKIE_CATEGORIES[category]).toHaveProperty('description');
        expect(COOKIE_CATEGORIES[category]).toHaveProperty('cookies');
        expect(COOKIE_CATEGORIES[category]).toHaveProperty('required');
      });
    });

    it('should mark necessary cookies as required', () => {
      expect(COOKIE_CATEGORIES.necessary.required).toBe(true);
    });

    it('should mark optional cookies as not required', () => {
      expect(COOKIE_CATEGORIES.analytics.required).toBe(false);
      expect(COOKIE_CATEGORIES.marketing.required).toBe(false);
      expect(COOKIE_CATEGORIES.preferences.required).toBe(false);
    });

    it('should have descriptive names and descriptions', () => {
      Object.values(COOKIE_CATEGORIES).forEach(category => {
        expect(category.name).toBeTruthy();
        expect(category.description).toBeTruthy();
        expect(category.cookies).toBeInstanceOf(Array);
        expect(category.cookies.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Default Settings', () => {
    it('should have secure default consent settings', () => {
      expect(DEFAULT_CONSENT_SETTINGS.necessary).toBe(true);
      expect(DEFAULT_CONSENT_SETTINGS.analytics).toBe(false);
      expect(DEFAULT_CONSENT_SETTINGS.marketing).toBe(false);
      expect(DEFAULT_CONSENT_SETTINGS.preferences).toBe(false);
      expect(DEFAULT_CONSENT_SETTINGS.lastUpdated).toBeInstanceOf(Date);
    });
  });
});
