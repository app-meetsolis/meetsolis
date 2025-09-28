import { NextResponse } from 'next/server';
import { ServiceFactory } from '@/lib/service-factory';

export async function GET() {
  try {
    const authService = ServiceFactory.createAuthService();
    const healthCheck = await authService.healthCheck();
    const serviceInfo = authService.getServiceInfo();

    const response = {
      service: 'auth',
      ...serviceInfo,
      health: healthCheck,
      fallbackMode: authService.fallbackMode(),
      circuitBreakerState: authService.getCircuitBreakerState(),
      timestamp: new Date().toISOString(),
    };

    const status = healthCheck.status === 'healthy' ? 200 : 503;
    return NextResponse.json(response, { status });
  } catch (error) {
    console.error('Auth service health check error:', error);

    return NextResponse.json(
      {
        service: 'auth',
        health: {
          status: 'unavailable',
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: new Date(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
