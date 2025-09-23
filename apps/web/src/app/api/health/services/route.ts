import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/lib/service-factory';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Get detailed service information
    const services = ServiceFactory.getAllServices();
    const healthChecks = await ServiceFactory.healthCheckAllServices();

    const serviceDetails = Object.keys(services).reduce((acc, serviceName) => {
      const service = services[serviceName];
      const healthCheck = healthChecks[serviceName];

      acc[serviceName] = {
        name: service?.getServiceInfo?.()?.name || serviceName,
        version: service?.getServiceInfo?.()?.version || 'unknown',
        description: service?.getServiceInfo?.()?.description || '',
        health: healthCheck,
        fallbackMode: service?.fallbackMode?.() || false,
        circuitBreakerState: service?.getCircuitBreakerState?.() || 'unknown',
        initialized: ServiceFactory.isServiceInitialized(serviceName),
      };

      return acc;
    }, {} as any);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      responseTime,
      serviceCount: Object.keys(serviceDetails).length,
      services: serviceDetails,
      environment: process.env.NODE_ENV,
      useMockServices: process.env.USE_MOCK_SERVICES === 'true',
    });

  } catch (error) {
    console.error('Service details error:', error);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {},
    }, { status: 500 });
  }
}