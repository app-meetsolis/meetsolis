/**
 * MetricsPreview Component
 * Display meeting performance metrics (placeholder for Epic 4)
 */

'use client';

import { Clock, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="text-[#00A0B0]">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="mt-1 text-xs text-gray-500">{trend}</p>}
      </CardContent>
    </Card>
  );
}

interface MetricsPreviewProps {
  isLoading?: boolean;
}

export function MetricsPreview({ isLoading = false }: MetricsPreviewProps) {
  // Mock data - actual metrics will come from Epic 4 analytics
  const metrics = {
    totalMeetings: 24,
    meetingHours: 18.5,
    averageDuration: 46,
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Meeting Metrics</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Total Meetings"
          value={metrics.totalMeetings}
          icon={<Users className="h-5 w-5" />}
          trend="+12% from last month"
        />
        <MetricCard
          title="Meeting Hours"
          value={`${metrics.meetingHours}h`}
          icon={<Clock className="h-5 w-5" />}
          trend="Across all meetings"
        />
        <MetricCard
          title="Avg. Duration"
          value={`${metrics.averageDuration} min`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="Per meeting"
        />
      </div>
      <p className="text-sm text-gray-500">
        * Detailed analytics will be available in Epic 4
      </p>
    </div>
  );
}
