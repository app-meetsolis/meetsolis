import { CIRCUIT_BREAKER_CONFIG } from '@meetsolis/shared';

export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  retryAttempts: number;
  backoffMultiplier: number;
}

export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime?: Date;
  private state: CircuitBreakerState = 'closed';
  private options: CircuitBreakerOptions;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold:
        options.failureThreshold || CIRCUIT_BREAKER_CONFIG.FAILURE_THRESHOLD,
      resetTimeout:
        options.resetTimeout || CIRCUIT_BREAKER_CONFIG.RESET_TIMEOUT,
      retryAttempts:
        options.retryAttempts || CIRCUIT_BREAKER_CONFIG.RETRY_ATTEMPTS,
      backoffMultiplier:
        options.backoffMultiplier || CIRCUIT_BREAKER_CONFIG.BACKOFF_MULTIPLIER,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open - service unavailable');
      }
    }

    try {
      const result = await this.executeWithRetry(operation);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.options.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.options.retryAttempts) {
          const delay = this.calculateBackoffDelay(attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  private calculateBackoffDelay(attempt: number): number {
    return Math.min(
      1000 * Math.pow(this.options.backoffMultiplier, attempt - 1),
      30000 // Max 30 seconds
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;

    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
    return timeSinceLastFailure >= this.options.resetTimeout;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
    this.lastFailureTime = undefined;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  reset(): void {
    this.failureCount = 0;
    this.state = 'closed';
    this.lastFailureTime = undefined;
  }
}
