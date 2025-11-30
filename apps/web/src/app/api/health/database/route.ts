import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';

/**
 * GET /api/health/database
 * Health check endpoint for database service (Supabase)
 */
export async function GET() {
  try {
    if (!config.supabase.url || !config.supabase.serviceRoleKey) {
      return NextResponse.json(
        {
          service: 'database',
          health: {
            status: 'unavailable',
            error: 'Supabase not configured',
          },
        },
        { status: 503 }
      );
    }

    // Create Supabase client and test connection
    const supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    );

    // Simple query to verify database connectivity
    const { error } = await supabase.from('users').select('count').limit(1);

    if (error) {
      return NextResponse.json(
        {
          service: 'database',
          health: { status: 'degraded', error: error.message },
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      service: 'database',
      health: { status: 'healthy' },
      provider: 'Supabase',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database service health check error:', error);

    return NextResponse.json(
      {
        service: 'database',
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
