/**
 * GalleryView Component
 * Responsive grid layout with equal-sized video tiles and pagination
 *
 * Grid logic:
 * - 1 participant: 1x1 (centered, max-w-4xl)
 * - 2 participants: 1x2
 * - 3-4: 2x2
 * - 5-9: 3x3
 * - 10-16: 4x4
 * - 17-25: 5x5
 *
 * Pagination: >16 participants show prev/next buttons (16 per page)
 */

'use client';

import React, { useState, useMemo } from 'react';
import type { StreamVideoParticipant } from '@stream-io/video-react-sdk';
import type { Participant } from '@meetsolis/shared';
import { StreamVideoTile } from './StreamVideoTile';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getScreenShareParticipant,
  filterRegularParticipants,
} from '@/lib/utils/screenShareHelpers';

export interface GalleryViewProps {
  /**
   * All participants in the meeting (from Stream SDK)
   */
  participants: StreamVideoParticipant[];

  /**
   * Database participants with hand raise status
   */
  dbParticipants?: Participant[];

  /**
   * Maximum number of tiles to show per page (default: 16)
   */
  maxTilesVisible?: number;

  /**
   * Hide participants who have their video off (default: false)
   */
  hideNoVideo?: boolean;

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
 * Calculate grid layout based on participant count
 */
function getGridLayout(count: number): {
  columns: number;
  rows: number;
  maxWidth?: string;
} {
  if (count === 1) {
    // Larger max-width for single participant
    return { columns: 1, rows: 1, maxWidth: '5xl' };
  }
  if (count === 2) {
    return { columns: 2, rows: 1 };
  }
  if (count <= 4) {
    return { columns: 2, rows: 2 };
  }
  if (count <= 9) {
    return { columns: 3, rows: 3 };
  }
  if (count <= 16) {
    return { columns: 4, rows: 4 };
  }
  // 17-25 participants (5x5 grid)
  return { columns: 5, rows: 5 };
}

/**
 * GalleryView Component
 *
 * Renders an equal-sized grid of video tiles with automatic layout adjustment.
 * Includes pagination for large meetings (>16 participants).
 *
 * @example
 * ```typescript
 * const participants = useParticipants();
 * const { layoutConfig } = useLayoutConfig();
 *
 * <GalleryView
 *   participants={participants}
 *   maxTilesVisible={layoutConfig.maxTilesVisible}
 *   hideNoVideo={layoutConfig.hideNoVideo}
 *   onParticipantClick={handlePin}
 * />
 * ```
 */
export function GalleryView({
  participants,
  dbParticipants = [],
  maxTilesVisible = 16,
  hideNoVideo = false,
  onParticipantClick,
  className,
}: GalleryViewProps) {
  const [currentPage, setCurrentPage] = useState(0);

  /**
   * Helper to check if participant has raised hand
   */
  const isHandRaised = (userId: string): boolean => {
    const dbParticipant = dbParticipants.find(p => p.user_id === userId);
    return dbParticipant?.hand_raised || false;
  };

  /**
   * Check for screen share - if present, show speaker-like layout
   */
  const screenShareParticipant = useMemo(() => {
    return getScreenShareParticipant(participants);
  }, [participants]);

  /**
   * Filter participants if hideNoVideo is enabled
   * If screen sharing, only show regular participants (not screen share)
   */
  const filteredParticipants = useMemo(() => {
    // If screen sharing, filter to only regular participants
    const participantsToFilter = screenShareParticipant
      ? filterRegularParticipants(participants)
      : participants;

    if (!hideNoVideo) {
      return participantsToFilter;
    }

    // Filter out participants with video off
    // Note: hasVideo() check happens in StreamVideoTile
    return participantsToFilter.filter(p => {
      // Keep local participant always visible
      if (p.isLocalParticipant) {
        return true;
      }
      // Stream SDK doesn't expose hasVideo on participant directly
      // We'll keep all participants for now - filtering can be enhanced later
      return true;
    });
  }, [participants, hideNoVideo, screenShareParticipant]);

  /**
   * Pagination logic
   */
  const { totalPages, displayedParticipants, showPagination } = useMemo(() => {
    const total = filteredParticipants.length;
    const pages = Math.ceil(total / maxTilesVisible);
    const needsPagination = total > maxTilesVisible;

    const start = currentPage * maxTilesVisible;
    const end = start + maxTilesVisible;
    const displayed = filteredParticipants.slice(start, end);

    return {
      totalPages: pages,
      displayedParticipants: displayed,
      showPagination: needsPagination,
    };
  }, [filteredParticipants, maxTilesVisible, currentPage]);

  /**
   * Grid layout calculation based on displayed participants
   */
  const gridLayout = useMemo(() => {
    return getGridLayout(displayedParticipants.length);
  }, [displayedParticipants.length]);

  /**
   * Pagination handlers
   */
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  // Handle empty state
  if (displayedParticipants.length === 0 && !screenShareParticipant) {
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

  // If screen sharing, show speaker-like layout (large screen share + filmstrip)
  if (screenShareParticipant) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        {/* Main screen share area (flex-1) */}
        <div className="relative flex-1 flex items-center justify-center bg-gray-900 p-4 md:p-6">
          <div className="w-full h-full max-w-7xl mx-auto rounded-lg overflow-hidden">
            <StreamVideoTile
              participant={screenShareParticipant}
              handRaised={false}
              className="w-full h-full"
              isSingleParticipant={filteredParticipants.length === 0}
              fillContainer
            />
          </div>
        </div>

        {/* Participant thumbnails filmstrip (if any regular participants) */}
        {filteredParticipants.length > 0 && (
          <div className="h-36 md:h-40 bg-gray-950 px-4 py-3 flex items-center gap-3 overflow-x-auto">
            <div className="flex gap-3 mx-auto">
              {displayedParticipants.map(participant => (
                <div
                  key={participant.sessionId}
                  className="w-48 md:w-56 h-full flex-shrink-0"
                >
                  <StreamVideoTile
                    participant={participant}
                    handRaised={isHandRaised(participant.userId)}
                    onVideoClick={
                      onParticipantClick
                        ? () => onParticipantClick(participant.userId)
                        : undefined
                    }
                    className="w-full h-full rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Normal gallery grid (no screen share)
  return (
    <div className={cn('relative flex flex-col h-full', className)}>
      {/* Grid container */}
      <div className="flex-grow flex items-center justify-center p-4 md:p-6 lg:p-8 overflow-auto">
        <div
          className={cn(
            'grid gap-3 md:gap-4',
            // For single participant: larger max-width and better padding
            displayedParticipants.length === 1
              ? 'w-full max-w-5xl mx-auto aspect-video'
              : 'w-full h-full',
            // Apply max-width only for single participant
            gridLayout.maxWidth &&
              displayedParticipants.length === 1 &&
              `max-w-${gridLayout.maxWidth}`
          )}
          style={{
            gridTemplateColumns: `repeat(${gridLayout.columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridLayout.rows}, minmax(0, 1fr))`,
          }}
        >
          {displayedParticipants.map(participant => (
            <div key={participant.sessionId} className="w-full h-full">
              <StreamVideoTile
                participant={participant}
                handRaised={isHandRaised(participant.userId)}
                onVideoClick={
                  onParticipantClick
                    ? () => onParticipantClick(participant.userId)
                    : undefined
                }
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination controls */}
      {showPagination && (
        <div className="flex items-center justify-center gap-4 py-4 bg-gray-800/50 backdrop-blur-sm">
          {/* Previous button */}
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              currentPage === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            )}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Page indicator */}
          <div className="flex items-center gap-2 text-gray-300">
            <span className="font-medium">
              Page {currentPage + 1} of {totalPages}
            </span>
            <span className="text-gray-400 text-sm">
              ({filteredParticipants.length} total)
            </span>
          </div>

          {/* Next button */}
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              currentPage === totalPages - 1
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            )}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Participant count (always visible, top-right corner) */}
      <div className="absolute top-4 right-4 px-3 py-1.5 bg-gray-800/80 backdrop-blur-sm rounded-full text-white text-sm font-medium shadow-lg z-30">
        {filteredParticipants.length} participant
        {filteredParticipants.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
