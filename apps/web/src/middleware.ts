import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getSecurityHeaders } from './lib/security/headers';
import {
  withRateLimit,
  createRateLimitResponse,
  getRateLimiterForRoute,
} from './lib/security/rate-limiting';

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/privacy',
  '/terms',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  const isProtectedRoute =
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/clients') ||
    req.nextUrl.pathname.startsWith('/intelligence') ||
    req.nextUrl.pathname.startsWith('/settings') ||
    req.nextUrl.pathname.startsWith('/analytics') ||
    req.nextUrl.pathname.startsWith('/admin') ||
    req.nextUrl.pathname.startsWith('/onboarding') ||
    (req.nextUrl.pathname.startsWith('/api/') &&
      !req.nextUrl.pathname.startsWith('/api/webhooks'));

  if (isProtectedRoute && !userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Onboarding hard enforcement
  const hardEnforcementEnabled =
    process.env.NEXT_PUBLIC_ONBOARDING_HARD_ENFORCEMENT === 'true';

  if (hardEnforcementEnabled && userId) {
    const isOnboardingRoute = req.nextUrl.pathname.startsWith('/onboarding');
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isApiRoute = req.nextUrl.pathname.startsWith('/api');
    const shouldEnforceOnboarding =
      isProtectedRoute && !isOnboardingRoute && !isAdminRoute && !isApiRoute;

    if (shouldEnforceOnboarding) {
      const onboardingComplete =
        req.cookies.get('onboarding_complete')?.value === 'true';

      if (!onboardingComplete) {
        const userRole = (sessionClaims?.role as string) || 'user';
        if (!['admin', 'support'].includes(userRole)) {
          const onboardingUrl = new URL('/onboarding', req.url);
          onboardingUrl.searchParams.set('enforced', 'true');
          return NextResponse.redirect(onboardingUrl);
        }
      }
    }
  }

  // Rate limiting for API routes
  if (
    req.nextUrl.pathname.startsWith('/api/') &&
    !req.nextUrl.pathname.startsWith('/api/webhooks/')
  ) {
    const limiterType = getRateLimiterForRoute(req.nextUrl.pathname);
    try {
      const rateLimit = await withRateLimit(req, limiterType);
      if (!rateLimit.success && 'reset' in rateLimit) {
        const response = createRateLimitResponse(rateLimit.reset);
        Object.entries(rateLimit.headers).forEach(([k, v]) =>
          response.headers.set(k, v)
        );
        Object.entries(getSecurityHeaders()).forEach(([k, v]) =>
          response.headers.set(k, v)
        );
        return response;
      }
      const response = NextResponse.next();
      Object.entries(rateLimit.headers).forEach(([k, v]) =>
        response.headers.set(k, v)
      );
      Object.entries(getSecurityHeaders()).forEach(([k, v]) =>
        response.headers.set(k, v)
      );
      return response;
    } catch (error) {
      console.error('Rate limiting error:', error);
    }
  }

  const response = NextResponse.next();
  Object.entries(getSecurityHeaders()).forEach(([k, v]) =>
    response.headers.set(k, v)
  );
  return response;
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
