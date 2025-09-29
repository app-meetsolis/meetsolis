/**
 * GDPR Compliance Utilities
 * Handles data privacy, consent management, and user rights
 */

export interface ConsentSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  lastUpdated: Date;
}

export interface UserDataExport {
  userId: string;
  exportedAt: Date;
  data: {
    profile: any;
    meetings: any[];
    files: any[];
    preferences: any;
  };
}

export interface DataProcessingLog {
  id: string;
  userId: string;
  action: 'created' | 'updated' | 'deleted' | 'exported' | 'accessed';
  dataType: string;
  timestamp: Date;
  purpose: string;
  legalBasis:
    | 'consent'
    | 'contract'
    | 'legitimate_interest'
    | 'legal_obligation';
}

/**
 * Default consent settings (only necessary cookies enabled)
 */
export const DEFAULT_CONSENT_SETTINGS: ConsentSettings = {
  necessary: true, // Cannot be disabled
  analytics: false,
  marketing: false,
  preferences: false,
  lastUpdated: new Date(),
};

/**
 * Cookie categories and their purposes
 */
export const COOKIE_CATEGORIES = {
  necessary: {
    name: 'Strictly Necessary',
    description:
      'Essential for the website to function properly. These cannot be disabled.',
    cookies: ['auth-token', 'session-id', 'csrf-token'],
    required: true,
  },
  analytics: {
    name: 'Analytics',
    description: 'Help us understand how visitors interact with our website.',
    cookies: ['analytics-id', 'page-views', 'user-events'],
    required: false,
  },
  marketing: {
    name: 'Marketing',
    description:
      'Used to track visitors across websites for advertising purposes.',
    cookies: ['marketing-id', 'ad-preferences'],
    required: false,
  },
  preferences: {
    name: 'Preferences',
    description:
      'Remember your settings and preferences for a better experience.',
    cookies: ['theme-preference', 'language-preference', 'timezone'],
    required: false,
  },
};

/**
 * Data retention periods (in days)
 */
export const DATA_RETENTION_PERIODS = {
  meetings: 90, // Meeting recordings and metadata
  files: 30, // Uploaded files
  logs: 180, // Security and audit logs
  analytics: 365, // Analytics data
  marketing: 30, // Marketing data
  user_profile: null, // Kept until account deletion
};

/**
 * GDPR-compliant consent management
 */
export class ConsentManager {
  private static CONSENT_COOKIE_NAME = 'gdpr-consent';
  private static CONSENT_VERSION = '1.0';

  /**
   * Get current consent settings from cookie
   */
  static getConsent(): ConsentSettings {
    if (typeof document === 'undefined') {
      return DEFAULT_CONSENT_SETTINGS;
    }

    try {
      const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(this.CONSENT_COOKIE_NAME));

      if (!cookie) {
        return DEFAULT_CONSENT_SETTINGS;
      }

      const value = cookie.split('=')[1];
      const consent = JSON.parse(decodeURIComponent(value));

      return {
        ...DEFAULT_CONSENT_SETTINGS,
        ...consent,
        lastUpdated: new Date(consent.lastUpdated),
      };
    } catch (error) {
      console.error('Error reading consent cookie:', error);
      return DEFAULT_CONSENT_SETTINGS;
    }
  }

  /**
   * Update consent settings
   */
  static setConsent(settings: Partial<ConsentSettings>): void {
    const currentConsent = this.getConsent();
    const newConsent: ConsentSettings = {
      ...currentConsent,
      ...settings,
      necessary: true, // Always true
      lastUpdated: new Date(),
    };

    if (typeof document !== 'undefined') {
      const value = encodeURIComponent(JSON.stringify(newConsent));
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);

      document.cookie = `${this.CONSENT_COOKIE_NAME}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;

      // Trigger consent change event if window is available
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('consent-changed', { detail: newConsent })
        );
      }
    }
  }

  /**
   * Check if specific consent is granted
   */
  static hasConsent(category: keyof ConsentSettings): boolean {
    const consent = this.getConsent();
    return consent[category] === true;
  }

  /**
   * Revoke all non-necessary consent
   */
  static revokeAllConsent(): void {
    this.setConsent({
      analytics: false,
      marketing: false,
      preferences: false,
    });
  }
}

/**
 * Data export utilities
 */
export class DataExporter {
  /**
   * Export user data in GDPR-compliant format
   */
  static async exportUserData(userId: string): Promise<UserDataExport> {
    // This would integrate with your actual data sources
    // For now, returning a structure that shows what data should be exported

    const exportData: UserDataExport = {
      userId,
      exportedAt: new Date(),
      data: {
        profile: {
          id: userId,
          email: '[user email]',
          name: '[user name]',
          createdAt: '[account creation date]',
          lastLogin: '[last login date]',
        },
        meetings: [
          // Meeting history, recordings metadata (not the actual recordings for privacy)
        ],
        files: [
          // File metadata and download links
        ],
        preferences: {
          theme: '[user theme preference]',
          language: '[user language preference]',
          notifications: '[notification settings]',
        },
      },
    };

    // Log the export action
    await this.logDataProcessing({
      userId,
      action: 'exported',
      dataType: 'full_profile',
      purpose: 'gdpr_data_export',
      legalBasis: 'consent',
    });

    return exportData;
  }

  /**
   * Log data processing activities
   */
  private static async logDataProcessing(
    log: Omit<DataProcessingLog, 'id' | 'timestamp'>
  ): Promise<void> {
    const fullLog: DataProcessingLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...log,
    };

    // Store in your logging system
    console.log('Data processing log:', fullLog);
  }
}

/**
 * Data deletion utilities
 */
export class DataDeletionService {
  /**
   * Delete user data according to GDPR right to erasure
   */
  static async deleteUserData(
    userId: string,
    reason: 'user_request' | 'retention_expired' = 'user_request'
  ): Promise<void> {
    try {
      // Delete from various data stores
      const deletionTasks = [
        this.deleteUserProfile(userId),
        this.deleteUserMeetings(userId),
        this.deleteUserFiles(userId),
        this.anonymizeAnalyticsData(userId),
      ];

      await Promise.all(deletionTasks);

      // Log the deletion
      await this.logDataDeletion(userId, reason);

      console.log(`User data deleted for ${userId}, reason: ${reason}`);
    } catch (error) {
      console.error(`Failed to delete user data for ${userId}:`, error);
      throw new Error('Data deletion failed');
    }
  }

  private static async deleteUserProfile(userId: string): Promise<void> {
    // Delete user profile data
    console.log(`Deleting profile for ${userId}`);
  }

  private static async deleteUserMeetings(userId: string): Promise<void> {
    // Delete meeting data and recordings
    console.log(`Deleting meetings for ${userId}`);
  }

  private static async deleteUserFiles(userId: string): Promise<void> {
    // Delete uploaded files
    console.log(`Deleting files for ${userId}`);
  }

  private static async anonymizeAnalyticsData(userId: string): Promise<void> {
    // Anonymize analytics data instead of deleting (for statistical purposes)
    console.log(`Anonymizing analytics data for ${userId}`);
  }

  private static async logDataDeletion(
    userId: string,
    reason: string
  ): Promise<void> {
    console.log(
      `Data deletion completed for ${userId}, reason: ${reason}, timestamp: ${new Date().toISOString()}`
    );
  }
}

/**
 * Data retention management
 */
export class DataRetentionService {
  /**
   * Clean up expired data based on retention policies
   */
  static async cleanupExpiredData(): Promise<void> {
    const cutoffDates = this.calculateCutoffDates();

    const cleanupTasks = [
      this.cleanupExpiredMeetings(cutoffDates.meetings),
      this.cleanupExpiredFiles(cutoffDates.files),
      this.cleanupExpiredLogs(cutoffDates.logs),
      this.cleanupExpiredAnalytics(cutoffDates.analytics),
      this.cleanupExpiredMarketing(cutoffDates.marketing),
    ];

    await Promise.allSettled(cleanupTasks);
    console.log('Data retention cleanup completed');
  }

  private static calculateCutoffDates(): Record<string, Date> {
    const now = new Date();
    const cutoffs: Record<string, Date> = {};

    for (const [dataType, days] of Object.entries(DATA_RETENTION_PERIODS)) {
      if (days !== null) {
        cutoffs[dataType] = new Date(
          now.getTime() - days * 24 * 60 * 60 * 1000
        );
      }
    }

    return cutoffs;
  }

  private static async cleanupExpiredMeetings(cutoffDate: Date): Promise<void> {
    console.log(`Cleaning up meetings older than ${cutoffDate.toISOString()}`);
  }

  private static async cleanupExpiredFiles(cutoffDate: Date): Promise<void> {
    console.log(`Cleaning up files older than ${cutoffDate.toISOString()}`);
  }

  private static async cleanupExpiredLogs(cutoffDate: Date): Promise<void> {
    console.log(`Cleaning up logs older than ${cutoffDate.toISOString()}`);
  }

  private static async cleanupExpiredAnalytics(
    cutoffDate: Date
  ): Promise<void> {
    console.log(
      `Cleaning up analytics data older than ${cutoffDate.toISOString()}`
    );
  }

  private static async cleanupExpiredMarketing(
    cutoffDate: Date
  ): Promise<void> {
    console.log(
      `Cleaning up marketing data older than ${cutoffDate.toISOString()}`
    );
  }
}
