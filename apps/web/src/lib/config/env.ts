import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // Clerk Authentication
  CLERK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

  // AI Provider (abstracted)
  AI_PROVIDER: z
    .enum(['placeholder', 'claude', 'openai'])
    .default('placeholder'),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Transcription Provider (abstracted)
  TRANSCRIPTION_PROVIDER: z
    .enum(['placeholder', 'deepgram', 'openai-whisper'])
    .default('placeholder'),
  DEEPGRAM_API_KEY: z.string().optional(),

  // Billing Provider (abstracted)
  BILLING_PROVIDER: z.enum(['placeholder', 'dodo']).default('placeholder'),
  DODO_PAYMENTS_API_KEY: z.string().optional(),
  DODO_PAYMENTS_WEBHOOK_KEY: z.string().optional(),
  DODO_PAYMENTS_ENVIRONMENT: z
    .enum(['test_mode', 'live_mode'])
    .default('test_mode'),
  DODO_PRODUCT_ID_MONTHLY: z.string().optional(),
  DODO_PRODUCT_ID_ANNUAL: z.string().optional(),

  // Communication Services
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Google Services
  GOOGLE_CALENDAR_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALENDAR_REDIRECT_URI: z
    .string()
    .default('http://localhost:3000/api/calendar/callback'),

  // Security — Story 6.1 (Calendar token encryption + cron auth)
  CALENDAR_TOKEN_ENCRYPTION_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),

  // Recall.ai — Story 6.2 (Bot integration)
  RECALL_API_KEY: z.string().optional(),
  RECALL_WEBHOOK_SECRET: z.string().optional(),
  // Story 6.2b — workspace verification secret for per-bot real-time endpoints
  RECALL_REALTIME_WEBHOOK_SECRET: z.string().optional(),
  RECALL_BOT_NAME: z.string().default('MeetSolis Notetaker'),
  RECALL_REGION: z.string().default('ap-northeast-1'),

  // Analytics and Monitoring
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  NEXT_PUBLIC_MIXPANEL_TOKEN: z.string().optional(),
  NEXT_PUBLIC_HOTJAR_ID: z.string().optional(),
  NEXT_PUBLIC_HOTJAR_SV: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),

  // Alerting
  SLACK_WEBHOOK_URL: z.string().optional(),

  // Dev/testing overrides
  ADMIN_BYPASS_LIMITS: z.string().default('false'),

  // Service Configuration
  USE_MOCK_SERVICES: z.string().default('true'),
  NEXT_PUBLIC_USE_MOCK_SERVICES: z.string().default('true'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Circuit Breaker & Retry Configuration
  SERVICE_TIMEOUT_MS: z.string().default('5000'),
  CIRCUIT_BREAKER_THRESHOLD: z.string().default('5'),
  RETRY_ATTEMPTS: z.string().default('3'),
  BACKOFF_MULTIPLIER: z.string().default('2'),

  // Health Check Configuration
  HEALTH_CHECK_INTERVAL: z.string().default('60000'),
  ENABLE_SERVICE_MONITORING: z.string().default('true'),

  // Application Configuration
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),

  // Security
  NEXTAUTH_URL: z.string().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().optional(),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment configuration');
  }
}

// Export validated environment configuration
export const env = validateEnv();

// Type-safe environment configuration object
export const config = {
  // Convert string values to appropriate types
  adminBypassLimits:
    env.ADMIN_BYPASS_LIMITS === 'true' && env.NODE_ENV !== 'production',
  useMockServices: env.USE_MOCK_SERVICES === 'true',
  serviceTimeout: parseInt(env.SERVICE_TIMEOUT_MS, 10),
  circuitBreakerThreshold: parseInt(env.CIRCUIT_BREAKER_THRESHOLD, 10),
  retryAttempts: parseInt(env.RETRY_ATTEMPTS, 10),
  backoffMultiplier: parseInt(env.BACKOFF_MULTIPLIER, 10),
  healthCheckInterval: parseInt(env.HEALTH_CHECK_INTERVAL, 10),
  enableServiceMonitoring: env.ENABLE_SERVICE_MONITORING === 'true',

  // Application configuration
  app: {
    url: env.NEXT_PUBLIC_APP_URL,
    env: env.NODE_ENV,
  },

  // Service endpoints and keys
  clerk: {
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    webhookSecret: env.CLERK_WEBHOOK_SECRET,
  },

  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  ai: {
    provider: env.AI_PROVIDER,
    anthropicApiKey: env.ANTHROPIC_API_KEY,
    openaiApiKey: env.OPENAI_API_KEY,
  },

  transcription: {
    provider: env.TRANSCRIPTION_PROVIDER,
    deepgramApiKey: env.DEEPGRAM_API_KEY,
  },

  billing: {
    provider: env.BILLING_PROVIDER,
    dodoApiKey: env.DODO_PAYMENTS_API_KEY,
    dodoWebhookKey: env.DODO_PAYMENTS_WEBHOOK_KEY,
    dodoEnvironment: env.DODO_PAYMENTS_ENVIRONMENT,
    dodoProductIdMonthly: env.DODO_PRODUCT_ID_MONTHLY,
    dodoProductIdAnnual: env.DODO_PRODUCT_ID_ANNUAL,
  },

  twilio: {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    phoneNumber: env.TWILIO_PHONE_NUMBER,
  },

  google: {
    calendarApiKey: env.GOOGLE_CALENDAR_API_KEY,
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    calendarRedirectUri: env.GOOGLE_CALENDAR_REDIRECT_URI,
  },

  security: {
    calendarTokenEncryptionKey: env.CALENDAR_TOKEN_ENCRYPTION_KEY,
    cronSecret: env.CRON_SECRET,
  },

  recall: {
    apiKey: env.RECALL_API_KEY,
    webhookSecret: env.RECALL_WEBHOOK_SECRET,
    realtimeWebhookSecret: env.RECALL_REALTIME_WEBHOOK_SECRET,
    botName: env.RECALL_BOT_NAME,
    region: env.RECALL_REGION,
    baseUrl: `https://${env.RECALL_REGION}.recall.ai/api/v1`,
  },

  analytics: {
    posthogKey: env.NEXT_PUBLIC_POSTHOG_KEY,
    posthogHost: env.NEXT_PUBLIC_POSTHOG_HOST,
    mixpanelToken: env.NEXT_PUBLIC_MIXPANEL_TOKEN,
    hotjarId: env.NEXT_PUBLIC_HOTJAR_ID,
    hotjarSv: env.NEXT_PUBLIC_HOTJAR_SV,
    sentryDsn: env.SENTRY_DSN,
    publicSentryDsn: env.NEXT_PUBLIC_SENTRY_DSN,
    appVersion: env.NEXT_PUBLIC_APP_VERSION,
    slackWebhook: env.SLACK_WEBHOOK_URL,
  },

  auth: {
    url: env.NEXTAUTH_URL,
    secret: env.NEXTAUTH_SECRET,
  },
} as const;

export type Config = typeof config;
