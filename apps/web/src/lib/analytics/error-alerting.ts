/**
 * Error Alerting and Notifications
 * Real-time error alerts via Slack and email
 */

import * as Sentry from '@sentry/nextjs';
import { isCriticalError, classifyErrorSeverity } from './sentry';
import type { ErrorSeverity } from '@meetsolis/shared';

interface SlackWebhookPayload {
  text: string;
  blocks?: Array<{
    type: string;
    text?: {
      type: string;
      text: string;
    };
    fields?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

/**
 * Configure error alerting with Sentry
 */
export function configureErrorAlerting(): void {
  // Set global context for all errors
  Sentry.configureScope(scope => {
    scope.setContext('application', {
      name: 'MeetSolis',
      environment: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'dev',
      timestamp: new Date().toISOString(),
    });
  });

  // Add global event processor for custom alerting logic
  Sentry.addGlobalEventProcessor((event, hint) => {
    const error = hint.originalException;

    if (error instanceof Error) {
      // Classify error severity
      const severity = classifyErrorSeverity(error);
      event.level = severity as Sentry.SeverityLevel;

      // Trigger immediate alert for critical errors
      if (isCriticalError(error)) {
        event.level = 'fatal';

        // Send critical error alert (non-blocking)
        sendCriticalErrorAlert(error, event).catch(err => {
          console.error('[Error Alerting] Failed to send critical alert:', err);
        });
      }
    }

    return event;
  });

  console.log('[Error Alerting] Configured successfully');
}

/**
 * Send critical error alert to Slack
 */
async function sendCriticalErrorAlert(
  error: Error,
  sentryEvent: Sentry.Event
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('[Error Alerting] Slack webhook not configured');
    return;
  }

  const payload: SlackWebhookPayload = {
    text: '🚨 Critical Error in MeetSolis',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 Critical Error Detected',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Environment:*\n${process.env.NODE_ENV}`,
          },
          {
            type: 'mrkdwn',
            text: `*Version:*\n${process.env.NEXT_PUBLIC_APP_VERSION || 'dev'}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Error:*\n${error.name}: ${error.message}`,
          },
          {
            type: 'mrkdwn',
            text: `*Timestamp:*\n${new Date().toISOString()}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Stack Trace:*\n\`\`\`${error.stack?.substring(0, 500) || 'N/A'}\`\`\``,
        },
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }

    console.log('[Error Alerting] Critical alert sent to Slack');
  } catch (err) {
    console.error('[Error Alerting] Failed to send Slack notification:', err);
    // Don't throw - alerting failures shouldn't break error tracking
  }
}

/**
 * Monitor error rate and send alerts if threshold exceeded
 */
class ErrorRateMonitor {
  private errorCount: number = 0;
  private windowStart: number = Date.now();
  private readonly WINDOW_SIZE_MS = 60000; // 1 minute
  private readonly THRESHOLD = 10; // 10 errors per minute
  private alertSent: boolean = false;

  recordError(): void {
    const now = Date.now();

    // Reset window if it's expired
    if (now - this.windowStart > this.WINDOW_SIZE_MS) {
      this.errorCount = 0;
      this.windowStart = now;
      this.alertSent = false;
    }

    this.errorCount++;

    // Check if threshold exceeded
    if (this.errorCount >= this.THRESHOLD && !this.alertSent) {
      this.sendErrorRateAlert();
      this.alertSent = true;
    }
  }

  private async sendErrorRateAlert(): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      return;
    }

    const payload: SlackWebhookPayload = {
      text: '⚠️ High Error Rate Detected',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '⚠️ High Error Rate Alert',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Error rate threshold exceeded: *${this.errorCount} errors* in the last minute (threshold: ${this.THRESHOLD})`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Environment:*\n${process.env.NODE_ENV}`,
            },
            {
              type: 'mrkdwn',
              text: `*Timestamp:*\n${new Date().toISOString()}`,
            },
          ],
        },
      ],
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[Error Alerting] Error rate alert sent to Slack');
    } catch (err) {
      console.error('[Error Alerting] Failed to send error rate alert:', err);
    }
  }

  getErrorCount(): number {
    return this.errorCount;
  }

  reset(): void {
    this.errorCount = 0;
    this.windowStart = Date.now();
    this.alertSent = false;
  }
}

// Export singleton instance
export const errorRateMonitor = new ErrorRateMonitor();

/**
 * Monitor API performance and alert if degraded
 */
export async function checkApiPerformance(
  route: string,
  duration: number
): Promise<void> {
  const SLOW_API_THRESHOLD = 500; // ms

  if (duration > SLOW_API_THRESHOLD) {
    // Log slow API warning
    console.warn(`[Performance] Slow API route: ${route} (${duration}ms)`);

    // Send alert if multiple slow requests
    if (duration > SLOW_API_THRESHOLD * 2) {
      await sendPerformanceAlert(route, duration);
    }
  }
}

/**
 * Send performance degradation alert
 */
async function sendPerformanceAlert(
  route: string,
  duration: number
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  const payload: SlackWebhookPayload = {
    text: '🐌 Performance Degradation Detected',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🐌 Slow API Response',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Route:*\n${route}`,
          },
          {
            type: 'mrkdwn',
            text: `*Duration:*\n${duration}ms`,
          },
        ],
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[Error Alerting] Failed to send performance alert:', err);
  }
}

/**
 * Create uptime check (to be called periodically)
 */
export async function performUptimeCheck(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      cache: 'no-cache',
    });

    return response.ok;
  } catch (error) {
    console.error('[Uptime Check] Health check failed:', error);
    return false;
  }
}
