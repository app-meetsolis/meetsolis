/**
 * VideoTile Component
 * Displays individual participant video stream with connection indicators
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ConnectionQuality } from '../../../../../packages/shared/types/webrtc';

export interface VideoTileProps {
  stream: MediaStream | null;
  participantName: string;
  participantId: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  connectionQuality?: ConnectionQuality;
  isSpeaking?: boolean;
  className?: string;
  onVideoClick?: (participantId: string) => void;
}

/**
 * VideoTile Component
 */
export function VideoTile({
  stream,
  participantName,
  participantId,
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
  connectionQuality = 'good',
  isSpeaking = false,
  className = '',
  onVideoClick,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  /**
   * Attach stream to video element
   */
  useEffect(() => {
    console.log(`[VideoTile] ${participantName}:`, {
      hasStream: !!stream,
      streamId: stream?.id,
      audioTracks: stream?.getAudioTracks().length ?? 0,
      videoTracks: stream?.getVideoTracks().length ?? 0,
      isLocal,
    });

    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      setIsVideoLoaded(true);
      console.log(`[VideoTile] ${participantName}: Video attached to element`);
    } else {
      setIsVideoLoaded(false);
      if (!stream) {
        console.warn(`[VideoTile] ${participantName}: No stream available`);
      }
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream, participantName, isLocal]);

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
   * Handle tile click
   */
  const handleClick = () => {
    if (onVideoClick) {
      onVideoClick(participantId);
    }
  };

  return (
    <div
      className={cn(
        'relative bg-gray-900 rounded-lg overflow-hidden aspect-video group',
        onVideoClick && 'cursor-pointer hover:ring-2 hover:ring-blue-500',
        isSpeaking && 'ring-2 ring-green-500 animate-pulse',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={onVideoClick ? 0 : -1}
      aria-label={`Video feed for ${participantName}${isLocal ? ' (You)' : ''}${isSpeaking ? ' - Speaking' : ''}`}
      onKeyDown={e => {
        if (onVideoClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local video to prevent echo
        className={cn('w-full h-full object-cover', isVideoOff && 'hidden')}
        aria-hidden={isVideoOff}
      />

      {/* Avatar fallback when video is off */}
      {(isVideoOff || !isVideoLoaded) && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900"
          role="img"
          aria-label={`Avatar for ${participantName}`}
        >
          <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl md:text-4xl font-bold">
            {getInitials(participantName)}
          </div>
        </div>
      )}

      {/* Participant info overlay - bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm md:text-base truncate max-w-[150px] md:max-w-[200px]">
              {participantName}
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
        <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 rounded text-white text-xs font-medium">
          You
        </div>
      )}

      {/* Loading spinner */}
      {!isVideoLoaded && stream && !isVideoOff && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"
            role="status"
            aria-label="Loading video"
          >
            <span className="sr-only">Loading video...</span>
          </div>
        </div>
      )}
    </div>
  );
}
