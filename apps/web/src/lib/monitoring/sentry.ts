/**
 * Sentry Integration
 * Error tracking and performance monitoring
 */

import * as Sentry from '@sentry/nextjs';

export interface WebRTCErrorContext {
  meetingId: string;
  userId: string;
  errorCode?: string;
  connectionState?: string;
  iceConnectionState?: string;
}

/**
 * Log WebRTC error to Sentry
 */
export function logWebRTCError(error: Error, context: WebRTCErrorContext) {
  Sentry.captureException(error, {
    tags: {
      component: 'webrtc',
      meeting_id: context.meetingId,
    },
    contexts: {
      webrtc: {
        ...context,
      },
    },
    level: 'error',
  });
}

/**
 * Log connection quality metrics to Sentry
 */
export function logConnectionQuality(
  quality: string,
  stats: {
    rtt: number;
    packetLoss: number;
    jitter: number;
  },
  meetingId: string
) {
  Sentry.addBreadcrumb({
    category: 'webrtc',
    message: `Connection quality: ${quality}`,
    level: quality === 'poor' ? 'warning' : 'info',
    data: {
      meeting_id: meetingId,
      ...stats,
    },
  });
}

/**
 * Track meeting start performance
 */
export function trackMeetingStart(meetingId: string, duration: number) {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: 'Meeting started',
    level: 'info',
    data: {
      meeting_id: meetingId,
      connection_duration_ms: duration,
    },
  });
}

/**
 * Track ICE candidate gathering timeout
 */
export function trackICETimeout(meetingId: string, duration: number) {
  Sentry.captureMessage('ICE candidate gathering timeout', {
    level: 'warning',
    tags: {
      component: 'webrtc',
      meeting_id: meetingId,
    },
    contexts: {
      performance: {
        timeout_duration_ms: duration,
      },
    },
  });
}

/**
 * Set user context for Sentry
 */
export function setUserContext(
  userId: string,
  email?: string,
  username?: string
) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context
 */
export function clearUserContext() {
  Sentry.setUser(null);
}
