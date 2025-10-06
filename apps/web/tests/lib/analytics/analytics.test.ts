/**
 * Analytics Manager Tests
 * Tests for the unified analytics orchestrator
 */

// Mock Vercel Analytics
jest.mock('@vercel/analytics', () => ({
  track: jest.fn(),
}));

// Mock PostHog
jest.mock('posthog-js', () => ({
  default: {
    init: jest.fn(),
    capture: jest.fn(),
    identify: jest.fn(),
    opt_in_capturing: jest.fn(),
    opt_out_capturing: jest.fn(),
    people: {
      set: jest.fn(),
    },
  },
}));

// Mock Mixpanel
jest.mock('mixpanel-browser', () => ({
  default: {
    init: jest.fn(),
    identify: jest.fn(),
    track: jest.fn(),
    track_pageview: jest.fn(),
    opt_in_tracking: jest.fn(),
    opt_out_tracking: jest.fn(),
    people: {
      set: jest.fn(),
      set_once: jest.fn(),
      track_charge: jest.fn(),
      increment: jest.fn(),
    },
    register: jest.fn(),
    reset: jest.fn(),
  },
}));

import { AnalyticsManager, MockAnalyticsService } from '@/lib/analytics';
import type { EventProperties, UserProperties } from '@meetsolis/shared';

describe('AnalyticsManager', () => {
  let analytics: AnalyticsManager;
  let mockService: MockAnalyticsService;

  beforeEach(() => {
    // Force use of mock services
    process.env.NEXT_PUBLIC_USE_MOCK_SERVICES = 'true';
    analytics = new AnalyticsManager();
    mockService = analytics.getProviders()[0] as MockAnalyticsService;
  });

  afterEach(() => {
    analytics.reset();
    mockService.reset();
  });

  describe('Initialization', () => {
    it('should initialize analytics manager', () => {
      expect(analytics).toBeDefined();
      expect(analytics.getProviders()).toHaveLength(1);
    });

    it('should initialize with user ID', () => {
      const userId = 'test-user-123';
      analytics.initialize(userId);

      const identifications = mockService.getIdentifications();
      expect(identifications).toHaveLength(1);
      expect(identifications[0].userId).toBe(userId);
    });

    it('should use mock service in development', () => {
      expect(mockService).toBeInstanceOf(MockAnalyticsService);
    });
  });

  describe('User Identification', () => {
    beforeEach(() => {
      analytics.initialize();
    });

    it('should identify user with ID only', () => {
      const userId = 'user-456';
      analytics.identify(userId);

      const identifications = mockService.getIdentifications();
      expect(identifications).toHaveLength(1);
      expect(identifications[0].userId).toBe(userId);
    });

    it('should identify user with traits', () => {
      const userId = 'user-789';
      const traits: UserProperties = {
        userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      };

      analytics.identify(userId, traits);

      const identifications = mockService.getIdentifications();
      expect(identifications[0].traits).toEqual(traits);
    });
  });

  describe('Event Tracking', () => {
    beforeEach(() => {
      analytics.initialize();
      analytics.setConsent(true);
    });

    it('should track events with consent', () => {
      analytics.track('test_event', { foo: 'bar' });

      const events = mockService.getTrackedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('test_event');
      expect(events[0].properties).toEqual({ foo: 'bar' });
    });

    it('should not track events without consent', () => {
      analytics.setConsent(false);
      analytics.track('blocked_event');

      const events = mockService.getTrackedEvents();
      expect(events).toHaveLength(0);
    });

    it('should track multiple events', () => {
      analytics.track('event_1');
      analytics.track('event_2');
      analytics.track('event_3');

      const events = mockService.getTrackedEvents();
      expect(events).toHaveLength(3);
    });

    it('should track events with properties', () => {
      const properties: EventProperties = {
        category: 'meeting',
        action: 'created',
        value: 100,
      };

      analytics.track('meeting_created', properties);

      const events = mockService.getTrackedEvents();
      expect(events[0].properties).toEqual(properties);
    });
  });

  describe('Page View Tracking', () => {
    beforeEach(() => {
      analytics.initialize();
      analytics.setConsent(true);
    });

    it('should track page views', () => {
      analytics.page('/dashboard');

      const events = mockService.getTrackedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('$pageview');
    });

    it('should track page views with properties', () => {
      analytics.page('/analytics', {
        title: 'Analytics Dashboard',
        referrer: '/dashboard',
      });

      const events = mockService.getTrackedEvents();
      expect(events[0].properties).toMatchObject({
        page: '/analytics',
        title: 'Analytics Dashboard',
      });
    });

    it('should not track page views without consent', () => {
      analytics.setConsent(false);
      analytics.page('/dashboard');

      const events = mockService.getTrackedEvents();
      expect(events).toHaveLength(0);
    });
  });

  describe('Consent Management', () => {
    beforeEach(() => {
      analytics.initialize();
    });

    it('should respect consent when set to true', () => {
      analytics.setConsent(true);
      analytics.track('consented_event');

      const events = mockService.getTrackedEvents();
      expect(events).toHaveLength(1);
    });

    it('should block tracking when consent is false', () => {
      analytics.setConsent(false);
      analytics.track('blocked_event');

      const events = mockService.getTrackedEvents();
      expect(events).toHaveLength(0);
    });

    it('should clear pending events when consent is revoked', () => {
      analytics.track('queued_event'); // Tracked before initialization
      analytics.setConsent(false);

      const events = mockService.getTrackedEvents();
      expect(events).toHaveLength(0);
    });
  });

  describe('Error Capture', () => {
    beforeEach(() => {
      analytics.initialize();
    });

    it('should capture errors', () => {
      const error = new Error('Test error');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      analytics.captureError(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[MOCK ANALYTICS] Error captured:',
        'Test error',
        undefined
      );

      consoleSpy.mockRestore();
    });

    it('should capture errors with context', () => {
      const error = new Error('Database error');
      const context = {
        userId: 'user-123',
        route: '/api/meetings',
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      analytics.captureError(error, context);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[MOCK ANALYTICS] Error captured:',
        'Database error',
        context
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Reset', () => {
    beforeEach(() => {
      analytics.initialize();
      analytics.setConsent(true);
    });

    it('should reset analytics state', () => {
      analytics.identify('user-123');
      analytics.track('test_event');

      analytics.reset();

      expect(mockService.getIsInitialized()).toBe(false);
      expect(mockService.getHasConsent()).toBe(false);
      expect(mockService.getTrackedEvents()).toHaveLength(0);
    });
  });

  describe('Pending Events', () => {
    it('should queue events before initialization', () => {
      const newAnalytics = new AnalyticsManager();
      newAnalytics.setConsent(true);
      newAnalytics.track('early_event');

      // Event should be queued
      const provider = newAnalytics.getProviders()[0] as MockAnalyticsService;
      expect(provider.getTrackedEvents()).toHaveLength(0);

      // Initialize - should process queued events
      newAnalytics.initialize();

      expect(provider.getTrackedEvents()).toHaveLength(1);
      expect(provider.getTrackedEvents()[0].event).toBe('early_event');
    });

    it('should process identify calls queued before initialization', () => {
      const newAnalytics = new AnalyticsManager();
      newAnalytics.identify('queued-user');

      newAnalytics.initialize();

      const provider = newAnalytics.getProviders()[0] as MockAnalyticsService;
      expect(provider.getIdentifications()).toHaveLength(1);
    });
  });
});
