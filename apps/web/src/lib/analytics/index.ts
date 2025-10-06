/**
 * Unified Analytics Manager
 * Central orchestrator for all analytics providers
 */

import type { IAnalyticsService } from './types';
import type { EventProperties, UserProperties } from '@meetsolis/shared';
import { PostHogService } from './posthog';
import { MixpanelService } from './mixpanel';
import { HotjarService } from './hotjar';
import { VercelAnalyticsService } from './vercel';
import { MockAnalyticsService } from './mock';

/**
 * Unified Analytics Manager
 * Manages multiple analytics providers with consent-based tracking
 */
export class AnalyticsManager implements IAnalyticsService {
  private providers: IAnalyticsService[] = [];
  private hasConsent: boolean = false;
  private isInitialized: boolean = false;
  private pendingEvents: Array<{
    method: 'track' | 'page' | 'identify';
    args: any[];
  }> = [];

  constructor() {
    // Initialize based on environment
    if (this.shouldUseRealServices()) {
      this.providers = [
        new PostHogService(),
        new MixpanelService(),
        new HotjarService(),
        new VercelAnalyticsService(),
      ];
    } else {
      // Development/test environment - use mock service
      this.providers = [new MockAnalyticsService()];
    }
  }

  /**
   * Determine if we should use real analytics services
   */
  private shouldUseRealServices(): boolean {
    // Use mock services in:
    // 1. Test environment
    // 2. Development with USE_MOCK_SERVICES flag
    // 3. Missing required API keys

    if (typeof window === 'undefined') {
      return false; // Server-side
    }

    if (process.env.NODE_ENV === 'test') {
      return false;
    }

    if (process.env.NEXT_PUBLIC_USE_MOCK_SERVICES === 'true') {
      return false;
    }

    // Check if at least one analytics service is configured
    const hasPostHog = !!process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const hasMixpanel = !!process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
    const hasHotjar = !!process.env.NEXT_PUBLIC_HOTJAR_ID;

    return hasPostHog || hasMixpanel || hasHotjar;
  }

  initialize(userId?: string): void {
    if (this.isInitialized) {
      return;
    }

    this.providers.forEach(provider => {
      try {
        provider.initialize(userId);
      } catch (error) {
        console.error('Analytics provider initialization failed:', error);
      }
    });

    this.isInitialized = true;

    // Process any queued events
    this.processPendingEvents();
  }

  identify(userId: string, traits?: UserProperties): void {
    if (!this.isInitialized) {
      this.pendingEvents.push({ method: 'identify', args: [userId, traits] });
      return;
    }

    this.providers.forEach(provider => {
      try {
        provider.identify(userId, traits);
      } catch (error) {
        console.error('Analytics provider identify failed:', error);
      }
    });
  }

  track(event: string, properties?: EventProperties): void {
    if (!this.hasConsent) {
      return; // Respect user consent
    }

    if (!this.isInitialized) {
      this.pendingEvents.push({ method: 'track', args: [event, properties] });
      return;
    }

    this.providers.forEach(provider => {
      try {
        provider.track(event, properties);
      } catch (error) {
        console.error('Analytics provider track failed:', error);
        // Don't let analytics failures break the app
      }
    });
  }

  page(name?: string, properties?: EventProperties): void {
    if (!this.hasConsent) {
      return; // Respect user consent
    }

    if (!this.isInitialized) {
      this.pendingEvents.push({ method: 'page', args: [name, properties] });
      return;
    }

    this.providers.forEach(provider => {
      try {
        provider.page(name, properties);
      } catch (error) {
        console.error('Analytics provider page view failed:', error);
      }
    });
  }

  setConsent(hasConsent: boolean): void {
    this.hasConsent = hasConsent;

    this.providers.forEach(provider => {
      try {
        provider.setConsent(hasConsent);
      } catch (error) {
        console.error('Analytics provider set consent failed:', error);
      }
    });

    if (hasConsent && this.isInitialized) {
      this.processPendingEvents();
    } else if (!hasConsent) {
      // Clear pending events if consent is revoked
      this.pendingEvents = [];
    }
  }

  captureError(error: Error, context?: Record<string, any>): void {
    this.providers.forEach(provider => {
      try {
        provider.captureError?.(error, context);
      } catch (err) {
        console.error('Analytics provider capture error failed:', err);
      }
    });
  }

  /**
   * Process events that were queued before initialization
   */
  private processPendingEvents(): void {
    while (this.pendingEvents.length > 0) {
      const event = this.pendingEvents.shift();
      if (!event) continue;

      try {
        switch (event.method) {
          case 'track':
            this.track(event.args[0], event.args[1]);
            break;
          case 'page':
            this.page(event.args[0], event.args[1]);
            break;
          case 'identify':
            this.identify(event.args[0], event.args[1]);
            break;
        }
      } catch (error) {
        console.error('Failed to process pending analytics event:', error);
      }
    }
  }

  /**
   * Get the underlying providers (useful for testing)
   */
  getProviders(): IAnalyticsService[] {
    return this.providers;
  }

  /**
   * Reset all providers (useful for logout)
   */
  reset(): void {
    this.providers.forEach(provider => {
      try {
        if ('reset' in provider && typeof provider.reset === 'function') {
          provider.reset();
        }
      } catch (error) {
        console.error('Analytics provider reset failed:', error);
      }
    });

    this.hasConsent = false;
    this.pendingEvents = [];
  }
}

// Export singleton instance
export const analytics = new AnalyticsManager();

// Re-export types and services for convenience
export type { IAnalyticsService } from './types';
export { AnalyticsProvider } from './types';
export { PostHogService } from './posthog';
export { MixpanelService } from './mixpanel';
export { HotjarService } from './hotjar';
export { VercelAnalyticsService } from './vercel';
export { MockAnalyticsService } from './mock';
