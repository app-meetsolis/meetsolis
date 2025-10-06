/**
 * Mock Analytics Service
 * Used for development and testing environments
 */

import type { IAnalyticsService } from './types';
import type { EventProperties, UserProperties } from '@meetsolis/shared';

interface TrackedEvent {
  event: string;
  properties?: EventProperties;
  timestamp: Date;
}

interface IdentifiedUser {
  userId: string;
  traits?: UserProperties;
  timestamp: Date;
}

export class MockAnalyticsService implements IAnalyticsService {
  private events: TrackedEvent[] = [];
  private identifications: IdentifiedUser[] = [];
  private hasConsent: boolean = false;
  private isInitialized: boolean = false;

  initialize(userId?: string): void {
    this.isInitialized = true;
    console.log(
      '[MOCK ANALYTICS] Initialized',
      userId ? `with user: ${userId}` : ''
    );

    if (userId) {
      this.identify(userId);
    }
  }

  identify(userId: string, traits?: UserProperties): void {
    this.identifications.push({
      userId,
      traits,
      timestamp: new Date(),
    });
    console.log('[MOCK ANALYTICS] Identify:', userId, traits);
  }

  track(event: string, properties?: EventProperties): void {
    if (!this.hasConsent) {
      console.log('[MOCK ANALYTICS] Event blocked (no consent):', event);
      return;
    }

    this.events.push({
      event,
      properties,
      timestamp: new Date(),
    });
    console.log('[MOCK ANALYTICS] Track:', event, properties);
  }

  page(name?: string, properties?: EventProperties): void {
    if (!this.hasConsent) {
      console.log('[MOCK ANALYTICS] Page view blocked (no consent):', name);
      return;
    }

    this.events.push({
      event: '$pageview',
      properties: { page: name, ...properties },
      timestamp: new Date(),
    });
    console.log('[MOCK ANALYTICS] Page view:', name, properties);
  }

  setConsent(hasConsent: boolean): void {
    this.hasConsent = hasConsent;
    console.log('[MOCK ANALYTICS] Consent updated:', hasConsent);
  }

  captureError(error: Error, context?: Record<string, any>): void {
    console.log('[MOCK ANALYTICS] Error captured:', error.message, context);
  }

  // Test helpers - not part of IAnalyticsService interface
  getTrackedEvents(): TrackedEvent[] {
    return this.events;
  }

  getIdentifications(): IdentifiedUser[] {
    return this.identifications;
  }

  clearEvents(): void {
    this.events = [];
  }

  clearIdentifications(): void {
    this.identifications = [];
  }

  reset(): void {
    this.events = [];
    this.identifications = [];
    this.hasConsent = false;
    this.isInitialized = false;
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  getHasConsent(): boolean {
    return this.hasConsent;
  }
}
