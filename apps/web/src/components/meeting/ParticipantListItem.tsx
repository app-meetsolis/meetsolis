/**
 * ParticipantListItem Component
 * Individual participant row in the participant panel with host controls
 */

'use client';

import React from 'react';
import { hasAudio, hasVideo } from '@stream-io/video-client';
import type { StreamVideoParticipant } from '@stream-io/video-react-sdk';
import { cn } from '@/lib/utils';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Crown,
  Star,
  MoreVertical,
  Trash2,
  UserCog,
} from 'lucide-react';

export interface ParticipantListItemProps {
  /**
   * Participant data from Stream SDK
   */
  participant: StreamVideoParticipant;

  /**
   * Participant's role in the meeting
   */
  role: 'host' | 'co-host' | 'participant';

  /**
   * Current user's role (determines available actions)
   */
  currentUserRole: 'host' | 'co-host' | 'participant';

  /**
   * Whether this participant is spotlighted
   */
  isSpotlighted?: boolean;

  /**
   * Whether this is the current user
   */
  isCurrentUser?: boolean;

  /**
   * Action handlers (only shown to host/co-host)
   */
  onSpotlight?: () => void;
  onChangeRole?: (newRole: 'host' | 'co-host' | 'participant') => void;
  onRemove?: () => void;
  onMute?: () => void;
}

/**
 * ParticipantListItem Component
 *
 * Displays participant info with action menu for hosts/co-hosts.
 *
 * @example
 * ```typescript
 * <ParticipantListItem
 *   participant={participant}
 *   role={participantRole}
 *   currentUserRole="host"
 *   isSpotlighted={spotlightId === participant.userId}
 *   onSpotlight={() => handleSpotlight(participant.userId)}
 *   onRemove={() => handleRemove(participant.userId)}
 * />
 * ```
 */
export function ParticipantListItem({
  participant,
  role,
  currentUserRole,
  isSpotlighted = false,
  isCurrentUser = false,
  onSpotlight,
  onChangeRole,
  onRemove,
  onMute,
}: ParticipantListItemProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  const isMuted = !hasAudio(participant);
  const isVideoOff = !hasVideo(participant);
  const isSpeaking = participant.isSpeaking || false;

  // Determine if current user can perform host actions
  const canPerformHostActions =
    currentUserRole === 'host' || currentUserRole === 'co-host';

  // Don't show action menu for current user or if not host/co-host
  const showActionMenu = canPerformHostActions && !isCurrentUser;

  /**
   * Get role badge
   */
  const getRoleBadge = () => {
    if (role === 'host') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-xs font-medium">
          <Crown className="w-3 h-3" />
          <span>Host</span>
        </div>
      );
    }

    if (role === 'co-host') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded text-xs font-medium">
          <Star className="w-3 h-3" />
          <span>Co-host</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
        isSpeaking && 'bg-green-500/10 ring-1 ring-green-500',
        !isSpeaking && 'hover:bg-gray-700/50',
        isSpotlighted && 'bg-yellow-500/10 ring-1 ring-yellow-500'
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          {participant.name?.charAt(0).toUpperCase() ||
            participant.userId.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Participant info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white font-medium text-sm truncate">
            {participant.name || participant.userId}
            {isCurrentUser && ' (You)'}
          </span>
          {getRoleBadge()}
        </div>

        {/* Audio/Video status */}
        <div className="flex items-center gap-2">
          {isMuted ? (
            <MicOff className="w-3.5 h-3.5 text-red-400" aria-label="Muted" />
          ) : (
            <Mic className="w-3.5 h-3.5 text-green-400" aria-label="Unmuted" />
          )}
          {isVideoOff ? (
            <VideoOff
              className="w-3.5 h-3.5 text-red-400"
              aria-label="Video off"
            />
          ) : (
            <Video
              className="w-3.5 h-3.5 text-green-400"
              aria-label="Video on"
            />
          )}

          {/* Speaking indicator */}
          {isSpeaking && (
            <span className="text-xs text-green-400 font-medium">
              Speaking...
            </span>
          )}

          {/* Spotlighted indicator */}
          {isSpotlighted && (
            <span className="text-xs text-yellow-400 font-medium">
              Spotlighted
            </span>
          )}
        </div>
      </div>

      {/* Action menu (host/co-host only) */}
      {showActionMenu && (
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-gray-600 transition-colors"
            aria-label="Participant actions"
          >
            <MoreVertical className="w-4 h-4 text-gray-300" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-50">
                {/* Spotlight */}
                {onSpotlight && (
                  <button
                    onClick={() => {
                      onSpotlight();
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    <span>
                      {isSpotlighted ? 'Remove spotlight' : 'Spotlight'}
                    </span>
                  </button>
                )}

                {/* Change role (host only) */}
                {currentUserRole === 'host' && onChangeRole && (
                  <>
                    <div className="border-t border-gray-700 my-1" />
                    {role !== 'co-host' && (
                      <button
                        onClick={() => {
                          onChangeRole('co-host');
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center gap-2"
                      >
                        <UserCog className="w-4 h-4" />
                        <span>Make co-host</span>
                      </button>
                    )}
                    {role === 'co-host' && (
                      <button
                        onClick={() => {
                          onChangeRole('participant');
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center gap-2"
                      >
                        <UserCog className="w-4 h-4" />
                        <span>Remove co-host</span>
                      </button>
                    )}
                  </>
                )}

                {/* Remove participant */}
                {onRemove && role !== 'host' && (
                  <>
                    <div className="border-t border-gray-700 my-1" />
                    <button
                      onClick={() => {
                        onRemove();
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove from meeting</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
