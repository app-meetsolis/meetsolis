/**
 * ParticipantPanel Component
 * Sidebar panel showing all participants with host controls
 */

'use client';

import React from 'react';
import type { StreamVideoParticipant } from '@stream-io/video-react-sdk';
import { ParticipantListItem } from './ParticipantListItem';
import { X, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ParticipantInfo {
  userId: string;
  role: 'host' | 'co-host' | 'participant';
}

export interface ParticipantPanelProps {
  /**
   * All participants from Stream SDK
   */
  participants: StreamVideoParticipant[];

  /**
   * Participant roles mapping (userId -> role)
   */
  participantRoles: Map<string, 'host' | 'co-host' | 'participant'>;

  /**
   * Current user's ID
   */
  currentUserId: string;

  /**
   * Current user's role
   */
  currentUserRole: 'host' | 'co-host' | 'participant';

  /**
   * ID of spotlighted participant
   */
  spotlightId?: string | null;

  /**
   * Whether panel is open
   */
  isOpen: boolean;

  /**
   * Close panel handler
   */
  onClose: () => void;

  /**
   * Action handlers
   */
  onSpotlight?: (userId: string) => void;
  onChangeRole?: (
    userId: string,
    newRole: 'host' | 'co-host' | 'participant'
  ) => void;
  onRemove?: (userId: string) => void;
  onMute?: (userId: string) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * ParticipantPanel Component
 *
 * Displays list of all participants with host controls in a sidebar panel.
 *
 * @example
 * ```typescript
 * const [isPanelOpen, setIsPanelOpen] = useState(false);
 * const participants = useParticipants();
 *
 * <ParticipantPanel
 *   participants={participants}
 *   participantRoles={rolesMap}
 *   currentUserId={currentUser.id}
 *   currentUserRole="host"
 *   spotlightId={layoutConfig.spotlightParticipantId}
 *   isOpen={isPanelOpen}
 *   onClose={() => setIsPanelOpen(false)}
 *   onSpotlight={handleSpotlight}
 *   onRemove={handleRemove}
 * />
 * ```
 */
export function ParticipantPanel({
  participants,
  participantRoles,
  currentUserId,
  currentUserRole,
  spotlightId,
  isOpen,
  onClose,
  onSpotlight,
  onChangeRole,
  onRemove,
  onMute,
  className,
}: ParticipantPanelProps) {
  /**
   * Sort participants: host first, then co-hosts, then participants
   * Within each group, sort by name
   */
  const sortedParticipants = React.useMemo(() => {
    const getRolePriority = (userId: string) => {
      const role = participantRoles.get(userId) || 'participant';
      if (role === 'host') return 0;
      if (role === 'co-host') return 1;
      return 2;
    };

    return [...participants].sort((a, b) => {
      // Sort by role first
      const roleA = getRolePriority(a.userId);
      const roleB = getRolePriority(b.userId);
      if (roleA !== roleB) return roleA - roleB;

      // Then by name
      const nameA = a.name || a.userId;
      const nameB = b.name || b.userId;
      return nameA.localeCompare(nameB);
    });
  }, [participants, participantRoles]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-gray-900 shadow-2xl z-50',
          'flex flex-col',
          'transform transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className
        )}
        role="dialog"
        aria-label="Participants panel"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-300" />
            <h2 className="text-white font-semibold text-lg">
              Participants ({participants.length})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label="Close participants panel"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Participant list */}
        <div className="flex-grow overflow-y-auto p-3 space-y-2">
          {sortedParticipants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Users className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No participants yet</p>
            </div>
          ) : (
            sortedParticipants.map(participant => (
              <ParticipantListItem
                key={participant.sessionId}
                participant={participant}
                role={participantRoles.get(participant.userId) || 'participant'}
                currentUserRole={currentUserRole}
                isSpotlighted={spotlightId === participant.userId}
                isCurrentUser={participant.userId === currentUserId}
                onSpotlight={
                  onSpotlight
                    ? () => {
                        // Toggle spotlight - pass same ID to clear if already spotlighted
                        onSpotlight(participant.userId);
                      }
                    : undefined
                }
                onChangeRole={
                  onChangeRole
                    ? newRole => onChangeRole(participant.userId, newRole)
                    : undefined
                }
                onRemove={
                  onRemove ? () => onRemove(participant.userId) : undefined
                }
                onMute={onMute ? () => onMute(participant.userId) : undefined}
              />
            ))
          )}
        </div>

        {/* Footer (optional - could add meeting lock toggle here) */}
        <div className="px-4 py-3 border-t border-gray-700 bg-gray-800">
          <div className="text-xs text-gray-400 text-center">
            {currentUserRole === 'host' || currentUserRole === 'co-host'
              ? 'Click ⋮ for participant actions'
              : 'View only'}
          </div>
        </div>
      </div>
    </>
  );
}
