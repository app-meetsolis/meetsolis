/**
 * Onboarding Metrics Dashboard
 * Story 1.9: Onboarding Completion Enforcement & Optimization
 *
 * Admin dashboard showing onboarding completion metrics and banner effectiveness
 */

'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// TYPES
// =============================================================================

interface OnboardingMetrics {
  completionRate: number;
  completionRateTrend: 'up' | 'down' | 'stable';
  avgTimeToComplete: string;
  timeTrend: 'up' | 'down' | 'stable';
  bannerCTR: number;
  bannerCTRTrend: 'up' | 'down' | 'stable';
  totalUsers: number;
  completedUsers: number;
  incompleteUsers: number;
  dailyCompletionRates: Array<{ date: string; rate: number }>;
  dropOffPoints: Array<{ step: string; count: number; percentage: number }>;
}

// =============================================================================
// METRIC CARD COMPONENT
// =============================================================================

interface MetricCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  target?: string;
  description?: string;
}

function MetricCard({
  title,
  value,
  trend,
  target,
  description,
}: MetricCardProps) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up'
      ? 'text-green-600'
      : trend === 'down'
        ? 'text-red-600'
        : 'text-gray-600';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TrendIcon className={`h-4 w-4 ${trendColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {target && (
          <p className="text-xs text-muted-foreground mt-1">Target: {target}</p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// COMPLETION RATE CHART (Simple Bar Chart)
// =============================================================================

interface CompletionRateChartProps {
  data: Array<{ date: string; rate: number }>;
}

function CompletionRateChart({ data }: CompletionRateChartProps) {
  const maxRate = Math.max(...data.map(d => d.rate), 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Completion Rates</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.slice(-7).map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="text-sm w-24 text-muted-foreground">
                {item.date}
              </div>
              <div className="flex-1">
                <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${(item.rate / maxRate) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-sm font-medium w-16 text-right">
                {item.rate.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// DROP-OFF CHART
// =============================================================================

interface DropOffChartProps {
  data: Array<{ step: string; count: number; percentage: number }>;
}

function DropOffChart({ data }: DropOffChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drop-Off Points</CardTitle>
        <CardDescription>Where users abandon onboarding</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium capitalize">
                  {item.step.replace('-', ' ')}
                </span>
                <span className="text-muted-foreground">
                  {item.count} users ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function OnboardingMetricsPage() {
  const [metrics, setMetrics] = useState<OnboardingMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      setIsLoading(true);

      // In real implementation, this would call an API endpoint
      // For now, we'll generate mock data
      const mockMetrics: OnboardingMetrics = {
        completionRate: 73.5,
        completionRateTrend: 'up',
        avgTimeToComplete: '2m 45s',
        timeTrend: 'down',
        bannerCTR: 18.2,
        bannerCTRTrend: 'up',
        totalUsers: 250,
        completedUsers: 184,
        incompleteUsers: 66,
        dailyCompletionRates: generateMockDailyRates(),
        dropOffPoints: [
          { step: 'permissions', count: 35, percentage: 14.0 },
          { step: 'profile', count: 18, percentage: 7.2 },
          { step: 'first-meeting', count: 13, percentage: 5.2 },
        ],
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function generateMockDailyRates() {
    const rates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      rates.push({
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        rate: 65 + Math.random() * 15,
      });
    }
    return rates;
  }

  async function handleExport(format: 'csv' | 'json') {
    if (!metrics) return;

    const data = {
      timestamp: new Date().toISOString(),
      metrics: metrics,
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      downloadBlob(blob, `onboarding-metrics-${Date.now()}.json`);
    } else {
      // Simple CSV export
      const csv = [
        'Metric,Value',
        `Completion Rate,${metrics.completionRate}%`,
        `Total Users,${metrics.totalUsers}`,
        `Completed Users,${metrics.completedUsers}`,
        `Incomplete Users,${metrics.incompleteUsers}`,
        `Banner CTR,${metrics.bannerCTR}%`,
        `Avg Time to Complete,${metrics.avgTimeToComplete}`,
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      downloadBlob(blob, `onboarding-metrics-${Date.now()}.csv`);
    }
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">
          Failed to load metrics. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Onboarding Metrics</h1>
          <p className="text-muted-foreground mt-1">
            Monitor onboarding completion and banner effectiveness
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard
          title="Completion Rate"
          value={`${metrics.completionRate}%`}
          trend={metrics.completionRateTrend}
          target="80%"
          description={`${metrics.completedUsers}/${metrics.totalUsers} users`}
        />
        <MetricCard
          title="Avg. Time to Complete"
          value={metrics.avgTimeToComplete}
          trend={metrics.timeTrend}
          target="<3 min"
        />
        <MetricCard
          title="Banner CTR"
          value={`${metrics.bannerCTR}%`}
          trend={metrics.bannerCTRTrend}
          target="15%"
          description="Click-through rate"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <CompletionRateChart data={metrics.dailyCompletionRates} />
        <DropOffChart data={metrics.dropOffPoints} />
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">Total Users</div>
              <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold text-green-600">
                {metrics.completedUsers}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Incomplete</div>
              <div className="text-2xl font-bold text-orange-600">
                {metrics.incompleteUsers}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
