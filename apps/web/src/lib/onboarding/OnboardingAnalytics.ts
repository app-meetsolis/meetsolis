/**
 * Onboarding Analytics
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

import { OnboardingMetrics } from '@/types/onboarding';

export class OnboardingAnalytics {
  private startTime: number;
  private stepTimes: Map<string, { start: number; end?: number }>;

  constructor() {
    this.startTime = Date.now();
    this.stepTimes = new Map();
  }

  /**
   * Track step completion
   */
  trackStepCompletion(step: string, timeSpent: number): void {
    if (typeof window === 'undefined') return;

    try {
      // Send analytics event
      this.sendEvent('onboarding_step_completed', {
        step,
        time_spent_ms: timeSpent,
        timestamp: Date.now()
      });

      // Update local metrics
      const metrics = this.getMetrics();
      metrics.stepCompletionRates[step] = (metrics.stepCompletionRates[step] || 0) + 1;
      this.saveMetrics(metrics);
    } catch (error) {
      console.error('Failed to track step completion:', error);
    }
  }

  /**
   * Track drop-off point
   */
  trackDropOff(step: string, reason?: string): void {
    if (typeof window === 'undefined') return;

    try {
      this.sendEvent('onboarding_drop_off', {
        step,
        reason: reason || 'unknown',
        timestamp: Date.now()
      });

      const metrics = this.getMetrics();
      if (!metrics.dropOffPoints.includes(step)) {
        metrics.dropOffPoints.push(step);
      }
      this.saveMetrics(metrics);
    } catch (error) {
      console.error('Failed to track drop-off:', error);
    }
  }

  /**
   * Track success metrics
   */
  trackSuccessMetrics(userId: string, timeToFirstMeeting: number): void {
    if (typeof window === 'undefined') return;

    try {
      this.sendEvent('onboarding_completed', {
        user_id: userId,
        time_to_first_meeting_ms: timeToFirstMeeting,
        total_time_ms: Date.now() - this.startTime,
        timestamp: Date.now()
      });

      const metrics = this.getMetrics();
      metrics.timeToValue = timeToFirstMeeting;
      this.saveMetrics(metrics);
    } catch (error) {
      console.error('Failed to track success metrics:', error);
    }
  }

  /**
   * Start tracking a step
   */
  startStep(step: string): void {
    this.stepTimes.set(step, { start: Date.now() });
  }

  /**
   * End tracking a step
   */
  endStep(step: string): void {
    const stepTime = this.stepTimes.get(step);
    if (stepTime) {
      stepTime.end = Date.now();
      const timeSpent = stepTime.end - stepTime.start;
      this.trackStepCompletion(step, timeSpent);
    }
  }

  /**
   * Track device issue
   */
  trackDeviceIssue(deviceType: 'camera' | 'microphone' | 'speakers', error: string): void {
    if (typeof window === 'undefined') return;

    try {
      this.sendEvent('device_issue', {
        device_type: deviceType,
        error_message: error,
        timestamp: Date.now()
      });

      const metrics = this.getMetrics();
      metrics.deviceIssuesEncountered[deviceType] =
        (metrics.deviceIssuesEncountered[deviceType] || 0) + 1;
      this.saveMetrics(metrics);
    } catch (error) {
      console.error('Failed to track device issue:', error);
    }
  }

  /**
   * Track user satisfaction score
   */
  trackSatisfactionScore(score: number): void {
    if (typeof window === 'undefined') return;

    try {
      this.sendEvent('satisfaction_score', {
        score,
        timestamp: Date.now()
      });

      const metrics = this.getMetrics();
      metrics.userSatisfactionScore = score;
      this.saveMetrics(metrics);
    } catch (error) {
      console.error('Failed to track satisfaction score:', error);
    }
  }

  /**
   * Send analytics event
   */
  private sendEvent(eventName: string, properties: Record<string, any>): void {
    // Check if analytics is enabled
    const analyticsEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
    if (!analyticsEnabled) return;

    // Send to analytics service (PostHog, etc.)
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture(eventName, properties);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventName, properties);
    }
  }

  /**
   * Get current metrics
   */
  private getMetrics(): OnboardingMetrics {
    if (typeof window === 'undefined') {
      return this.getDefaultMetrics();
    }

    try {
      const stored = localStorage.getItem('onboarding_metrics');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to get metrics:', error);
    }

    return this.getDefaultMetrics();
  }

  /**
   * Save metrics
   */
  private saveMetrics(metrics: OnboardingMetrics): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_metrics', JSON.stringify(metrics));
    }
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): OnboardingMetrics {
    return {
      stepCompletionRates: {},
      dropOffPoints: [],
      timeToValue: 0,
      supportTicketsGenerated: 0,
      userSatisfactionScore: 0,
      deviceIssuesEncountered: {}
    };
  }

  /**
   * Get completion funnel
   */
  getFunnelAnalysis(): { step: string; completionRate: number }[] {
    const metrics = this.getMetrics();
    const steps = ['welcome', 'permissions', 'profile', 'first-meeting'];

    return steps.map(step => ({
      step,
      completionRate: metrics.stepCompletionRates[step] || 0
    }));
  }

  /**
   * Clear analytics data
   */
  clearData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboarding_metrics');
    }
    this.stepTimes.clear();
  }
}
