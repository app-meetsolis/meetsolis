import { ExternalService, ServiceStatus, ServiceInfo } from '@meetsolis/shared';
import { CircuitBreaker } from '../circuit-breaker';

export abstract class BaseService implements ExternalService {
  protected circuitBreaker: CircuitBreaker;
  protected fallbackModeEnabled = false;
  protected lastHealthCheck?: ServiceStatus;

  constructor(circuitBreakerOptions?: any) {
    this.circuitBreaker = new CircuitBreaker(circuitBreakerOptions);
  }

  abstract isAvailable(): Promise<boolean>;
  abstract getServiceInfo(): ServiceInfo;
  protected abstract performHealthCheck(): Promise<ServiceStatus>;

  fallbackMode(): boolean {
    return this.fallbackModeEnabled;
  }

  async healthCheck(): Promise<ServiceStatus> {
    try {
      const startTime = Date.now();

      const status = await this.circuitBreaker.execute(async () => {
        return await this.performHealthCheck();
      });

      const responseTime = Date.now() - startTime;

      this.lastHealthCheck = {
        ...status,
        responseTime,
        lastCheck: new Date(),
      };

      return this.lastHealthCheck;
    } catch (error) {
      this.lastHealthCheck = {
        status: 'unavailable',
        responseTime: -1,
        lastCheck: new Date(),
        errorCount: this.circuitBreaker.getFailureCount(),
      };

      return this.lastHealthCheck;
    }
  }

  protected enableFallbackMode(): void {
    this.fallbackModeEnabled = true;
  }

  protected disableFallbackMode(): void {
    this.fallbackModeEnabled = false;
  }

  getLastHealthCheck(): ServiceStatus | undefined {
    return this.lastHealthCheck;
  }

  getCircuitBreakerState() {
    return this.circuitBreaker.getState();
  }

  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }
}