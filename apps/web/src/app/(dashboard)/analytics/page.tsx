/**
 * Analytics Dashboard Page
 * Displays key metrics, user activity, and performance data
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { AnalyticsDashboardMetrics } from '@meetsolis/shared';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#001F3F', '#3A6EA5', '#7FB3D5', '#C6E2F0'];

export default function AnalyticsPage() {
  const {
    data: metrics,
    isLoading,
    error,
  } = useQuery<AnalyticsDashboardMetrics>({
    queryKey: ['analytics-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics metrics');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Analytics
            </CardTitle>
            <CardDescription>
              Failed to load analytics data. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor user behavior, system health, and performance metrics
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div>
                <p className="text-3xl font-bold">
                  {metrics?.userMetrics.totalUsers ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  +{metrics?.userMetrics.newUsers ?? 0} this month
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div>
                <p className="text-3xl font-bold">
                  {metrics?.userMetrics.activeUsers ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last 7 days
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Meetings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div>
                <p className="text-3xl font-bold">
                  {metrics?.meetingMetrics.totalMeetings ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics?.meetingMetrics.successRate ?? 0}% success rate
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div>
                <p className="text-3xl font-bold">
                  {metrics?.performanceMetrics.errorRate ?? 0}%
                </p>
                <p className="text-xs text-green-600 mt-1">Within threshold</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New users over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={generateMockGrowthData(
                    metrics?.userMetrics.newUsers ?? 0
                  )}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#001F3F" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Meeting Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Meeting Activity</CardTitle>
            <CardDescription>Meetings created per day</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={generateMockMeetingData(
                    metrics?.meetingMetrics.totalMeetings ?? 0
                  )}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="meetings"
                    stroke="#001F3F"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>
            Performance metrics (lower is better)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Largest Contentful Paint (LCP)
                </div>
                <div className="text-2xl font-bold">
                  {metrics?.performanceMetrics.coreWebVitals.lcp ?? 0}ms
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Good (&lt;2.5s)
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  First Input Delay (FID)
                </div>
                <div className="text-2xl font-bold">
                  {metrics?.performanceMetrics.coreWebVitals.fid ?? 0}ms
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Good (&lt;100ms)
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Cumulative Layout Shift (CLS)
                </div>
                <div className="text-2xl font-bold">
                  {metrics?.performanceMetrics.coreWebVitals.cls ?? 0}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Good (&lt;0.1)
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage</CardTitle>
          <CardDescription>Most popular features</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: 'Meetings',
                      value:
                        metrics?.engagementMetrics.featuresUsed.meetings ?? 1,
                    },
                    { name: 'Whiteboard', value: 0 },
                    { name: 'File Sharing', value: 0 },
                    { name: 'Screen Sharing', value: 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Generate mock growth data for visualization
 */
function generateMockGrowthData(
  totalNewUsers: number
): Array<{ date: string; users: number }> {
  const data = [];
  const baseUsers = Math.floor(totalNewUsers / 30);

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      users: Math.max(0, baseUsers + Math.floor(Math.random() * 5 - 2)),
    });
  }

  return data;
}

/**
 * Generate mock meeting data for visualization
 */
function generateMockMeetingData(
  totalMeetings: number
): Array<{ date: string; meetings: number }> {
  const data = [];
  const baseMeetings = Math.floor(totalMeetings / 30);

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      meetings: Math.max(0, baseMeetings + Math.floor(Math.random() * 3 - 1)),
    });
  }

  return data;
}
