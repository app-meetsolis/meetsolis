import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { getSecurityHeaders } from './lib/security/headers';
import {
  withRateLimit,
  createRateLimitResponse,
  getRateLimiterForRoute,
} from './lib/security/rate-limiting';

/**
 * Next.js Middleware with Clerk Authentication, Security Headers, and Rate Limiting
 * Integrates Clerk auth with existing security infrastructure from Story 1.2
 */
export default authMiddleware({
  // Public routes accessible without authentication
  publicRoutes: [
    '/',
    '/about',
    '/privacy',
    '/terms',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
    '/admin/services', // Admin page
  ],

  // Custom handler to integrate rate limiting and security headers
  async afterAuth(auth, req) {
    // Check if user is accessing a protected route without authentication
    const isProtectedRoute =
      req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/meeting') ||
      req.nextUrl.pathname.startsWith('/onboarding') ||
      (req.nextUrl.pathname.startsWith('/api/') &&
        !req.nextUrl.pathname.startsWith('/api/webhooks'));

    if (isProtectedRoute && !auth.userId) {
      // Redirect to sign-in page with return URL
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // =============================================================================
    // HARD ENFORCEMENT: Onboarding Completion Check (Story 1.9)
    // =============================================================================
    const hardEnforcementEnabled =
      process.env.NEXT_PUBLIC_ONBOARDING_HARD_ENFORCEMENT === 'true';

    if (hardEnforcementEnabled && auth.userId) {
      const isOnboardingRoute = req.nextUrl.pathname.startsWith('/onboarding');
      const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
      const isApiRoute = req.nextUrl.pathname.startsWith('/api');

      // Only enforce on protected routes (not onboarding, admin, or API routes)
      const shouldEnforceOnboarding =
        isProtectedRoute && !isOnboardingRoute && !isAdminRoute && !isApiRoute;

      if (shouldEnforceOnboarding) {
        // Check localStorage via cookie or query param (since middleware can't access localStorage)
        // In production, this would check the database with caching
        // For now, gracefully degrade if we can't determine status
        const onboardingComplete =
          req.cookies.get('onboarding_complete')?.value === 'true';

        if (!onboardingComplete) {
          // Check if user is exempt (admin, power user, support team)
          const userRole = (auth.sessionClaims?.role as string) || 'user';
          const exemptRoles = ['admin', 'support'];

          if (!exemptRoles.includes(userRole)) {
            // Redirect to onboarding
            const onboardingUrl = new URL('/onboarding', req.url);
            onboardingUrl.searchParams.set('enforced', 'true');
            return NextResponse.redirect(onboardingUrl);
          }
        }
      }
    }

    // Apply rate limiting to API routes (except webhooks)
    if (
      req.nextUrl.pathname.startsWith('/api/') &&
      !req.nextUrl.pathname.startsWith('/api/webhooks/')
    ) {
      const limiterType = getRateLimiterForRoute(req.nextUrl.pathname);

      try {
        const rateLimit = await withRateLimit(req, limiterType);

        if (!rateLimit.success && 'reset' in rateLimit) {
          const response = createRateLimitResponse(rateLimit.reset);
          // Apply rate limit headers even to error responses
          Object.entries(rateLimit.headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });

          // Apply security headers
          const securityHeaders = getSecurityHeaders();
          Object.entries(securityHeaders).forEach(([key, value]) => {
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

    // For all routes, apply security headers
    const response = NextResponse.next();
    const headers = getSecurityHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  },
});

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
