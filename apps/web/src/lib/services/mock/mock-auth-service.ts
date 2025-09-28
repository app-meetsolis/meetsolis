import { AuthService, ServiceStatus, ServiceInfo } from '@meetsolis/shared';
import { BaseService } from '../base-service';

export class MockAuthService extends BaseService implements AuthService {
  private mockUsers = new Map<string, any>();
  private currentUser: any = null;

  constructor() {
    super();
    this.enableFallbackMode();
    this.initializeMockUsers();
  }

  private initializeMockUsers() {
    // Add some mock users for testing
    this.mockUsers.set('test@example.com', {
      id: 'mock-user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date().toISOString(),
    });

    this.mockUsers.set('admin@example.com', {
      id: 'mock-admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
  }

  async isAvailable(): Promise<boolean> {
    return true; // Mock service is always available
  }

  getServiceInfo(): ServiceInfo {
    return {
      name: 'Mock Authentication Service',
      version: '1.0.0',
      description: 'Mock authentication service for development and testing',
      dependencies: [],
    };
  }

  protected async performHealthCheck(): Promise<ServiceStatus> {
    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      status: 'healthy',
      responseTime: 50,
      lastCheck: new Date(),
      errorCount: 0,
    };
  }

  async authenticate(credentials: {
    email: string;
    password: string;
  }): Promise<any> {
    console.log('[MockAuthService] Authenticating user:', credentials.email);

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const user = this.mockUsers.get(credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // In mock mode, any password works
    this.currentUser = user;

    return {
      user,
      token: `mock-jwt-token-${user.id}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  async logout(): Promise<void> {
    console.log('[MockAuthService] Logging out user');
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<any> {
    return this.currentUser;
  }

  // Mock-specific methods for testing
  addMockUser(user: any): void {
    this.mockUsers.set(user.email, user);
  }

  clearMockUsers(): void {
    this.mockUsers.clear();
    this.initializeMockUsers();
  }

  getMockUsers(): any[] {
    return Array.from(this.mockUsers.values());
  }
}
