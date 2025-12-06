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
import { cn } from '@/lib/utils';
import { mapConnectionQuality } from '@/lib/stream/utils';

export interface StreamVideoCallManagerV2Props {
  className?: string;
  onParticipantClick?: (participantId: string) => void;
}

/**
 * StreamVideoCallManagerV2 Component
 * Uses Stream SDK hooks for participant management
 */
export function StreamVideoCallManagerV2({
  className = '',
  onParticipantClick,
}: StreamVideoCallManagerV2Props) {
  const call = useCall();
  const { useParticipants, useLocalParticipant, useCallCallingState } =
    useCallStateHooks();

  // Get participants from Stream hooks
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const callingState = useCallCallingState();

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

    // Determine grid layout based on participant count
    const getGridClass = () => {
      if (participants.length === 1) return 'grid-cols-1';
      if (participants.length === 2) return 'grid-cols-2';
      if (participants.length <= 4) return 'grid-cols-2 grid-rows-2';
      if (participants.length <= 6) return 'grid-cols-3 grid-rows-2';
      if (participants.length <= 9) return 'grid-cols-3 grid-rows-3';
      return 'grid-cols-4 grid-rows-3'; // 10+ participants
    };

    return (
      <div
        className={cn(
          'grid gap-2 md:gap-4 h-full w-full p-2 md:p-4',
          getGridClass()
        )}
      >
        {participants.map(participant => (
          <StreamVideoTile
            key={participant.sessionId}
            participant={participant}
            connectionQuality={mapConnectionQuality(
              participant.connectionQuality
            )}
            onVideoClick={handleParticipantClick}
          />
        ))}
      </div>
    );
  };

  return (
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
  );
}
