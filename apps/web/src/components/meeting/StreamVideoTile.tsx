/**
 * StreamVideoTile Component
 * Video tile using Stream SDK's native video rendering
 */

'use client';

import React from 'react';
import { ParticipantView } from '@stream-io/video-react-sdk';
import type { StreamVideoParticipant } from '@stream-io/video-react-sdk';
import { cn } from '@/lib/utils';
import type { ConnectionQuality } from '../../../../../packages/shared/types/webrtc';

export interface StreamVideoTileProps {
  participant: StreamVideoParticipant;
  connectionQuality?: ConnectionQuality;
  className?: string;
  onVideoClick?: () => void;
  overrideAudioMuted?: boolean;
  overrideVideoOff?: boolean;
}

/**
 * Get participant initials for avatar
 */
const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * Avatar Placeholder Component
 * Used when video is off - wrapped with forwardRef for ParticipantView
 */
const AvatarPlaceholder = React.forwardRef<
  HTMLDivElement,
  { name: string; userId: string }
>(({ name, userId }, ref) => (
  <div
    ref={ref}
    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900"
  >
    <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl md:text-4xl font-bold">
      {getInitials(name || userId)}
    </div>
  </div>
));

AvatarPlaceholder.displayName = 'AvatarPlaceholder';

/**
 * StreamVideoTile Component
 * Uses Stream's ParticipantView for proper video rendering
 */
export function StreamVideoTile({
  participant,
  connectionQuality = 'good',
  className = '',
  onVideoClick,
  overrideAudioMuted,
  overrideVideoOff,
}: StreamVideoTileProps) {
  const isLocal = participant.isLocalParticipant;

  // Use override state for local participant (from hooks), otherwise use publishedTracks
  const isMuted =
    overrideAudioMuted !== undefined
      ? overrideAudioMuted
      : !participant.publishedTracks?.includes('audio');

  const isVideoOff =
    overrideVideoOff !== undefined
      ? overrideVideoOff
      : !participant.publishedTracks?.includes('video');

  const isSpeaking = participant.isSpeaking || false;

  /**
   * Get connection quality color
   */
  const getConnectionColor = () => {
    switch (connectionQuality) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  /**
   * Handle tile click
   */
  const handleClick = () => {
    onVideoClick?.();
  };

  return (
    <div
      className={cn(
        'relative bg-gray-900 rounded-lg overflow-hidden group',
        'w-full aspect-video max-h-full', // 16:9 aspect ratio, don't exceed container
        onVideoClick && 'cursor-pointer hover:ring-2 hover:ring-blue-500',
        isSpeaking && 'ring-4 ring-green-500',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={onVideoClick ? 0 : -1}
      aria-label={`Video feed for ${participant.name || participant.userId}${isLocal ? ' (You)' : ''}${isSpeaking ? ' - Speaking' : ''}`}
      onKeyDown={e => {
        if (onVideoClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Stream SDK's native ParticipantView - handles video and avatar */}
      <div className="w-full h-full">
        <ParticipantView
          participant={participant}
          muteAudio={isLocal} // Mute local audio to prevent echo
          VideoPlaceholder={React.useMemo(() => {
            const Placeholder = React.forwardRef<HTMLDivElement>(
              (props, ref) => (
                <AvatarPlaceholder
                  ref={ref}
                  name={participant.name || participant.userId}
                  userId={participant.userId}
                />
              )
            );
            Placeholder.displayName = 'VideoPlaceholder';
            return Placeholder;
          }, [participant.name, participant.userId])}
        />
      </div>

      {/* Participant info overlay - bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 md:px-3 md:py-2 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-white font-medium text-xs md:text-sm truncate max-w-[120px] md:max-w-[150px]">
              {participant.name || participant.userId}
              {isLocal && ' (You)'}
            </span>

            {/* Muted indicator */}
            {isMuted && (
              <div
                className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500"
                role="status"
                aria-label="Microphone muted"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              </div>
            )}

            {/* Video off indicator */}
            {isVideoOff && (
              <div
                className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700"
                role="status"
                aria-label="Camera off"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3l18 18"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Connection quality indicator */}
          <div
            className={cn('w-2 h-2 rounded-full', getConnectionColor())}
            role="status"
            aria-label={`Connection quality: ${connectionQuality}`}
            title={`Connection: ${connectionQuality}`}
          />
        </div>
      </div>

      {/* Local video indicator - top left */}
      {isLocal && (
        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-blue-600 rounded text-white text-xs font-medium z-20">
          You
        </div>
      )}
    </div>
  );
}
