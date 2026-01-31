/**
 * Sentry Error Tracking Enhancement
 * Advanced error tracking with custom contexts and performance monitoring
 */

import * as Sentry from '@sentry/nextjs';
import type { ErrorContext, ErrorSeverity } from '@meetsolis/shared';

/**
 * Initialize Sentry with enhanced configuration
 */
export function initializeSentry(): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry is optional - skip initialization if DSN not configured
    return;
  }

  // Sentry is initialized automatically by Next.js via sentry.client.config.ts
  // We only set additional context here.

  /*
  Sentry.init({
    ... moved to sentry.client.config.ts ...
  });
  */

  // Set default context
  Sentry.setContext('application', {
    name: 'MeetSolis',
    environment: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION || 'dev',
  });

  console.log('[Sentry] Initialized successfully');
}

/**
 * Capture an error with enhanced context
 */
export function captureError(
  error: Error,
  context?: ErrorContext,
  severity: ErrorSeverity = 'error' as ErrorSeverity
): string {
  return Sentry.captureException(error, {
    level: severity as Sentry.SeverityLevel,
    contexts: {
      custom: context,
    },
    tags: {
      userId: context?.userId,
      meetingId: context?.meetingId,
      route: context?.route,
    },
  });
}

/**
 * Add breadcrumb for user action tracking
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(
  userId: string,
  email?: string,
  userData?: Record<string, any>
): void {
  Sentry.setUser({
    id: userId,
    email,
    ...userData,
  });
}

/**
 * Clear user context (useful for logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Add custom context for errors
 */
export function setCustomContext(
  name: string,
  context: Record<string, any>
): void {
  Sentry.setContext(name, context);
}

/**
 * Start a performance transaction
 */
export function startTransaction(
  name: string,
  op: string
): ReturnType<typeof Sentry.startTransaction> {
  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Capture a message (non-error event)
 */
export function captureMessage(
  message: string,
  level: ErrorSeverity = 'info' as ErrorSeverity
): string {
  return Sentry.captureMessage(message, level as Sentry.SeverityLevel);
}

/**
 * Check if error is critical and requires immediate alerting
 */
export function isCriticalError(error: Error): boolean {
  const criticalPatterns = [
    /payment/i,
    /database/i,
    /authentication/i,
    /auth/i,
    /security/i,
    /data loss/i,
    /corruption/i,
  ];

  return criticalPatterns.some(
    pattern => pattern.test(error.message) || pattern.test(error.name)
  );
}

/**
 * Classify error severity
 */
export function classifyErrorSeverity(error: Error): ErrorSeverity {
  if (isCriticalError(error)) {
    return 'fatal' as ErrorSeverity;
  }

  // Network errors are usually warnings
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return 'warning' as ErrorSeverity;
  }

  // Default to error
  return 'error' as ErrorSeverity;
}
