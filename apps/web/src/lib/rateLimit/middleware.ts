/**
 * Rate Limiting Middleware
 * Implements sliding window rate limiting for API endpoints
 *
 * Configuration: 100 requests per minute per user (as specified in Story 2.3)
 *
 * Usage:
 * ```typescript
 * import { rateLimit } from '@/lib/rateLimit/middleware';
 *
 * export async function PUT(request: NextRequest, ...) {
 *   // Apply rate limiting
 *   const rateLimitResult = await rateLimit(request, userId);
 *   if (!rateLimitResult.success) {
 *     return rateLimitResult.response;
 *   }
 *
 *   // ... rest of API logic
 * }
 * ```
 *
 * NOTE: This implementation uses in-memory storage.
 * For production with multiple instances, consider:
 * - @vercel/edge-rate-limit (Vercel KV)
 * - Redis-based rate limiting
 * - Upstash Rate Limiting
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number; // Timestamp when the window resets
}

/**
 * In-memory cache for rate limit data
 * Key: userId
 * Value: { count, resetAt }
 *
 * NOTE: This will reset on server restart.
 * For production, use Redis or Vercel KV.
 */
const rateLimitCache = new Map<string, RateLimitEntry>();

/**
 * Cleanup interval to remove expired entries
 * Runs every 60 seconds
 */
setInterval(() => {
  const now = Date.now();
  // Convert to array to avoid iterator issues with older TypeScript targets
  const entries = Array.from(rateLimitCache.entries());
  for (const [userId, entry] of entries) {
    if (entry.resetAt < now) {
      rateLimitCache.delete(userId);
    }
  }
}, 60 * 1000); // Cleanup every 60 seconds

/**
 * Rate limit configuration
 */
export const RATE_LIMIT_CONFIG = {
  /**
   * Maximum number of requests allowed per window
   */
  maxRequests: 100,

  /**
   * Window duration in milliseconds (1 minute)
   */
  windowMs: 60 * 1000,
};

export interface RateLimitOptions {
  /**
   * Custom max requests (overrides default 100)
   */
  maxRequests?: number;

  /**
   * Custom window in milliseconds (overrides default 60s)
   */
  windowMs?: number;

  /**
   * Custom identifier (defaults to userId)
   * Useful for IP-based rate limiting
   */
  identifier?: string;
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  success: boolean;

  /**
   * Response to return if rate limit exceeded (only if success=false)
   */
  response?: NextResponse;

  /**
   * Current request count
   */
  count: number;

  /**
   * Remaining requests in the window
   */
  remaining: number;

  /**
   * Timestamp when the window resets
   */
  resetAt: number;
}

/**
 * Apply rate limiting to a request
 *
 * @param request - Next.js request object
 * @param userId - User ID to rate limit
 * @param options - Optional configuration overrides
 * @returns RateLimitResult with success status
 *
 * @example
 * ```typescript
 * const rateLimitResult = await rateLimit(request, userId);
 * if (!rateLimitResult.success) {
 *   return rateLimitResult.response; // Return 429 Too Many Requests
 * }
 * ```
 */
export async function rateLimit(
  request: NextRequest,
  userId: string,
  options?: RateLimitOptions
): Promise<RateLimitResult> {
  const maxRequests = options?.maxRequests || RATE_LIMIT_CONFIG.maxRequests;
  const windowMs = options?.windowMs || RATE_LIMIT_CONFIG.windowMs;
  const identifier = options?.identifier || userId;

  const now = Date.now();
  const entry = rateLimitCache.get(identifier);

  // If no entry exists, or entry has expired, create a new one
  if (!entry || entry.resetAt < now) {
    rateLimitCache.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      success: true,
      count: 1,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  // Increment count
  // TODO: KNOWN LIMITATION - Race Condition Vulnerability
  // This increment is NOT atomic and can be bypassed with concurrent requests.
  // Two simultaneous requests can both read count=99, increment to 100, and both pass.
  //
  // Impact: Low-Medium (attacker needs precise timing, 100/min limit makes it impractical)
  // Fix: Replace in-memory cache with Redis atomic operations:
  //   const count = await redis.incr(`ratelimit:${identifier}`);
  //   if (count === 1) await redis.expire(`ratelimit:${identifier}`, windowMs / 1000);
  //   if (count > maxRequests) return { success: false, ... };
  //
  // Effort: 2-4 hours (Redis setup + testing)
  // Reference: docs/qa/gates/2.3-video-layout-participant-mgmt.yml
  // Tracked: Story 2.X (deferred to next sprint)
  entry.count += 1;

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);

    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${maxRequests} per ${windowMs / 1000}s. Try again in ${resetInSeconds}s.`,
          details: {
            limit: maxRequests,
            current: entry.count,
            reset_at: new Date(entry.resetAt).toISOString(),
            retry_after: resetInSeconds,
          },
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
            'Retry-After': String(resetInSeconds),
          },
        }
      ),
      count: entry.count,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Request allowed
  return {
    success: true,
    count: entry.count,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Add rate limit headers to a response
 * Useful for showing rate limit info even on successful requests
 *
 * @param response - Next.js response object
 * @param rateLimitResult - Result from rateLimit() call
 * @returns Response with added headers
 */
export function addRateLimitHeaders(
  response: NextResponse,
  rateLimitResult: RateLimitResult
): NextResponse {
  response.headers.set(
    'X-RateLimit-Limit',
    String(RATE_LIMIT_CONFIG.maxRequests)
  );
  response.headers.set(
    'X-RateLimit-Remaining',
    String(rateLimitResult.remaining)
  );
  response.headers.set(
    'X-RateLimit-Reset',
    String(Math.ceil(rateLimitResult.resetAt / 1000))
  );

  return response;
}

/**
 * Clear rate limit for a user (useful for testing)
 */
export function clearRateLimit(identifier: string): void {
  rateLimitCache.delete(identifier);
}

/**
 * Get current rate limit status for a user (useful for debugging)
 */
export function getRateLimitStatus(identifier: string): RateLimitEntry | null {
  return rateLimitCache.get(identifier) || null;
}
