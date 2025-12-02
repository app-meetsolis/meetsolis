/**
 * Meeting Loading Skeleton Component
 *
 * Displays a skeleton UI while the meeting is connecting.
 * Matches the layout of the actual meeting room for smooth transition.
 *
 * Shows during VideoCallManager 'connecting' state (WebRTC initialization).
 */

import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface MeetingLoadingSkeletonProps {
  className?: string;
}

export function MeetingLoadingSkeleton({
  className,
}: MeetingLoadingSkeletonProps) {
  return (
    <div
      className={cn('flex flex-col h-full bg-gray-950', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Header Skeleton */}
      <div className="flex items-center justify-between p-4 bg-gray-900/50">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Participant Grid Skeleton */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative w-full max-w-3xl aspect-video rounded-lg bg-gray-900/50 overflow-hidden">
          {/* Video placeholder */}
          <Skeleton className="absolute inset-0" />

          {/* Avatar skeleton */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>

          {/* Name label skeleton */}
          <div className="absolute bottom-4 left-4">
            <Skeleton className="h-6 w-32" />
          </div>

          {/* Connection quality indicator skeleton */}
          <div className="absolute top-4 right-4">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>

      {/* Control Bar Skeleton */}
      <div className="flex items-center justify-center gap-3 p-6 bg-gray-900/50">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

      {/* Status Text - Visible to user and screen readers */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <p className="text-white text-lg font-medium">
          Connecting to meeting...
        </p>
        <p className="text-gray-400 text-sm mt-2" aria-live="polite">
          Setting up your video and audio
        </p>
      </div>
    </div>
  );
}
