/**
 * Vercel Analytics Service
 * Core Web Vitals monitoring and performance tracking
 */

import { track as vercelTrack } from '@vercel/analytics';
import type { IAnalyticsService } from './types';
import type { EventProperties, UserProperties } from '@meetsolis/shared';

export class VercelAnalyticsService implements IAnalyticsService {
  private hasConsent: boolean = false;
  private isInitialized: boolean = false;

  initialize(userId?: string): void {
    // Vercel Analytics is initialized automatically via the Analytics component
    // No manual initialization needed
    this.isInitialized = true;
    console.log('[Vercel Analytics] Ready (auto-initialized)');
  }

  identify(userId: string, traits?: UserProperties): void {
    // Vercel Analytics doesn't support user identification
    // User data is anonymized by default
    console.log(
      '[Vercel Analytics] User identification not supported (privacy-first)'
    );
  }

  track(event: string, properties?: EventProperties): void {
    if (!this.hasConsent || !this.isInitialized) {
      return;
    }

    try {
      // Filter out undefined values for Vercel Analytics
      const cleanProperties = properties
        ? Object.fromEntries(
            Object.entries(properties).filter(([_, v]) => v !== undefined)
          )
        : undefined;

      vercelTrack(
        event,
        cleanProperties as Record<string, string | number | boolean | null>
      );
    } catch (error) {
      console.error('[Vercel Analytics] Track event failed:', error);
    }
  }

  page(name?: string, properties?: EventProperties): void {
    // Vercel Analytics automatically tracks page views via the Analytics component
    // No manual page tracking needed
  }

  setConsent(hasConsent: boolean): void {
    this.hasConsent = hasConsent;
    // Note: Vercel Analytics doesn't have a consent API
    // We gate tracking calls with the hasConsent flag
  }

  captureError(error: Error, context?: Record<string, any>): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      vercelTrack('error', {
        error_message: error.message,
        error_name: error.name,
        ...context,
      });
    } catch (err) {
      console.error('[Vercel Analytics] Error capture failed:', err);
    }
  }
}
