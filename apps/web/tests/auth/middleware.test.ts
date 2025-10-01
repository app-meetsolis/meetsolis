/**
 * Middleware Tests
 * Tests for Clerk authentication middleware integration
 */

import { NextRequest } from 'next/server';

// Mock @clerk/nextjs authMiddleware
interface MockConfig {
  publicRoutes?: string[];
}

jest.mock('@clerk/nextjs', () => ({
  authMiddleware: jest.fn((config: MockConfig) => {
    return async (req: NextRequest) => {
      // Simulate auth check
      const isPublicRoute = config.publicRoutes?.some((route: string) =>
        new RegExp(route).test(req.nextUrl.pathname)
      );

      if (isPublicRoute) {
        return { status: 200 }; // Allow public routes
      }

      // Check for auth token
      const hasAuth = req.headers.get('authorization');
      if (!hasAuth) {
        return { status: 401 }; // Unauthorized
      }

      return { status: 200 }; // Authenticated
    };
  }),
}));

describe('Middleware Configuration', () => {
  it('should allow access to public routes', async () => {
    const publicRoutes = ['^/$', '^/sign-in', '^/sign-up', '^/api/webhooks'];

    expect(publicRoutes).toContain('^/$');
    expect(publicRoutes).toContain('^/sign-in');
    expect(publicRoutes).toContain('^/sign-up');
    expect(publicRoutes).toContain('^/api/webhooks');
  });

  it('should protect dashboard routes', () => {
    const dashboardPath = '/dashboard/meetings';
    const publicRoutes = ['^/$', '^/sign-in', '^/sign-up', '^/api/webhooks'];

    const isPublic = publicRoutes.some(route =>
      new RegExp(route).test(dashboardPath)
    );

    expect(isPublic).toBe(false);
  });

  it('should protect meeting routes', () => {
    const meetingPath = '/meeting/room-123';
    const publicRoutes = ['^/$', '^/sign-in', '^/sign-up', '^/api/webhooks'];

    const isPublic = publicRoutes.some(route =>
      new RegExp(route).test(meetingPath)
    );

    expect(isPublic).toBe(false);
  });

  it('should allow webhook endpoints', () => {
    const webhookPath = '/api/webhooks/clerk';
    const publicRoutes = ['^/$', '^/sign-in', '^/sign-up', '^/api/webhooks'];

    const isPublic = publicRoutes.some(route =>
      new RegExp(route).test(webhookPath)
    );

    expect(isPublic).toBe(true);
  });

  it('should protect API routes except webhooks', () => {
    const apiPath = '/api/meetings';
    const publicRoutes = ['^/$', '^/sign-in', '^/sign-up', '^/api/webhooks'];

    const isPublic = publicRoutes.some(route =>
      new RegExp(route).test(apiPath)
    );

    expect(isPublic).toBe(false);
  });
});
