/**
 * StreamVideoCallManagerV2 Component
 * Simplified video call manager using Stream SDK's native React hooks
 *
 * This version uses Stream's built-in hooks and components for proper integration.
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { useCallStateHooks, useCall } from '@stream-io/video-react-sdk';
import type { StreamVideoParticipant } from '@stream-io/video-react-sdk';
import { StreamVideoTile } from './StreamVideoTile';
import { StreamControlBar } from './StreamControlBar';
import { cn } from '@/lib/utils';
import { mapConnectionQuality } from '@/lib/stream/utils';

export interface StreamVideoCallManagerV2Props {
  className?: string;
  onParticipantClick?: (participantId: string) => void;
  onLeaveMeeting?: () => void;
  onOpenSettings?: () => void;
}

/**
 * StreamVideoCallManagerV2 Component
 * Uses Stream SDK hooks for participant management
 */
export function StreamVideoCallManagerV2({
  className = '',
  onParticipantClick,
  onLeaveMeeting,
  onOpenSettings,
}: StreamVideoCallManagerV2Props) {
  const call = useCall();
  const {
    useParticipants,
    useLocalParticipant,
    useCallCallingState,
    useMicrophoneState,
    useCameraState,
  } = useCallStateHooks();

  // Get participants from Stream hooks
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const callingState = useCallCallingState();

  // Get local audio/video state for accurate icon display
  const { isMute: isLocalAudioMuted } = useMicrophoneState();
  const { isMute: isLocalVideoOff } = useCameraState();

  /**
   * Log participant updates
   */
  useEffect(() => {
    console.log('[StreamVideoCallManagerV2] Participants updated:', {
      count: participants.length,
      participants: participants.map(p => ({
        userId: p.userId,
        name: p.name,
        isLocal: p.isLocalParticipant,
        publishedTracks: p.publishedTracks,
        isSpeaking: p.isSpeaking,
      })),
    });
  }, [participants]);

  /**
   * Log calling state changes
   */
  useEffect(() => {
    console.log('[StreamVideoCallManagerV2] Calling state:', callingState);
  }, [callingState]);

  /**
   * Handle participant click
   */
  const handleParticipantClick = useCallback(
    (participantId: string) => {
      console.log(
        '[StreamVideoCallManagerV2] Participant clicked:',
        participantId
      );
      onParticipantClick?.(participantId);
    },
    [onParticipantClick]
  );

  /**
   * Create participant click handler with participant ID
   */
  const createClickHandler = (participantId: string) => () => {
    handleParticipantClick(participantId);
  };

  // Show loading state
  if (!call || callingState !== 'joined') {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p>
            {callingState === 'joining' ? 'Joining call...' : 'Connecting...'}
          </p>
        </div>
      </div>
    );
  }

  /**
   * Render participant grid
   */
  const renderParticipantGrid = () => {
    if (participants.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-white text-lg">No participants yet</p>
        </div>
      );
    }

    // Determine grid layout based on participant count (Responsive Adaptive Grid)
    const getGridClass = () => {
      const count = participants.length;

      // 1 participant: Single column
      if (count === 1) return 'grid-cols-1';

      // 2 participants: Responsive
      // Mobile: 1 column (stacked), Desktop: 2 columns (side by side)
      if (count === 2) return 'grid-cols-1 lg:grid-cols-2';

      // 3-4 participants: Responsive 2x2 grid
      // Mobile: 1 column, Desktop: 2 columns
      if (count <= 4) return 'grid-cols-1 lg:grid-cols-2';

      // 5-9 participants: Responsive 3x3 grid
      // Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
      if (count <= 9) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

      // 10-16 participants: Responsive 4x4 grid
      // Mobile: 2 columns, Tablet: 3 columns, Desktop: 4 columns
      if (count <= 16) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

      // 17-25 participants: Responsive 5x5 grid
      // Mobile: 2 columns, Tablet: 3 columns, Desktop: 5 columns
      if (count <= 25) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';

      // 26+ participants: Responsive 6 columns max
      // Mobile: 2 columns, Tablet: 4 columns, Desktop: 6 columns
      return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6';
    };

    // Get container max-width based on participant count
    const getMaxWidth = () => {
      const count = participants.length;
      if (count === 1) return 'max-w-4xl'; // Single: larger container
      if (count === 2) return 'max-w-6xl'; // Two: wider container
      return 'max-w-7xl'; // Multiple: full width
    };

    return (
      <div
        className={cn(
          // Centered container with responsive padding
          'flex items-center justify-center h-full w-full',
          'px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10'
        )}
      >
        <div
          className={cn(
            // Grid with responsive gap and max-width
            'grid w-full overflow-y-auto',
            'gap-3 md:gap-4 lg:gap-6',
            // Center content
            'place-content-center place-items-center',
            // Max width based on participant count
            getMaxWidth(),
            getGridClass()
          )}
          style={{
            gridAutoRows: 'minmax(0, 1fr)',
          }}
        >
          {participants.map(participant => (
            <StreamVideoTile
              key={participant.sessionId}
              participant={participant}
              connectionQuality={mapConnectionQuality(
                participant.connectionQuality
              )}
              onVideoClick={
                onParticipantClick
                  ? createClickHandler(participant.userId)
                  : undefined
              }
              // Pass actual state for local participant
              overrideAudioMuted={
                participant.isLocalParticipant ? isLocalAudioMuted : undefined
              }
              overrideVideoOff={
                participant.isLocalParticipant ? isLocalVideoOff : undefined
              }
              // No longer need single participant flag - use proper container sizing instead
              isSingleParticipant={false}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={cn('w-full h-full bg-gray-950', className)}
        role="main"
        aria-label="Video call"
      >
        {renderParticipantGrid()}

        {/* Connection state indicator */}
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {callingState === 'joined' && 'Connected to video call'}
          {callingState === 'joining' && 'Joining video call...'}
          {callingState === 'left' && 'Left video call'}
        </div>
      </div>

      {/* Control Bar - inside Stream context */}
      <StreamControlBar
        onLeaveMeeting={onLeaveMeeting}
        onOpenSettings={onOpenSettings}
      />
    </>
  );
}
