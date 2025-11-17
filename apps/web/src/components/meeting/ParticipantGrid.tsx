/**
 * ParticipantGrid Component
 * Responsive grid layout for 1-4 participants with automatic layout adjustment
 */

'use client';

import React from 'react';
import { VideoTile } from './VideoTile';
import { cn } from '@/lib/utils';
import type { ConnectionQuality } from '../../../../../packages/shared/types/webrtc';

export interface Participant {
  id: string;
  name: string;
  stream: MediaStream | null;
  isLocal: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  connectionQuality: ConnectionQuality;
}

export interface ParticipantGridProps {
  participants: Participant[];
  onParticipantClick?: (participantId: string) => void;
  className?: string;
}

/**
 * Get grid layout class based on participant count
 */
function getGridLayout(count: number): string {
  switch (count) {
    case 1:
      // Single participant: centered, large
      return 'grid-cols-1 max-w-4xl mx-auto';
    case 2:
      // Two participants: side by side on desktop, stacked on mobile
      return 'grid-cols-1 md:grid-cols-2 gap-4';
    case 3:
      // Three participants: 2 on top, 1 on bottom (responsive)
      return 'grid-cols-1 md:grid-cols-2 gap-4';
    case 4:
      // Four participants: 2x2 grid
      return 'grid-cols-1 sm:grid-cols-2 gap-4';
    default:
      // More than 4: 2x2 grid (this shouldn't happen per PRD)
      return 'grid-cols-1 sm:grid-cols-2 gap-4';
  }
}

/**
 * ParticipantGrid Component
 */
export function ParticipantGrid({
  participants,
  onParticipantClick,
  className = '',
}: ParticipantGridProps) {
  const participantCount = participants.length;

  // Sort participants: local user first, then alphabetically
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.isLocal) return -1;
    if (b.isLocal) return 1;
    return a.name.localeCompare(b.name);
  });

  if (participantCount === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-gray-900 rounded-lg',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="text-center text-white">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No Participants</h3>
          <p className="text-gray-400">Waiting for others to join...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('w-full h-full p-4', className)}
      role="region"
      aria-label="Video call participants"
    >
      <div
        className={cn('grid w-full h-full', getGridLayout(participantCount))}
        style={{
          // Ensure proper aspect ratio for 3 participants (2 on top, 1 on bottom)
          gridAutoRows: participantCount === 3 ? 'minmax(0, 1fr)' : undefined,
        }}
      >
        {sortedParticipants.map(participant => (
          <div
            key={participant.id}
            className={cn(
              // Special handling for 3rd participant (center it)
              participantCount === 3 &&
                sortedParticipants.indexOf(participant) === 2 &&
                'md:col-span-2 md:max-w-lg md:mx-auto md:w-full'
            )}
          >
            <VideoTile
              stream={participant.stream}
              participantName={participant.name}
              participantId={participant.id}
              isLocal={participant.isLocal}
              isMuted={participant.isMuted}
              isVideoOff={participant.isVideoOff}
              connectionQuality={participant.connectionQuality}
              onVideoClick={onParticipantClick}
              className="w-full h-full"
            />
          </div>
        ))}
      </div>

      {/* Participant count indicator */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {participantCount === 1
          ? '1 participant in the call'
          : `${participantCount} participants in the call`}
      </div>
    </div>
  );
}
