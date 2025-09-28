import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // Clerk Authentication
  CLERK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),

  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  DEEPL_API_KEY: z.string().optional(),

  // Communication Services
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Google Services
  GOOGLE_CALENDAR_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Analytics and Monitoring
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // Service Configuration
  USE_MOCK_SERVICES: z.string().default('true'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Circuit Breaker & Retry Configuration
  SERVICE_TIMEOUT_MS: z.string().default('5000'),
  CIRCUIT_BREAKER_THRESHOLD: z.string().default('5'),
  RETRY_ATTEMPTS: z.string().default('3'),
  BACKOFF_MULTIPLIER: z.string().default('2'),

  // Health Check Configuration
  HEALTH_CHECK_INTERVAL: z.string().default('60000'),
  ENABLE_SERVICE_MONITORING: z.string().default('true'),

  // WebRTC Configuration
  TURN_SERVER_URL: z.string().optional(),
  TURN_SERVER_USERNAME: z.string().optional(),
  TURN_SERVER_CREDENTIAL: z.string().optional(),

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
  useMockServices: env.USE_MOCK_SERVICES === 'true',
  serviceTimeout: parseInt(env.SERVICE_TIMEOUT_MS, 10),
  circuitBreakerThreshold: parseInt(env.CIRCUIT_BREAKER_THRESHOLD, 10),
  retryAttempts: parseInt(env.RETRY_ATTEMPTS, 10),
  backoffMultiplier: parseInt(env.BACKOFF_MULTIPLIER, 10),
  healthCheckInterval: parseInt(env.HEALTH_CHECK_INTERVAL, 10),
  enableServiceMonitoring: env.ENABLE_SERVICE_MONITORING === 'true',

  // Service endpoints and keys
  clerk: {
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },

  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: env.SUPABASE_ANON_KEY,
  },

  ai: {
    openaiApiKey: env.OPENAI_API_KEY,
    deeplApiKey: env.DEEPL_API_KEY,
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
  },

  analytics: {
    posthogKey: env.NEXT_PUBLIC_POSTHOG_KEY,
    posthogHost: env.NEXT_PUBLIC_POSTHOG_HOST,
    sentryDsn: env.SENTRY_DSN,
    publicSentryDsn: env.NEXT_PUBLIC_SENTRY_DSN,
  },

  webrtc: {
    turnServerUrl: env.TURN_SERVER_URL,
    turnServerUsername: env.TURN_SERVER_USERNAME,
    turnServerCredential: env.TURN_SERVER_CREDENTIAL,
  },

  auth: {
    url: env.NEXTAUTH_URL,
    secret: env.NEXTAUTH_SECRET,
  },
} as const;

export type Config = typeof config;