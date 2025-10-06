/**
 * Analytics Metrics API Route
 * Provides analytics dashboard data
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import type { AnalyticsDashboardMetrics } from '@meetsolis/shared';

export const runtime = 'edge';

/**
 * GET /api/analytics/metrics
 * Fetch analytics dashboard metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Create Supabase client with service role for admin access
    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );

    // Verify user is admin (you can add admin role check here)
    const { data: user } = await supabase
      .from('users')
      .select('id, clerk_id')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // TODO: Add admin role check
    // For now, allow all authenticated users to view analytics

    // Fetch analytics metrics
    const metrics = await fetchAnalyticsMetrics(supabase);

    return NextResponse.json(metrics, { status: 200 });
  } catch (error) {
    console.error('[Analytics API] Failed to fetch metrics:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch analytics metrics',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch analytics metrics from database
 */
async function fetchAnalyticsMetrics(
  supabase: any
): Promise<AnalyticsDashboardMetrics> {
  // Get date ranges
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Fetch user metrics
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, created_at');

  const { data: recentUsers } = await supabase
    .from('users')
    .select('id')
    .gte('created_at', last30Days.toISOString());

  const { data: activeUsers } = await supabase
    .from('users')
    .select('id')
    .gte('updated_at', last7Days.toISOString());

  // Fetch meeting metrics
  const { data: allMeetings } = await supabase
    .from('meetings')
    .select('id, scheduled_at, duration, status');

  const completedMeetings =
    allMeetings?.filter((m: any) => m.status === 'completed') || [];
  const averageDuration =
    completedMeetings.length > 0
      ? completedMeetings.reduce(
          (sum: number, m: any) => sum + (m.duration || 0),
          0
        ) / completedMeetings.length
      : 0;

  const successRate =
    allMeetings && allMeetings.length > 0
      ? (completedMeetings.length / allMeetings.length) * 100
      : 100;

  // Mock performance metrics (in production, fetch from Sentry/Vercel)
  const performanceMetrics = {
    averageLoadTime: 1200, // ms
    errorRate: 0.5, // %
    apiLatency: 150, // ms
    coreWebVitals: {
      lcp: 2200, // ms
      fid: 80, // ms
      cls: 0.08,
    },
  };

  // Mock engagement metrics (in production, fetch from PostHog/Mixpanel)
  const engagementMetrics = {
    dailyActiveUsers: activeUsers?.length || 0,
    averageSessionDuration: 420, // seconds
    featuresUsed: {
      meetings: allMeetings?.length || 0,
      whiteboard: 0,
      fileSharing: 0,
      screenSharing: 0,
    },
  };

  const metrics: AnalyticsDashboardMetrics = {
    userMetrics: {
      totalUsers: allUsers?.length || 0,
      activeUsers: activeUsers?.length || 0,
      newUsers: recentUsers?.length || 0,
      retention: 75, // Mock value - in production, calculate from user activity
    },
    meetingMetrics: {
      totalMeetings: allMeetings?.length || 0,
      averageDuration: Math.round(averageDuration),
      successRate: Math.round(successRate * 10) / 10,
      recordedMeetings: 0, // Not implemented yet
    },
    performanceMetrics,
    engagementMetrics,
  };

  return metrics;
}
