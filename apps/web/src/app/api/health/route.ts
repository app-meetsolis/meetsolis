import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/lib/service-factory';

export async function GET() {
  try {
    const startTime = Date.now();

    // Get all service health checks
    const healthChecks = await ServiceFactory.healthCheckAllServices();

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Determine overall status
    const statuses = Object.values(healthChecks).map(
      (check: any) => check.status
    );
    const hasUnavailable = statuses.includes('unavailable');
    const hasDegraded = statuses.includes('degraded');

    let overallStatus = 'healthy';
    if (hasUnavailable) {
      overallStatus = 'unavailable';
    } else if (hasDegraded) {
      overallStatus = 'degraded';
    }

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime,
      services: healthChecks,
      environment: process.env.NODE_ENV,
      useMockServices: process.env.USE_MOCK_SERVICES === 'true',
    };

    // Set appropriate HTTP status code
    const httpStatus =
      overallStatus === 'healthy'
        ? 200
        : overallStatus === 'degraded'
          ? 200
          : 503;

    return NextResponse.json(response, { status: httpStatus });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unavailable',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV,
      },
      { status: 503 }
    );
  }
}

export async function HEAD() {
  // Lightweight health check for load balancers
  try {
    const healthChecks = await ServiceFactory.healthCheckAllServices();
    const statuses = Object.values(healthChecks).map(
      (check: any) => check.status
    );
    const hasUnavailable = statuses.includes('unavailable');

    if (hasUnavailable) {
      return new NextResponse(null, { status: 503 });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
