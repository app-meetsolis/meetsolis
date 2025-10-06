/**
 * Mixpanel Analytics Service
 * Advanced analytics for retention, cohorts, and revenue tracking
 */

import mixpanel from 'mixpanel-browser';
import type { IAnalyticsService } from './types';
import type { EventProperties, UserProperties } from '@meetsolis/shared';

export class MixpanelService implements IAnalyticsService {
  private hasConsent: boolean = false;
  private isInitialized: boolean = false;

  initialize(userId?: string): void {
    if (typeof window === 'undefined') {
      return; // Server-side, skip initialization
    }

    if (this.isInitialized) {
      return; // Already initialized
    }

    const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
    if (!token) {
      console.warn('[Mixpanel] Token not configured, skipping initialization');
      return;
    }

    try {
      mixpanel.init(token, {
        debug: process.env.NODE_ENV === 'development',
        track_pageview: true,
        persistence: 'localStorage',
        ignore_dnt: false, // Respect Do Not Track browser setting
        opt_out_tracking_by_default: true, // Wait for consent
      });

      if (userId) {
        this.identify(userId);
      }

      this.isInitialized = true;
      console.log('[Mixpanel] Initialized successfully');
    } catch (error) {
      console.error('[Mixpanel] Initialization failed:', error);
    }
  }

  identify(userId: string, traits?: UserProperties): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      mixpanel.identify(userId);

      if (traits) {
        mixpanel.people.set(traits);
      }
    } catch (error) {
      console.error('[Mixpanel] Identify failed:', error);
    }
  }

  track(event: string, properties?: EventProperties): void {
    if (
      !this.hasConsent ||
      !this.isInitialized ||
      typeof window === 'undefined'
    ) {
      return;
    }

    try {
      mixpanel.track(event, properties);
    } catch (error) {
      console.error('[Mixpanel] Track event failed:', error);
    }
  }

  page(name?: string, properties?: EventProperties): void {
    if (
      !this.hasConsent ||
      !this.isInitialized ||
      typeof window === 'undefined'
    ) {
      return;
    }

    try {
      mixpanel.track_pageview({
        page: name,
        ...properties,
      });
    } catch (error) {
      console.error('[Mixpanel] Page view failed:', error);
    }
  }

  setConsent(hasConsent: boolean): void {
    this.hasConsent = hasConsent;

    if (typeof window === 'undefined' || !this.isInitialized) {
      return;
    }

    try {
      if (hasConsent) {
        mixpanel.opt_in_tracking();
      } else {
        mixpanel.opt_out_tracking();
      }
    } catch (error) {
      console.error('[Mixpanel] Set consent failed:', error);
    }
  }

  captureError(error: Error, context?: Record<string, any>): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      mixpanel.track('error_occurred', {
        error_message: error.message,
        error_name: error.name,
        error_stack: error.stack,
        ...context,
      });
    } catch (err) {
      console.error('[Mixpanel] Error capture failed:', err);
    }
  }

  /**
   * Track a funnel step (Mixpanel-specific)
   */
  trackFunnelStep(
    funnelName: string,
    step: number,
    properties?: EventProperties
  ): void {
    this.track(`${funnelName} - Step ${step}`, properties);
  }

  /**
   * Track revenue (Mixpanel-specific)
   */
  trackRevenue(amount: number, properties?: EventProperties): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      mixpanel.people.track_charge(amount, properties);
    } catch (error) {
      console.error('[Mixpanel] Track revenue failed:', error);
    }
  }

  /**
   * Increment a user property (useful for counting actions)
   */
  incrementUserProperty(property: string, by: number = 1): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      mixpanel.people.increment(property, by);
    } catch (error) {
      console.error('[Mixpanel] Increment property failed:', error);
    }
  }

  /**
   * Set user properties once (won't overwrite existing values)
   */
  setUserPropertiesOnce(properties: UserProperties): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      mixpanel.people.set_once(properties);
    } catch (error) {
      console.error('[Mixpanel] Set properties once failed:', error);
    }
  }

  /**
   * Register super properties (sent with every event)
   */
  registerSuperProperties(properties: EventProperties): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      mixpanel.register(properties);
    } catch (error) {
      console.error('[Mixpanel] Register super properties failed:', error);
    }
  }

  /**
   * Reset user identity (useful for logout)
   */
  reset(): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      mixpanel.reset();
    } catch (error) {
      console.error('[Mixpanel] Reset failed:', error);
    }
  }
}
