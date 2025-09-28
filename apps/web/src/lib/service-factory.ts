import {
  AuthService,
  DatabaseService,
  AIService,
  TranslationService,
  SMSService,
  AnalyticsService,
} from '@meetsolis/shared';
import { serviceConfig } from './config/services';

// Mock services
import { MockAuthService } from './services/mock/mock-auth-service';
import { MockDatabaseService } from './services/mock/mock-database-service';
import { MockAIService } from './services/mock/mock-ai-service';
import { MockTranslationService } from './services/mock/mock-translation-service';
import { MockSMSService } from './services/mock/mock-sms-service';
import { MockAnalyticsService } from './services/mock/mock-analytics-service';

// Real services will be imported when implemented
// import { ClerkAuthService } from './services/real/clerk-auth-service';
// import { SupabaseService } from './services/real/supabase-service';
// import { OpenAIService } from './services/real/openai-service';
// import { DeepLTranslationService } from './services/real/deepl-service';
// import { TwilioSMSService } from './services/real/twilio-service';
// import { PostHogAnalyticsService } from './services/real/posthog-service';

export class ServiceFactory {
  private static instances = new Map<string, any>();

  static createAuthService(): AuthService {
    if (!this.instances.has('auth')) {
      const config = serviceConfig.getConfig();

      if (config.useMockServices) {
        this.instances.set('auth', new MockAuthService());
      } else {
        // Real Clerk service would be created here
        // this.instances.set('auth', new ClerkAuthService());
        throw new Error(
          'Real Clerk authentication service not yet implemented. Set USE_MOCK_SERVICES=true'
        );
      }
    }

    return this.instances.get('auth');
  }

  static createDatabaseService(): DatabaseService {
    if (!this.instances.has('database')) {
      const config = serviceConfig.getConfig();

      if (config.useMockServices) {
        this.instances.set('database', new MockDatabaseService());
      } else {
        // Real Supabase service would be created here
        // this.instances.set('database', new SupabaseService());
        throw new Error(
          'Real Supabase database service not yet implemented. Set USE_MOCK_SERVICES=true'
        );
      }
    }

    return this.instances.get('database');
  }

  static createAIService(): AIService {
    if (!this.instances.has('ai')) {
      const config = serviceConfig.getConfig();

      if (config.useMockServices) {
        this.instances.set('ai', new MockAIService());
      } else {
        // Real OpenAI service would be created here
        // this.instances.set('ai', new OpenAIService());
        throw new Error(
          'Real OpenAI service not yet implemented. Set USE_MOCK_SERVICES=true'
        );
      }
    }

    return this.instances.get('ai');
  }

  static createTranslationService(): TranslationService {
    if (!this.instances.has('translation')) {
      const config = serviceConfig.getConfig();

      if (config.useMockServices) {
        this.instances.set('translation', new MockTranslationService());
      } else {
        // Real DeepL service would be created here
        // this.instances.set('translation', new DeepLTranslationService());
        throw new Error(
          'Real DeepL translation service not yet implemented. Set USE_MOCK_SERVICES=true'
        );
      }
    }

    return this.instances.get('translation');
  }

  static createSMSService(): SMSService {
    if (!this.instances.has('sms')) {
      const config = serviceConfig.getConfig();

      if (config.useMockServices) {
        this.instances.set('sms', new MockSMSService());
      } else {
        // Real Twilio service would be created here
        // this.instances.set('sms', new TwilioSMSService());
        throw new Error(
          'Real Twilio SMS service not yet implemented. Set USE_MOCK_SERVICES=true'
        );
      }
    }

    return this.instances.get('sms');
  }

  static createAnalyticsService(): AnalyticsService {
    if (!this.instances.has('analytics')) {
      const config = serviceConfig.getConfig();

      if (config.useMockServices) {
        this.instances.set('analytics', new MockAnalyticsService());
      } else {
        // Real PostHog service would be created here
        // this.instances.set('analytics', new PostHogAnalyticsService());
        throw new Error(
          'Real PostHog analytics service not yet implemented. Set USE_MOCK_SERVICES=true'
        );
      }
    }

    return this.instances.get('analytics');
  }

  // Utility methods for service management
  static getAllServices(): { [key: string]: any } {
    return {
      auth: this.instances.get('auth'),
      database: this.instances.get('database'),
      ai: this.instances.get('ai'),
      translation: this.instances.get('translation'),
      sms: this.instances.get('sms'),
      analytics: this.instances.get('analytics'),
    };
  }

  static clearAllServices(): void {
    this.instances.clear();
  }

  static isServiceInitialized(serviceName: string): boolean {
    return this.instances.has(serviceName);
  }

  static getServiceInstance(serviceName: string): any {
    return this.instances.get(serviceName);
  }

  static async healthCheckAllServices(): Promise<{ [key: string]: any }> {
    const services = this.getAllServices();
    const healthChecks: { [key: string]: any } = {};

    for (const [name, service] of Object.entries(services)) {
      if (service && typeof service.healthCheck === 'function') {
        try {
          healthChecks[name] = await service.healthCheck();
        } catch (error) {
          healthChecks[name] = {
            status: 'unavailable',
            error: error instanceof Error ? error.message : 'Unknown error',
            lastCheck: new Date(),
          };
        }
      }
    }

    return healthChecks;
  }

  static async validateAllServices(): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    const config = serviceConfig.getConfig();

    try {
      // Test service creation
      this.createAuthService();
      this.createDatabaseService();
      this.createAIService();
      this.createTranslationService();
      this.createSMSService();
      this.createAnalyticsService();

      // Validate configuration
      const credentialValidation = serviceConfig.validateCredentials();
      if (!credentialValidation.isValid && !config.useMockServices) {
        errors.push(
          `Missing credentials for services: ${credentialValidation.missingServices.join(', ')}`
        );
      }
    } catch (error) {
      errors.push(
        error instanceof Error
          ? error.message
          : 'Unknown service validation error'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
