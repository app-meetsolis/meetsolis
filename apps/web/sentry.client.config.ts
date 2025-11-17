/**
 * Sentry Client Configuration
 * Error tracking and performance monitoring for client-side code
 *
 * This file is automatically loaded by @sentry/nextjs when the app runs in the browser.
 * It initializes Sentry for client-side error tracking and performance monitoring.
 */

import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry if DSN is provided
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    // DSN from environment variable
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Environment (development, staging, production)
    environment: process.env.NODE_ENV || 'development',

    // Performance monitoring - capture 100% of transactions in development, 10% in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Debug mode - enable in development for troubleshooting
    debug: process.env.NODE_ENV === 'development',

    // Enable Session Replay for user behavior tracking (optional)
    // Adjust sample rate based on your needs and Sentry quota
    replaysSessionSampleRate: 0.1, // Capture 10% of all sessions
    replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors

    // Integrations
    integrations: [
      // Browser Tracing for performance monitoring
      new Sentry.BrowserTracing({
        // Enable tracing for specific route patterns
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/.*\.vercel\.app/,
          /^https:\/\/meetsolis\.com/,
        ],
      }),
      // Session Replay for debugging user interactions
      new Sentry.Replay({
        // Mask all text and input fields by default for privacy
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Custom error filtering
    beforeSend(event, hint) {
      // Filter out errors from browser extensions
      if (event.exception) {
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'message' in error) {
          const message = String(error.message);
          // Ignore common browser extension errors
          if (
            message.includes('chrome-extension://') ||
            message.includes('moz-extension://') ||
            message.includes('safari-extension://')
          ) {
            return null;
          }
        }
      }

      return event;
    },

    // Custom tags for all events
    initialScope: {
      tags: {
        app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      },
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser-specific errors that are not actionable
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Network errors that are expected
      'NetworkError',
      'Failed to fetch',
    ],

    // Enable capturing unhandled promise rejections
    autoSessionTracking: true,

    // Send client reports (meta information about SDK usage)
    sendClientReports: true,
  });
} else {
  console.warn(
    'Sentry client-side monitoring is disabled. Set NEXT_PUBLIC_SENTRY_DSN to enable error tracking.'
  );
}
