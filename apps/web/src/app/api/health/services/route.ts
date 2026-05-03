import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ServiceFactory } from '@/lib/service-factory';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const healthChecks = await ServiceFactory.healthCheckAllServices();
    const statuses = Object.entries(healthChecks).reduce(
      (acc, [name, check]: [string, { status: string }]) => {
        acc[name] = check.status;
        return acc;
      },
      {} as Record<string, string>
    );

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      services: statuses,
    });
  } catch (error) {
    console.error('Service details error:', error);
    return NextResponse.json(
      { error: 'Service check failed' },
      { status: 500 }
    );
  }
}
