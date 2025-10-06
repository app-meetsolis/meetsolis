/**
 * Analytics Service Interface
 * Common interface for all analytics providers
 */

import type {
  EventProperties,
  UserProperties,
  ConsentPreferences,
} from '@meetsolis/shared';

export interface IAnalyticsService {
  /**
   * Initialize the analytics service
   * @param userId - Optional user identifier
   */
  initialize(userId?: string): void;

  /**
   * Identify a user with their properties
   * @param userId - User identifier
   * @param traits - User properties/traits
   */
  identify(userId: string, traits?: UserProperties): void;

  /**
   * Track an analytics event
   * @param event - Event name
   * @param properties - Event properties
   */
  track(event: string, properties?: EventProperties): void;

  /**
   * Track a page view
   * @param name - Optional page name
   * @param properties - Optional page properties
   */
  page(name?: string, properties?: EventProperties): void;

  /**
   * Set user consent for analytics tracking
   * @param hasConsent - Whether user has consented
   */
  setConsent(hasConsent: boolean): void;

  /**
   * Capture an error for tracking
   * @param error - Error object
   * @param context - Additional error context
   */
  captureError?(error: Error, context?: Record<string, any>): void;
}

/**
 * Analytics provider names
 */
export enum AnalyticsProvider {
  POSTHOG = 'posthog',
  MIXPANEL = 'mixpanel',
  HOTJAR = 'hotjar',
  VERCEL = 'vercel',
  MOCK = 'mock',
}
