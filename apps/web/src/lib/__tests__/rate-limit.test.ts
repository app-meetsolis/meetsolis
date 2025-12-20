/**
 * Rate Limiting Tests
 * Tests for SEC-001 fix - Production-ready Redis rate limiting
 */

// Mock @upstash/redis BEFORE importing rate-limit
const mockExec = jest.fn();
const mockIncr = jest.fn().mockReturnThis();
const mockTtl = jest.fn().mockReturnThis();
const mockExpire = jest.fn();
const mockDel = jest.fn();
const mockPipeline = jest.fn(() => ({
  incr: mockIncr,
  ttl: mockTtl,
  exec: mockExec,
}));

const mockRedis = {
  incr: jest.fn(),
  ttl: jest.fn(),
  expire: mockExpire,
  del: mockDel,
  pipeline: mockPipeline,
};

jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => mockRedis),
}));

import {
  checkRateLimit,
  resetRateLimit,
  RateLimitPresets,
} from '../rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockExec.mockReset();
    mockExpire.mockReset();
    mockDel.mockReset();

    // Set required env vars for tests
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
  });

  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it('should allow request when under rate limit', async () => {
    // Mock first request
    mockExec.mockResolvedValue([1, 60]); // count=1, ttl=60

    const result = await checkRateLimit('test-user:meeting-1', {
      limit: 10,
      window: 60,
    });

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
    expect(result.limit).toBe(10);
    expect(mockIncr).toHaveBeenCalledWith('ratelimit:test-user:meeting-1');
  });

  it('should block request when rate limit exceeded', async () => {
    // Mock 11th request (limit is 10)
    mockExec.mockResolvedValue([11, 30]); // count=11, ttl=30

    const result = await checkRateLimit('test-user:meeting-1', {
      limit: 10,
      window: 60,
    });

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.limit).toBe(10);
  });

  it('should set expiry on first request', async () => {
    // Mock first request with no TTL (-1 means key has no expiry)
    mockExec.mockResolvedValue([1, -1]); // count=1, ttl=-1 (no expiry)
    mockExpire.mockResolvedValue(true);

    const result = await checkRateLimit('new-user:meeting-1', {
      limit: 10,
      window: 60,
    });

    expect(result.success).toBe(true);
    expect(mockExpire).toHaveBeenCalledWith('ratelimit:new-user:meeting-1', 60);
  });

  it('should calculate reset time correctly', async () => {
    const now = Date.now();
    mockExec.mockResolvedValue([5, 45]); // count=5, ttl=45 seconds

    const result = await checkRateLimit('test-user:meeting-1', {
      limit: 10,
      window: 60,
    });

    // Reset should be approximately now + 45 seconds
    expect(result.reset).toBeGreaterThan(now);
    expect(result.reset).toBeLessThanOrEqual(now + 45 * 1000 + 100); // 100ms tolerance
  });

  it('should use correct preset for messages', async () => {
    mockExec.mockResolvedValue([1, 60]);

    const result = await checkRateLimit(
      'user:meeting',
      RateLimitPresets.MESSAGE
    );

    expect(result.limit).toBe(10);
    expect(result.success).toBe(true);
  });

  it('should use correct preset for file uploads', async () => {
    mockExec.mockResolvedValue([1, 60]);

    const result = await checkRateLimit(
      'user:meeting',
      RateLimitPresets.FILE_UPLOAD
    );

    expect(result.limit).toBe(5);
    expect(result.success).toBe(true);
  });

  it('should handle Redis errors gracefully (fail open)', async () => {
    // Mock Redis error
    mockExec.mockRejectedValue(new Error('Redis connection failed'));

    const result = await checkRateLimit('test-user:meeting-1', {
      limit: 10,
      window: 60,
    });

    // Should fail open - allow the request but log error
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(10);
  });

  it('should work in development mode without Redis', async () => {
    // Remove Redis env vars
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const result = await checkRateLimit('test-user:meeting-1', {
      limit: 10,
      window: 60,
    });

    // Should allow all requests with warning
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(10);
    // Redis should not be called
    expect(mockExec).not.toHaveBeenCalled();
  });

  it('should namespace keys with "ratelimit:" prefix', async () => {
    mockExec.mockResolvedValue([1, 60]);

    await checkRateLimit('user123:meeting456', { limit: 10, window: 60 });

    expect(mockIncr).toHaveBeenCalledWith('ratelimit:user123:meeting456');
  });

  it('should allow burst of requests up to limit', async () => {
    // Simulate 10 requests in quick succession
    for (let i = 1; i <= 10; i++) {
      mockExec.mockResolvedValue([i, 60]);

      const result = await checkRateLimit('test-user:meeting-1', {
        limit: 10,
        window: 60,
      });

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(10 - i);
    }
  });

  it('should reset counter after window expires', async () => {
    // First request after reset
    mockExec.mockResolvedValue([1, -1]); // New key, no TTL
    mockExpire.mockResolvedValue(true);

    const result = await checkRateLimit('test-user:meeting-1', {
      limit: 10,
      window: 60,
    });

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
    expect(mockExpire).toHaveBeenCalled();
  });
});

describe('resetRateLimit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDel.mockReset();
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
  });

  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it('should delete rate limit key', async () => {
    mockDel.mockResolvedValue(1);

    await resetRateLimit('test-user:meeting-1');

    expect(mockDel).toHaveBeenCalledWith('ratelimit:test-user:meeting-1');
  });

  it('should handle errors gracefully', async () => {
    mockDel.mockRejectedValue(new Error('Redis error'));

    // Should not throw
    await expect(resetRateLimit('test-user:meeting-1')).resolves.not.toThrow();
  });

  it('should do nothing in development mode', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    await resetRateLimit('test-user:meeting-1');

    expect(mockDel).not.toHaveBeenCalled();
  });
});

describe('RateLimitPresets', () => {
  it('should have correct MESSAGE preset', () => {
    expect(RateLimitPresets.MESSAGE).toEqual({ limit: 10, window: 60 });
  });

  it('should have correct FILE_UPLOAD preset', () => {
    expect(RateLimitPresets.FILE_UPLOAD).toEqual({ limit: 5, window: 60 });
  });

  it('should have correct API preset', () => {
    expect(RateLimitPresets.API).toEqual({ limit: 30, window: 60 });
  });

  it('should have correct AUTH preset', () => {
    expect(RateLimitPresets.AUTH).toEqual({ limit: 100, window: 3600 });
  });
});
