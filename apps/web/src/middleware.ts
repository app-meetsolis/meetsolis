import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHeaders } from './lib/security/headers';
import {
  withRateLimit,
  createRateLimitResponse,
  getRateLimiterForRoute,
} from './lib/security/rate-limiting';

/**
 * Next.js Middleware for Security Headers and Rate Limiting
 * Applies security headers and rate limiting to all routes
 */
export async function middleware(request: NextRequest) {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const limiterType = getRateLimiterForRoute(request.nextUrl.pathname);

    try {
      const rateLimit = await withRateLimit(request, limiterType);

      if (!rateLimit.success && 'reset' in rateLimit) {
        const response = createRateLimitResponse(rateLimit.reset);
        // Apply rate limit headers even to error responses
        Object.entries(rateLimit.headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }

      // Create response with rate limit headers
      const response = NextResponse.next();
      Object.entries(rateLimit.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Apply security headers
      const securityHeaders = getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      // If rate limiting fails, continue without it but log the error
      console.error('Rate limiting error:', error);
    }
  }

  // For non-API routes, just apply security headers
  const response = NextResponse.next();
  const headers = getSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
