/**
 * Sentry Server Configuration
 * Error tracking and performance monitoring for server-side code
 *
 * This file is automatically loaded by @sentry/nextjs for server-side code (API routes, SSR, etc.).
 * It initializes Sentry for server-side error tracking and performance monitoring.
 */

import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    // DSN from environment variable (use SENTRY_DSN for server-side, not NEXT_PUBLIC_SENTRY_DSN)
    dsn: process.env.SENTRY_DSN,

    // Environment (development, staging, production)
    environment: process.env.NODE_ENV || 'development',

    // Performance monitoring - capture 100% of transactions in development, 10% in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Debug mode - enable in development for troubleshooting
    debug: process.env.NODE_ENV === 'development',

    // Custom error filtering
    beforeSend(event, hint) {
      // Don't send errors in development to reduce noise
      if (process.env.NODE_ENV === 'development') {
        // Log to console instead
        console.error('Sentry Error:', hint.originalException || event);
        // Uncomment the line below to send errors even in development
        // return event;
        return null;
      }

      return event;
    },

    // Custom tags for all events
    initialScope: {
      tags: {
        app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        runtime: 'server',
      },
    },

    // Ignore specific errors
    ignoreErrors: [
      // Expected errors that should not be tracked
      'ECONNREFUSED',
      'ETIMEDOUT',
      // Database connection errors that are handled
      'Connection terminated unexpectedly',
    ],

    // Enable capturing unhandled promise rejections
    autoSessionTracking: true,

    // Send server reports
    sendClientReports: true,

    // Additional server-specific configuration
    integrations: [
      // HTTP integration for tracking outgoing requests
      new Sentry.Integrations.Http({ tracing: true }),
    ],
  });
} else {
  console.warn(
    'Sentry server-side monitoring is disabled. Set SENTRY_DSN to enable error tracking.'
  );
}
