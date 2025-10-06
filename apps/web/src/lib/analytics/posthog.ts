/**
 * PostHog Analytics Service
 * Product analytics for feature usage and funnels
 */

import posthog from 'posthog-js';
import type { IAnalyticsService } from './types';
import type { EventProperties, UserProperties } from '@meetsolis/shared';

export class PostHogService implements IAnalyticsService {
  private hasConsent: boolean = false;
  private isInitialized: boolean = false;

  initialize(userId?: string): void {
    if (typeof window === 'undefined') {
      return; // Server-side, skip initialization
    }

    if (this.isInitialized) {
      return; // Already initialized
    }

    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!apiKey) {
      console.warn('[PostHog] API key not configured, skipping initialization');
      return;
    }

    try {
      posthog.init(apiKey, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        loaded: ph => {
          if (userId) {
            ph.identify(userId);
          }
        },
        capture_pageview: true, // Automatic page view tracking
        capture_pageleave: true, // Track when users leave pages
        autocapture: false, // Manual event tracking for better control
        disable_session_recording: true, // Disable session replay (use Hotjar instead)
        persistence: 'localStorage', // Store user data in localStorage
        opt_out_capturing_by_default: true, // Wait for consent before tracking
      });

      this.isInitialized = true;
      console.log('[PostHog] Initialized successfully');
    } catch (error) {
      console.error('[PostHog] Initialization failed:', error);
    }
  }

  identify(userId: string, traits?: UserProperties): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      posthog.identify(userId, traits);
    } catch (error) {
      console.error('[PostHog] Identify failed:', error);
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
      posthog.capture(event, properties);
    } catch (error) {
      console.error('[PostHog] Track event failed:', error);
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
      posthog.capture('$pageview', {
        page: name,
        ...properties,
      });
    } catch (error) {
      console.error('[PostHog] Page view failed:', error);
    }
  }

  setConsent(hasConsent: boolean): void {
    this.hasConsent = hasConsent;

    if (typeof window === 'undefined' || !this.isInitialized) {
      return;
    }

    try {
      if (hasConsent) {
        posthog.opt_in_capturing();
      } else {
        posthog.opt_out_capturing();
      }
    } catch (error) {
      console.error('[PostHog] Set consent failed:', error);
    }
  }

  captureError(error: Error, context?: Record<string, any>): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      posthog.capture('error_occurred', {
        error_message: error.message,
        error_name: error.name,
        error_stack: error.stack,
        ...context,
      });
    } catch (err) {
      console.error('[PostHog] Error capture failed:', err);
    }
  }

  /**
   * Track a funnel step (PostHog-specific)
   */
  trackFunnelStep(
    funnelName: string,
    step: number,
    properties?: EventProperties
  ): void {
    this.track(`${funnelName}_step_${step}`, properties);
  }

  /**
   * Set user properties (PostHog-specific)
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      posthog.people.set(properties);
    } catch (error) {
      console.error('[PostHog] Set user properties failed:', error);
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
      posthog.reset();
    } catch (error) {
      console.error('[PostHog] Reset failed:', error);
    }
  }
}
