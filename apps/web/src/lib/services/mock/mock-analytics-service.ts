import {
  AnalyticsService,
  ServiceStatus,
  ServiceInfo,
} from '@meetsolis/shared';
import { BaseService } from '../base-service';

interface AnalyticsEvent {
  id: string;
  event: string;
  properties: any;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

interface UserProfile {
  userId: string;
  traits: any;
  lastSeen: Date;
  eventCount: number;
}

export class MockAnalyticsService
  extends BaseService
  implements AnalyticsService
{
  private events: AnalyticsEvent[] = [];
  private users: Map<string, UserProfile> = new Map();
  private sessionId: string;
  private eventCounter = 0;

  constructor() {
    super();
    this.enableFallbackMode();
    this.sessionId = `mock-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getServiceInfo(): ServiceInfo {
    return {
      name: 'Mock Analytics Service',
      version: '1.0.0',
      description:
        'Mock analytics service with console logging and event validation',
      dependencies: [],
    };
  }

  protected async performHealthCheck(): Promise<ServiceStatus> {
    await new Promise(resolve => setTimeout(resolve, 40));

    return {
      status: 'healthy',
      responseTime: 40,
      lastCheck: new Date(),
      errorCount: 0,
    };
  }

  async track(event: string, properties?: any): Promise<void> {
    console.log(`[MockAnalyticsService] Tracking event: ${event}`, properties);

    this.eventCounter++;

    // Validate event name
    if (!event || typeof event !== 'string') {
      throw new Error('Event name must be a non-empty string');
    }

    // Validate properties
    if (properties && typeof properties !== 'object') {
      throw new Error('Event properties must be an object');
    }

    // Simulate tracking delay
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

    const analyticsEvent: AnalyticsEvent = {
      id: `event-${this.eventCounter}`,
      event,
      properties: properties || {},
      timestamp: new Date(),
      sessionId: this.sessionId,
    };

    this.events.push(analyticsEvent);

    // Console output for development visibility
    console.log(`📊 Analytics Event: ${event}`);
    if (properties) {
      console.log(`   Properties:`, JSON.stringify(properties, null, 2));
    }
    console.log(`   Session: ${this.sessionId}`);
    console.log(`   Event ID: ${analyticsEvent.id}`);

    // Update session stats
    this.updateSessionStats(analyticsEvent);
  }

  async identify(userId: string, traits?: any): Promise<void> {
    console.log(`[MockAnalyticsService] Identifying user: ${userId}`, traits);

    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }

    // Simulate identification delay
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 70));

    const existingUser = this.users.get(userId);
    const userProfile: UserProfile = {
      userId,
      traits: { ...(existingUser?.traits || {}), ...(traits || {}) },
      lastSeen: new Date(),
      eventCount: existingUser?.eventCount || 0,
    };

    this.users.set(userId, userProfile);

    // Update all future events in this session with user ID
    this.events.forEach(event => {
      if (event.sessionId === this.sessionId && !event.userId) {
        event.userId = userId;
      }
    });

    // Console output for development visibility
    console.log(`👤 User Identified: ${userId}`);
    if (traits) {
      console.log(`   Traits:`, JSON.stringify(traits, null, 2));
    }
    console.log(`   Profile updated for session: ${this.sessionId}`);
  }

  private updateSessionStats(event: AnalyticsEvent): void {
    if (event.userId) {
      const user = this.users.get(event.userId);
      if (user) {
        user.eventCount++;
        user.lastSeen = event.timestamp;
      }
    }
  }

  // Mock-specific methods
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getEventsByType(eventType: string): AnalyticsEvent[] {
    return this.events.filter(event => event.event === eventType);
  }

  getEventsByUser(userId: string): AnalyticsEvent[] {
    return this.events.filter(event => event.userId === userId);
  }

  getEventsBySession(sessionId?: string): AnalyticsEvent[] {
    const targetSessionId = sessionId || this.sessionId;
    return this.events.filter(event => event.sessionId === targetSessionId);
  }

  getUserProfile(userId: string): UserProfile | undefined {
    return this.users.get(userId);
  }

  getAllUsers(): UserProfile[] {
    return Array.from(this.users.values());
  }

  getSessionId(): string {
    return this.sessionId;
  }

  clearEvents(): void {
    this.events = [];
    this.eventCounter = 0;
  }

  clearUsers(): void {
    this.users.clear();
  }

  clearAll(): void {
    this.clearEvents();
    this.clearUsers();
    this.sessionId = `mock-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getAnalytics(): {
    totalEvents: number;
    uniqueUsers: number;
    sessionsToday: number;
    topEvents: Array<{ event: string; count: number }>;
  } {
    const eventCounts = new Map<string, number>();
    this.events.forEach(event => {
      eventCounts.set(event.event, (eventCounts.get(event.event) || 0) + 1);
    });

    const topEvents = Array.from(eventCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([event, count]) => ({ event, count }));

    const today = new Date().toDateString();
    const sessionsToday = new Set(
      this.events
        .filter(event => event.timestamp.toDateString() === today)
        .map(event => event.sessionId)
    ).size;

    return {
      totalEvents: this.events.length,
      uniqueUsers: this.users.size,
      sessionsToday,
      topEvents,
    };
  }

  // Utility methods for testing
  simulateEventError(): void {
    throw new Error('Mock analytics service error for testing');
  }

  exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }

  importEvents(eventsJson: string): void {
    try {
      const events = JSON.parse(eventsJson);
      this.events = events;
      console.log(`[MockAnalyticsService] Imported ${events.length} events`);
    } catch (error) {
      throw new Error('Invalid events JSON format');
    }
  }
}
