export const SERVICE_TIMEOUTS = {
  DEFAULT: 5000,
  AUTH: 3000,
  DATABASE: 10000,
  AI: 30000,
  TRANSLATION: 5000,
  SMS: 10000,
  ANALYTICS: 2000,
  ERROR_TRACKING: 2000,
  CALENDAR: 5000,
} as const;

export const CIRCUIT_BREAKER_CONFIG = {
  FAILURE_THRESHOLD: 5,
  RESET_TIMEOUT: 60000, // 1 minute
  RETRY_ATTEMPTS: 3,
  BACKOFF_MULTIPLIER: 2,
} as const;

export const SERVICE_NAMES = {
  AUTH: 'clerk',
  DATABASE: 'supabase',
  AI: 'openai',
  TRANSLATION: 'deepl',
  SMS: 'twilio',
  ANALYTICS: 'posthog',
  ERROR_TRACKING: 'sentry',
  CALENDAR: 'google-calendar',
} as const;

export const HEALTH_CHECK_INTERVALS = {
  FAST: 30000, // 30 seconds
  NORMAL: 60000, // 1 minute
  SLOW: 300000, // 5 minutes
} as const;