/**
 * SpeakerView Component
 * Speaker-focused layout with main speaker (top) and bottom filmstrip
 *
 * Priority logic for main speaker:
 * 1. Spotlight (host-set, global) - highest priority
 * 2. Pin (user-set, local only)
 * 3. Active speaker (isSpeaking from Stream SDK)
 * 4. First participant (fallback)
 */

'use client';

import React, { useMemo } from 'react';
import type { StreamVideoParticipant } from '@stream-io/video-react-sdk';
import { StreamVideoTile } from './StreamVideoTile';
import { cn } from '@/lib/utils';

export interface SpeakerViewProps {
  /**
   * All participants in the meeting (from Stream SDK)
   */
  participants: StreamVideoParticipant[];

  /**
   * ID of participant currently spotlighted by host (global, persisted to DB)
   * Highest priority - overrides pin and active speaker
   */
  spotlightId?: string | null;

  /**
   * ID of participant pinned by local user (session-only)
   * Second priority - overrides active speaker but not spotlight
   */
  pinnedId?: string | null;

  /**
   * Optional click handler for participant tiles
   */
  onParticipantClick?: (participantId: string) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SpeakerView Component
 *
 * Renders a speaker-focused layout with:
 * - Main speaker area (flex-1): Large video tile with padding
 * - Thumbnail filmstrip (150px height): Horizontal scrollable strip at bottom
 *
 * @example
 * ```typescript
 * const participants = useParticipants();
 * const { layoutConfig } = useLayoutConfig();
 *
 * <SpeakerView
 *   participants={participants}
 *   spotlightId={layoutConfig.spotlightParticipantId}
 *   pinnedId={layoutConfig.pinnedParticipantId}
 *   onParticipantClick={handlePin}
 * />
 * ```
 */
export function SpeakerView({
  participants,
  spotlightId,
  pinnedId,
  onParticipantClick,
  className,
}: SpeakerViewProps) {
  /**
   * Determine main speaker based on priority logic
   * Priority: spotlight > pin > active speaker > first participant
   */
  const { mainSpeaker, thumbnails } = useMemo(() => {
    if (participants.length === 0) {
      return { mainSpeaker: null, thumbnails: [] };
    }

    let main: StreamVideoParticipant | null = null;
    let thumbs: StreamVideoParticipant[] = [];

    // Priority 1: Spotlight (host-set, global)
    if (spotlightId) {
      main = participants.find(p => p.userId === spotlightId) || null;
    }

    // Priority 2: Pin (user-set, local)
    if (!main && pinnedId) {
      main = participants.find(p => p.userId === pinnedId) || null;
    }

    // Priority 3: Active speaker (isSpeaking flag from Stream SDK)
    if (!main) {
      main = participants.find(p => p.isSpeaking) || null;
    }

    // Priority 4: First participant (fallback)
    if (!main) {
      main = participants[0];
    }

    // All other participants go to thumbnails
    thumbs = participants.filter(p => p.userId !== main?.userId);

    return { mainSpeaker: main, thumbnails: thumbs };
  }, [participants, spotlightId, pinnedId]);

  // Handle empty state
  if (!mainSpeaker) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-gray-900 text-gray-400',
          className
        )}
      >
        <p className="text-lg">No participants in the meeting</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Main speaker area (flex-1) - with padding */}
      <div className="relative flex-1 flex items-center justify-center bg-gray-900 p-4 md:p-6">
        <div className="w-full h-full max-w-6xl max-h-[85vh] mx-auto rounded-lg overflow-hidden">
          <StreamVideoTile
            participant={mainSpeaker}
            onVideoClick={
              onParticipantClick
                ? () => onParticipantClick(mainSpeaker!.userId)
                : undefined
            }
            className="w-full h-full"
          />
        </div>

        {/* Spotlight indicator badge (top-right) */}
        {spotlightId && spotlightId === mainSpeaker.userId && (
          <div className="absolute top-8 right-8 px-3 py-1.5 bg-yellow-500 rounded-full text-white text-sm font-semibold shadow-lg z-30 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span>Spotlighted</span>
          </div>
        )}

        {/* Pin indicator badge (top-right, if not spotlighted) */}
        {pinnedId && pinnedId === mainSpeaker.userId && !spotlightId && (
          <div className="absolute top-8 right-8 px-3 py-1.5 bg-blue-500 rounded-full text-white text-sm font-semibold shadow-lg z-30 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
            <span>Pinned</span>
          </div>
        )}
      </div>

      {/* Bottom filmstrip (150px height) - horizontal scrollable */}
      {thumbnails.length > 0 && (
        <div className="h-[150px] bg-gray-800/50 px-4 pb-2 pt-3">
          <div className="text-gray-300 text-sm font-medium mb-2">
            Other Participants ({thumbnails.length})
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {thumbnails.map(participant => (
              <div
                key={participant.sessionId}
                className="flex-shrink-0 w-[200px] h-[100px]"
              >
                <StreamVideoTile
                  participant={participant}
                  onVideoClick={
                    onParticipantClick
                      ? () => onParticipantClick(participant.userId)
                      : undefined
                  }
                  className="w-full h-full rounded-lg overflow-hidden"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
