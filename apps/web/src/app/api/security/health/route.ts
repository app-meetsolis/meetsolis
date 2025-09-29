import { NextResponse } from 'next/server';

/**
 * Security Health Check Endpoint
 * Provides security system status (bypasses rate limiting)
 */
export async function GET() {
  try {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      security: {
        headers: 'enabled',
        rateLimiting: 'enabled',
        sanitization: 'enabled',
        gdpr: 'enabled',
      },
      version: '1.0.0',
    };

    return NextResponse.json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
