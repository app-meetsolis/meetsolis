/**
 * Analytics Type Definitions
 * Shared types for analytics events, user properties, and dashboard metrics
 */

/**
 * Enumeration of all tracked analytics events in the application
 */
export enum AnalyticsEvent {
  // User Journey
  USER_SIGNED_UP = 'user_signed_up',
  USER_SIGNED_IN = 'user_signed_in',
  USER_SIGNED_OUT = 'user_signed_out',

  // Meeting Events
  MEETING_CREATED = 'meeting_created',
  MEETING_JOINED = 'meeting_joined',
  MEETING_ENDED = 'meeting_ended',
  MEETING_RECORDING_STARTED = 'meeting_recording_started',

  // Feature Usage
  WHITEBOARD_OPENED = 'whiteboard_opened',
  FILE_SHARED = 'file_shared',
  SCREEN_SHARED = 'screen_shared',
  CHAT_MESSAGE_SENT = 'chat_message_sent',

  // Engagement
  SETTINGS_UPDATED = 'settings_updated',
  PROFILE_UPDATED = 'profile_updated',
  FEEDBACK_SUBMITTED = 'feedback_submitted',

  // Cookie Consent
  COOKIE_CONSENT_UPDATED = 'cookie_consent_updated',

  // Web Vitals
  WEB_VITALS = 'web_vitals',
}

/**
 * Event payload structure
 */
export interface AnalyticsEventPayload {
  event: AnalyticsEvent | string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

/**
 * User identification properties
 */
export interface UserProperties {
  userId: string;
  email?: string;
  name?: string;
  role?: string;
  signupDate?: string;
  plan?: string;
}

/**
 * Generic event properties
 */
export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Cookie consent preferences
 */
export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

/**
 * Analytics dashboard metrics structure
 */
export interface AnalyticsDashboardMetrics {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    retention: number;
  };
  meetingMetrics: {
    totalMeetings: number;
    averageDuration: number;
    successRate: number;
    recordedMeetings: number;
  };
  performanceMetrics: {
    averageLoadTime: number;
    errorRate: number;
    apiLatency: number;
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
  };
  engagementMetrics: {
    dailyActiveUsers: number;
    averageSessionDuration: number;
    featuresUsed: Record<string, number>;
  };
}

/**
 * Web Vitals metrics
 */
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Error context for tracking
 */
export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  meetingId?: string;
  route?: string;
  userAgent?: string;
  [key: string]: any;
}
