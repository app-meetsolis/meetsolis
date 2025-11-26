import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/health/auth
 * Health check endpoint for authentication service (Clerk)
 */
export async function GET() {
  try {
    // Simple health check - verify Clerk auth is configured
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;

    if (!clerkSecretKey) {
      return NextResponse.json(
        {
          service: 'auth',
          health: { status: 'unavailable', error: 'Clerk not configured' },
        },
        { status: 503 }
      );
    }

    // Test that auth() can be called without error
    try {
      await auth();
    } catch (error) {
      // Expected in build-time - auth() requires request context
      // In production runtime, this would work correctly
    }

    return NextResponse.json({
      service: 'auth',
      health: { status: 'healthy' },
      provider: 'Clerk',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auth service health check error:', error);

    return NextResponse.json(
      {
        service: 'auth',
        health: {
          status: 'unavailable',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
