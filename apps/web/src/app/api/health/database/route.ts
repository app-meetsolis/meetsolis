import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/lib/service-factory';

export async function GET(request: NextRequest) {
  try {
    const dbService = ServiceFactory.createDatabaseService();
    const healthCheck = await dbService.healthCheck();
    const serviceInfo = dbService.getServiceInfo();

    const response = {
      service: 'database',
      ...serviceInfo,
      health: healthCheck,
      fallbackMode: dbService.fallbackMode(),
      circuitBreakerState: dbService.getCircuitBreakerState(),
      timestamp: new Date().toISOString(),
    };

    const status = healthCheck.status === 'healthy' ? 200 : 503;
    return NextResponse.json(response, { status });

  } catch (error) {
    console.error('Database service health check error:', error);

    return NextResponse.json({
      service: 'database',
      health: {
        status: 'unavailable',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date(),
      },
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}