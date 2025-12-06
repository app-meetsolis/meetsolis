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

    // Determine grid layout based on participant count (Google Meet/Zoom style)
    const getGridClass = () => {
      const count = participants.length;

      // 1 participant: Full screen
      if (count === 1) return 'grid-cols-1';

      // 2 participants: Side by side (2 columns)
      if (count === 2) return 'grid-cols-2';

      // 3-4 participants: 2x2 grid
      if (count <= 4) return 'grid-cols-2';

      // 5-9 participants: 3x3 grid
      if (count <= 9) return 'grid-cols-3';

      // 10-25 participants: 5x5 grid (smaller tiles)
      if (count <= 25) return 'grid-cols-5';

      // 26+ participants: 6 columns (very small tiles)
      return 'grid-cols-6';
    };

    return (
      <div
        className={cn(
          'grid gap-3 h-full w-full p-4 overflow-y-auto place-items-center',
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
          />
        ))}
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
