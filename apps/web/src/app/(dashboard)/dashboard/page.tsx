/**
 * Dashboard Page
 * Main dashboard view with meeting management
 */

'use client';

import { CreateMeetingButton } from '@/components/dashboard/CreateMeetingButton';
import { MeetingHistory } from '@/components/dashboard/MeetingHistory';
import { MetricsPreview } from '@/components/dashboard/MetricsPreview';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile, getDisplayName } from '@/hooks/useUserProfile';

export default function DashboardPage() {
  const { isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F]">
            Welcome back, {getDisplayName(profile).split(' ')[0]}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your meetings and track your productivity
          </p>
        </div>
        <CreateMeetingButton />
      </div>

      {/* Metrics Section */}
      <MetricsPreview />

      {/* Meeting History Section */}
      <MeetingHistory />
    </div>
  );
}
