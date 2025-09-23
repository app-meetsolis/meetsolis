import { ServiceFactory } from '../../../src/lib/service-factory';
import { serviceConfig } from '../../../src/lib/config/services';

describe('Service Connectivity Tests', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    // Clear service instances between tests
    ServiceFactory.clearAllServices();
  });

  describe('Mock Services Connectivity', () => {
    beforeEach(() => {
      process.env.USE_MOCK_SERVICES = 'true';
    });

    it('should successfully connect to mock authentication service', async () => {
      const authService = ServiceFactory.createAuthService();

      expect(authService).toBeDefined();
      expect(await authService.isAvailable()).toBe(true);
      expect(authService.fallbackMode()).toBe(true);

      const healthCheck = await authService.healthCheck();
      expect(healthCheck.status).toBe('healthy');
      expect(healthCheck.responseTime).toBeGreaterThan(0);
    });

    it('should successfully connect to mock database service', async () => {
      const dbService = ServiceFactory.createDatabaseService();

      expect(dbService).toBeDefined();
      expect(await dbService.isAvailable()).toBe(true);
      expect(dbService.fallbackMode()).toBe(true);

      const healthCheck = await dbService.healthCheck();
      expect(healthCheck.status).toBe('healthy');
    });

    it('should successfully connect to mock AI service', async () => {
      const aiService = ServiceFactory.createAIService();

      expect(aiService).toBeDefined();
      expect(await aiService.isAvailable()).toBe(true);

      const healthCheck = await aiService.healthCheck();
      expect(healthCheck.status).toBe('healthy');
    });

    it('should successfully connect to mock translation service', async () => {
      const translationService = ServiceFactory.createTranslationService();

      expect(translationService).toBeDefined();
      expect(await translationService.isAvailable()).toBe(true);

      const healthCheck = await translationService.healthCheck();
      expect(healthCheck.status).toBe('healthy');
    });

    it('should successfully connect to mock SMS service', async () => {
      const smsService = ServiceFactory.createSMSService();

      expect(smsService).toBeDefined();
      expect(await smsService.isAvailable()).toBe(true);

      const healthCheck = await smsService.healthCheck();
      expect(healthCheck.status).toBe('healthy');
    });

    it('should successfully connect to mock analytics service', async () => {
      const analyticsService = ServiceFactory.createAnalyticsService();

      expect(analyticsService).toBeDefined();
      expect(await analyticsService.isAvailable()).toBe(true);

      const healthCheck = await analyticsService.healthCheck();
      expect(healthCheck.status).toBe('healthy');
    });
  });

  describe('Service Functionality Tests', () => {
    beforeEach(() => {
      process.env.USE_MOCK_SERVICES = 'true';
    });

    it('should perform mock authentication flow', async () => {
      const authService = ServiceFactory.createAuthService();

      const credentials = {
        email: 'test@example.com',
        password: 'test-password'
      };

      const authResult = await authService.authenticate(credentials);
      expect(authResult).toBeDefined();
      expect(authResult.user).toBeDefined();
      expect(authResult.token).toBeDefined();

      const currentUser = await authService.getCurrentUser();
      expect(currentUser).toBeDefined();
      expect(currentUser.email).toBe(credentials.email);

      await authService.logout();
      const userAfterLogout = await authService.getCurrentUser();
      expect(userAfterLogout).toBeNull();
    });

    it('should perform mock database operations', async () => {
      const dbService = ServiceFactory.createDatabaseService();

      // Test insert
      const insertResult = await dbService.insert('users', {
        email: 'test@example.com',
        name: 'Test User'
      });
      expect(insertResult).toBeDefined();
      expect(insertResult.insertId).toBeDefined();

      // Test query
      const queryResult = await dbService.query('SELECT * FROM users');
      expect(queryResult.rows).toBeDefined();
      expect(Array.isArray(queryResult.rows)).toBe(true);
    });

    it('should perform AI text analysis', async () => {
      const aiService = ServiceFactory.createAIService();

      const testText = 'This is a test meeting summary with important project details and team collaboration.';

      const summary = await aiService.generateSummary(testText);
      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);

      const analysis = await aiService.analyzeText(testText);
      expect(analysis).toBeDefined();
      expect(analysis.wordCount).toBeGreaterThan(0);
      expect(analysis.keywords).toBeDefined();
      expect(Array.isArray(analysis.keywords)).toBe(true);
    });

    it('should perform translation operations', async () => {
      const translationService = ServiceFactory.createTranslationService();

      const testText = 'Hello, this is a test message for translation.';

      const detectedLanguage = await translationService.detectLanguage(testText);
      expect(detectedLanguage).toBeDefined();
      expect(typeof detectedLanguage).toBe('string');

      const translation = await translationService.translate(testText, 'es');
      expect(translation).toBeDefined();
      expect(typeof translation).toBe('string');
    });

    it('should send SMS notifications', async () => {
      const smsService = ServiceFactory.createSMSService();

      const phoneNumber = '+1234567890';
      const message = 'Test SMS notification from MeetSolis';

      const result = await smsService.sendSMS(phoneNumber, message);
      expect(result).toBe(true);
    });

    it('should track analytics events', async () => {
      const analyticsService = ServiceFactory.createAnalyticsService();

      await analyticsService.identify('test-user-123', {
        email: 'test@example.com',
        name: 'Test User'
      });

      await analyticsService.track('meeting_started', {
        meetingId: 'test-meeting-123',
        participants: 3,
        duration: 30
      });

      // The mock service should have logged these events
      expect(true).toBe(true); // Basic validation that no errors occurred
    });
  });

  describe('Service Factory Validation', () => {
    beforeEach(() => {
      process.env.USE_MOCK_SERVICES = 'true';
    });

    it('should validate all services successfully in mock mode', async () => {
      const validation = await ServiceFactory.validateAllServices();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should perform health checks on all services', async () => {
      // Initialize all services
      ServiceFactory.createAuthService();
      ServiceFactory.createDatabaseService();
      ServiceFactory.createAIService();
      ServiceFactory.createTranslationService();
      ServiceFactory.createSMSService();
      ServiceFactory.createAnalyticsService();

      const healthChecks = await ServiceFactory.healthCheckAllServices();

      expect(healthChecks.auth).toBeDefined();
      expect(healthChecks.database).toBeDefined();
      expect(healthChecks.ai).toBeDefined();
      expect(healthChecks.translation).toBeDefined();
      expect(healthChecks.sms).toBeDefined();
      expect(healthChecks.analytics).toBeDefined();

      // All mock services should be healthy
      Object.values(healthChecks).forEach(health => {
        expect(health.status).toBe('healthy');
      });
    });
  });

  describe('Real Services Configuration', () => {
    beforeEach(() => {
      process.env.USE_MOCK_SERVICES = 'false';
      // Clear any existing credentials
      delete process.env.CLERK_SECRET_KEY;
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    });

    it('should fail gracefully when real services are not configured', async () => {
      expect(() => {
        ServiceFactory.createAuthService();
      }).toThrow(/Real Clerk authentication service not yet implemented/);

      expect(() => {
        ServiceFactory.createDatabaseService();
      }).toThrow(/Real Supabase database service not yet implemented/);
    });

    it('should detect missing credentials for real services', () => {
      const validation = serviceConfig.validateCredentials();

      expect(validation.isValid).toBe(false);
      expect(validation.missingServices).toContain('clerk');
      expect(validation.missingServices).toContain('supabase');
    });
  });

  describe('Error Handling and Resilience', () => {
    beforeEach(() => {
      process.env.USE_MOCK_SERVICES = 'true';
    });

    it('should handle authentication failures gracefully', async () => {
      const authService = ServiceFactory.createAuthService();

      try {
        await authService.authenticate({
          email: 'nonexistent@example.com',
          password: 'wrong-password'
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Invalid credentials');
      }
    });

    it('should handle invalid phone numbers in SMS service', async () => {
      const smsService = ServiceFactory.createSMSService();

      try {
        await smsService.sendSMS('invalid-phone', 'Test message');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Invalid phone number');
      }
    });

    it('should handle unsupported languages in translation service', async () => {
      const translationService = ServiceFactory.createTranslationService();

      try {
        await translationService.translate('Hello', 'invalid-lang');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Unsupported target language');
      }
    });
  });
});