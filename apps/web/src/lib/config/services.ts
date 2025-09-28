import { SERVICE_TIMEOUTS, CIRCUIT_BREAKER_CONFIG } from '@meetsolis/shared';

export interface ServiceConfig {
  useMockServices: boolean;
  timeout: number;
  retryAttempts: number;
  circuitBreakerThreshold: number;
  healthCheckInterval: number;
}

export interface ExternalServiceCredentials {
  clerk: {
    secretKey: string;
    publishableKey: string;
  };
  supabase: {
    url: string;
    serviceRoleKey: string;
    anonKey: string;
  };
  openai: {
    apiKey: string;
  };
  deepl: {
    apiKey: string;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  googleCalendar: {
    apiKey: string;
    clientId: string;
    clientSecret: string;
  };
  posthog: {
    key: string;
    host: string;
  };
  sentry: {
    dsn: string;
  };
}

class ServiceConfigManager {
  private config: ServiceConfig;
  private credentials: Partial<ExternalServiceCredentials>;

  constructor() {
    this.config = this.loadConfig();
    this.credentials = this.loadCredentials();
  }

  private loadConfig(): ServiceConfig {
    return {
      useMockServices: process.env.USE_MOCK_SERVICES === 'true',
      timeout: parseInt(
        process.env.SERVICE_TIMEOUT_MS || String(SERVICE_TIMEOUTS.DEFAULT)
      ),
      retryAttempts: parseInt(
        process.env.RETRY_ATTEMPTS ||
          String(CIRCUIT_BREAKER_CONFIG.RETRY_ATTEMPTS)
      ),
      circuitBreakerThreshold: parseInt(
        process.env.CIRCUIT_BREAKER_THRESHOLD ||
          String(CIRCUIT_BREAKER_CONFIG.FAILURE_THRESHOLD)
      ),
      healthCheckInterval: parseInt(
        process.env.HEALTH_CHECK_INTERVAL || '60000'
      ),
    };
  }

  private loadCredentials(): Partial<ExternalServiceCredentials> {
    return {
      clerk: {
        secretKey: process.env.CLERK_SECRET_KEY || '',
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
      },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
      },
      deepl: {
        apiKey: process.env.DEEPL_API_KEY || '',
      },
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
      },
      googleCalendar: {
        apiKey: process.env.GOOGLE_CALENDAR_API_KEY || '',
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
      posthog: {
        key: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || '',
      },
      sentry: {
        dsn: process.env.SENTRY_DSN || '',
      },
    };
  }

  getConfig(): ServiceConfig {
    return this.config;
  }

  getCredentials(): Partial<ExternalServiceCredentials> {
    return this.credentials;
  }

  refresh(): void {
    this.config = this.loadConfig();
    this.credentials = this.loadCredentials();
  }

  validateCredentials(): { isValid: boolean; missingServices: string[] } {
    const missingServices: string[] = [];

    if (!this.config.useMockServices) {
      if (
        !this.credentials.clerk?.secretKey ||
        !this.credentials.clerk?.publishableKey
      ) {
        missingServices.push('clerk');
      }
      if (
        !this.credentials.supabase?.url ||
        !this.credentials.supabase?.serviceRoleKey
      ) {
        missingServices.push('supabase');
      }
      if (!this.credentials.openai?.apiKey) {
        missingServices.push('openai');
      }
      if (!this.credentials.deepl?.apiKey) {
        missingServices.push('deepl');
      }
      if (
        !this.credentials.twilio?.accountSid ||
        !this.credentials.twilio?.authToken
      ) {
        missingServices.push('twilio');
      }
    }

    return {
      isValid: missingServices.length === 0,
      missingServices,
    };
  }
}

export const serviceConfig = new ServiceConfigManager();
