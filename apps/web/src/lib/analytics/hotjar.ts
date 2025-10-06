/**
 * Hotjar Analytics Service
 * Heatmaps and session recordings for user behavior analysis
 */

import type { IAnalyticsService } from './types';
import type { EventProperties, UserProperties } from '@meetsolis/shared';

declare global {
  interface Window {
    hj?: (...args: any[]) => void;
    _hjSettings?: {
      hjid: number;
      hjsv: number;
    };
  }
}

export class HotjarService implements IAnalyticsService {
  private hasConsent: boolean = false;
  private isInitialized: boolean = false;

  initialize(userId?: string): void {
    if (typeof window === 'undefined') {
      return; // Server-side, skip initialization
    }

    if (this.isInitialized) {
      return; // Already initialized
    }

    const siteId = process.env.NEXT_PUBLIC_HOTJAR_ID;
    const snippetVersion = process.env.NEXT_PUBLIC_HOTJAR_SV || '6';

    if (!siteId) {
      console.warn('[Hotjar] Site ID not configured, skipping initialization');
      return;
    }

    try {
      // Inject Hotjar script
      (function (h: any, o: any, t: string, j: string, a?: any, r?: any) {
        h.hj =
          h.hj ||
          function () {
            (h.hj.q = h.hj.q || []).push(arguments);
          };
        h._hjSettings = {
          hjid: parseInt(siteId),
          hjsv: parseInt(snippetVersion),
        };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script');
        r.async = 1;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
      })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');

      if (userId) {
        this.identify(userId);
      }

      this.isInitialized = true;
      console.log('[Hotjar] Initialized successfully');
    } catch (error) {
      console.error('[Hotjar] Initialization failed:', error);
    }
  }

  identify(userId: string, traits?: UserProperties): void {
    if (!this.isInitialized || typeof window === 'undefined' || !window.hj) {
      return;
    }

    try {
      window.hj('identify', userId, traits);
    } catch (error) {
      console.error('[Hotjar] Identify failed:', error);
    }
  }

  track(event: string, properties?: EventProperties): void {
    if (
      !this.hasConsent ||
      !this.isInitialized ||
      typeof window === 'undefined' ||
      !window.hj
    ) {
      return;
    }

    try {
      window.hj('event', event);
    } catch (error) {
      console.error('[Hotjar] Track event failed:', error);
    }
  }

  page(name?: string, properties?: EventProperties): void {
    if (
      !this.hasConsent ||
      !this.isInitialized ||
      typeof window === 'undefined' ||
      !window.hj
    ) {
      return;
    }

    try {
      window.hj('stateChange', name || window.location.pathname);
    } catch (error) {
      console.error('[Hotjar] Page view failed:', error);
    }
  }

  setConsent(hasConsent: boolean): void {
    this.hasConsent = hasConsent;

    if (typeof window === 'undefined' || !this.isInitialized || !window.hj) {
      return;
    }

    try {
      if (!hasConsent) {
        // Stop recording and tracking
        window.hj('consent', 'revoke');
      } else {
        window.hj('consent', 'grant');
      }
    } catch (error) {
      console.error('[Hotjar] Set consent failed:', error);
    }
  }

  /**
   * Tag a session with a custom label (Hotjar-specific)
   */
  tagRecording(tags: string[]): void {
    if (!this.isInitialized || typeof window === 'undefined' || !window.hj) {
      return;
    }

    try {
      tags.forEach(tag => {
        window.hj?.('tagRecording', [tag]);
      });
    } catch (error) {
      console.error('[Hotjar] Tag recording failed:', error);
    }
  }

  /**
   * Trigger a poll or survey (Hotjar-specific)
   */
  triggerPoll(pollId: string): void {
    if (!this.isInitialized || typeof window === 'undefined' || !window.hj) {
      return;
    }

    try {
      window.hj('trigger', pollId);
    } catch (error) {
      console.error('[Hotjar] Trigger poll failed:', error);
    }
  }

  /**
   * Set user attributes for filtering recordings (Hotjar-specific)
   */
  setUserAttributes(
    attributes: Record<string, string | number | boolean>
  ): void {
    if (!this.isInitialized || typeof window === 'undefined' || !window.hj) {
      return;
    }

    try {
      Object.entries(attributes).forEach(([key, value]) => {
        window.hj?.('identify', null, { [key]: value });
      });
    } catch (error) {
      console.error('[Hotjar] Set user attributes failed:', error);
    }
  }
}
