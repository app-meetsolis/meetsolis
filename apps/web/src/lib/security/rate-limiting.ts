import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

/**
 * Rate Limiting Configuration for Edge Runtime
 * Uses Upstash Redis for edge-optimized performance
 */

// Initialize Redis client for rate limiting
const redis = Redis.fromEnv();

/**
 * Different rate limits for different types of requests
 */
export const rateLimiters = {
  // General API routes: 100 requests per minute per user
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '60s'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),

  // Authentication routes: 1000 requests per hour per user
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '3600s'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),

  // Anonymous requests (by IP): 50 requests per minute
  anonymous: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '60s'),
    analytics: true,
    prefix: 'ratelimit:anon',
  }),

  // Strict rate limiting for sensitive operations: 10 per minute
  strict: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60s'),
    analytics: true,
    prefix: 'ratelimit:strict',
  }),
};

/**
 * Get identifier for rate limiting (user ID or IP address)
 */
export function getRateLimitIdentifier(
  request: NextRequest,
  userId?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Use IP address for anonymous requests
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || '127.0.0.1';
  return `ip:${ip}`;
}

/**
 * Check rate limit and return appropriate headers
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  headers: Record<string, string>;
}> {
  const result = await limiter.limit(identifier);

  const headers = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: new Date(result.reset),
    headers,
  };
}

/**
 * Rate limiting middleware for API routes
 */
export async function withRateLimit(
  request: NextRequest,
  limiterType: keyof typeof rateLimiters = 'api',
  userId?: string
) {
  // Skip rate limiting for health check endpoints
  if (request.nextUrl.pathname === '/api/health') {
    return { success: true, headers: {} };
  }

  const identifier = getRateLimitIdentifier(request, userId);
  const limiter = rateLimiters[limiterType];

  return await checkRateLimit(limiter, identifier);
}

/**
 * Rate limiting error response
 */
export function createRateLimitResponse(resetTime: Date) {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      resetTime: resetTime.toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil(
          (resetTime.getTime() - Date.now()) / 1000
        ).toString(),
      },
    }
  );
}

/**
 * Enhanced middleware with rate limiting for specific route patterns
 */
export function getRateLimiterForRoute(
  pathname: string
): keyof typeof rateLimiters {
  // Authentication routes get higher limits
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/user/login')
  ) {
    return 'auth';
  }

  // Sensitive operations get strict limits
  if (
    pathname.includes('/delete') ||
    pathname.includes('/admin') ||
    pathname.startsWith('/api/user/delete')
  ) {
    return 'strict';
  }

  // Default API rate limiting
  if (pathname.startsWith('/api/')) {
    return 'api';
  }

  // Anonymous rate limiting for everything else
  return 'anonymous';
}
