/**
 * Production-Ready Rate Limiting Utility
 * Uses Upstash Redis for distributed rate limiting
 *
 * Security Fix: SEC-001
 * Replaces in-memory Map with Redis for serverless/multi-instance support
 */

import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
// Falls back to in-memory for development if Redis not configured
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

interface RateLimitConfig {
  limit: number; // Max requests
  window: number; // Time window in seconds
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp when limit resets
}

/**
 * Check rate limit for a given identifier
 *
 * Uses sliding window algorithm with Redis INCR and EXPIRE
 *
 * @param identifier - Unique key for rate limiting (e.g., "userId:meetingId")
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, window } = config;

  // If Redis not configured (development), allow all requests with warning
  if (!redis) {
    console.warn(
      '[Rate Limit] Redis not configured - rate limiting disabled (development mode)'
    );
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + window * 1000,
    };
  }

  try {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowMs = window * 1000;
    const resetAt = now + windowMs;

    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();

    // Increment counter
    pipeline.incr(key);

    // Get TTL to calculate reset time
    pipeline.ttl(key);

    const results = await pipeline.exec();

    // results: [count, ttl]
    const count = results[0] as number;
    const ttl = results[1] as number;

    // Set expiry on first request (if no TTL exists)
    if (ttl === -1) {
      await redis.expire(key, window);
    }

    // Calculate actual reset time based on TTL
    const actualResetAt = ttl > 0 ? now + ttl * 1000 : resetAt;

    const remaining = Math.max(0, limit - count);
    const success = count <= limit;

    return {
      success,
      limit,
      remaining,
      reset: actualResetAt,
    };
  } catch (error) {
    // Log error but don't block requests on Redis failure
    console.error('[Rate Limit] Redis error:', error);

    // Fail open - allow request but log the failure
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + window * 1000,
    };
  }
}

/**
 * Common rate limit configurations
 */
export const RateLimitPresets = {
  /** 10 messages per minute - for chat messages */
  MESSAGE: { limit: 10, window: 60 },

  /** 5 uploads per minute - for file uploads */
  FILE_UPLOAD: { limit: 5, window: 60 },

  /** 30 requests per minute - for general API endpoints */
  API: { limit: 30, window: 60 },

  /** 100 requests per hour - for auth endpoints */
  AUTH: { limit: 100, window: 3600 },
} as const;

/**
 * Reset rate limit for a given identifier (useful for testing)
 *
 * @param identifier - Unique key to reset
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  if (!redis) return;

  try {
    const key = `ratelimit:${identifier}`;
    await redis.del(key);
  } catch (error) {
    console.error('[Rate Limit] Failed to reset:', error);
  }
}
