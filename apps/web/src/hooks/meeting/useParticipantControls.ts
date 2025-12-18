/**
 * useParticipantControls Hook
 * Provides methods for host/co-host to control participants
 *
 * Actions:
 * - Spotlight participant (global, persisted)
 * - Change participant role (promote/demote)
 * - Remove participant from meeting
 * - Mute participant (via Stream SDK)
 */

'use client';

import { useState, useCallback } from 'react';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';

export interface UseParticipantControlsOptions {
  /**
   * Meeting ID
   */
  meetingId: string;

  /**
   * Current user's role
   */
  currentUserRole: 'host' | 'co-host' | 'participant';
}

export interface UseParticipantControlsReturn {
  /**
   * Set spotlight for a participant (null to clear)
   * Only host/co-host can spotlight
   */
  setSpotlight: (participantId: string | null) => Promise<void>;

  /**
   * Change participant's role
   * Only host can change roles
   */
  changeRole: (
    participantId: string,
    newRole: 'host' | 'co-host' | 'participant'
  ) => Promise<void>;

  /**
   * Remove participant from meeting
   * Host/co-host can remove participants (but not host)
   */
  removeParticipant: (participantId: string) => Promise<void>;

  /**
   * Request participant to mute (via Stream SDK)
   * Host/co-host can request mute
   */
  requestMute: (participantId: string) => Promise<void>;

  /**
   * Loading states for each action
   */
  isSpotlighting: boolean;
  isChangingRole: boolean;
  isRemoving: boolean;
  isMuting: boolean;

  /**
   * Error states
   */
  spotlightError: string | null;
  roleError: string | null;
  removeError: string | null;
  muteError: string | null;
}

/**
 * useParticipantControls Hook
 *
 * @param options - Configuration options
 * @returns Participant control methods and states
 *
 * @example
 * ```typescript
 * const {
 *   setSpotlight,
 *   changeRole,
 *   removeParticipant,
 *   isSpotlighting,
 * } = useParticipantControls({
 *   meetingId: '123',
 *   currentUserRole: 'host',
 * });
 *
 * // Spotlight a participant
 * await setSpotlight('user-456');
 *
 * // Promote to co-host
 * await changeRole('user-456', 'co-host');
 * ```
 */
export function useParticipantControls(
  options: UseParticipantControlsOptions
): UseParticipantControlsReturn {
  const { meetingId, currentUserRole } = options;
  const { setSpotlightParticipant } = useLayoutConfig();

  // Loading states
  const [isSpotlighting, setIsSpotlighting] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isMuting, setIsMuting] = useState(false);

  // Error states
  const [spotlightError, setSpotlightError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [muteError, setMuteError] = useState<string | null>(null);

  /**
   * Set spotlight for a participant
   * Updates local state immediately (optimistic) and calls API
   */
  const setSpotlight = useCallback(
    async (participantId: string | null) => {
      // Authorization check
      if (currentUserRole !== 'host' && currentUserRole !== 'co-host') {
        setSpotlightError('Only host or co-host can spotlight participants');
        return;
      }

      setIsSpotlighting(true);
      setSpotlightError(null);

      try {
        // Optimistic update
        setSpotlightParticipant(participantId);

        // API call (will be implemented in task 12)
        const response = await fetch(`/api/meetings/${meetingId}/spotlight`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spotlight_participant_id: participantId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to set spotlight');
        }

        console.log('[useParticipantControls] Spotlight set:', participantId);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        setSpotlightError(message);
        console.error('[useParticipantControls] Spotlight error:', error);

        // Revert optimistic update on error
        setSpotlightParticipant(null);
      } finally {
        setIsSpotlighting(false);
      }
    },
    [meetingId, currentUserRole, setSpotlightParticipant]
  );

  /**
   * Change participant's role
   * Only host can change roles
   */
  const changeRole = useCallback(
    async (
      participantId: string,
      newRole: 'host' | 'co-host' | 'participant'
    ) => {
      // Authorization check
      if (currentUserRole !== 'host') {
        setRoleError('Only host can change participant roles');
        return;
      }

      setIsChangingRole(true);
      setRoleError(null);

      try {
        // API call (will be implemented in task 13)
        const response = await fetch(
          `/api/meetings/${meetingId}/participants/${participantId}/role`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to change role');
        }

        console.log(
          '[useParticipantControls] Role changed:',
          participantId,
          newRole
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        setRoleError(message);
        console.error('[useParticipantControls] Role change error:', error);
      } finally {
        setIsChangingRole(false);
      }
    },
    [meetingId, currentUserRole]
  );

  /**
   * Remove participant from meeting
   * Host/co-host can remove participants (but not host)
   */
  const removeParticipant = useCallback(
    async (participantId: string) => {
      // Authorization check
      if (currentUserRole !== 'host' && currentUserRole !== 'co-host') {
        setRemoveError('Only host or co-host can remove participants');
        return;
      }

      setIsRemoving(true);
      setRemoveError(null);

      try {
        // API call (will be implemented in task 14)
        const response = await fetch(
          `/api/meetings/${meetingId}/participants/${participantId}/remove`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to remove participant');
        }

        console.log(
          '[useParticipantControls] Participant removed:',
          participantId
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        setRemoveError(message);
        console.error(
          '[useParticipantControls] Remove participant error:',
          error
        );
      } finally {
        setIsRemoving(false);
      }
    },
    [meetingId, currentUserRole]
  );

  /**
   * Request participant to mute
   * Uses Stream SDK to send mute request
   */
  const requestMute = useCallback(
    async (participantId: string) => {
      // Authorization check
      if (currentUserRole !== 'host' && currentUserRole !== 'co-host') {
        setMuteError('Only host or co-host can mute participants');
        return;
      }

      setIsMuting(true);
      setMuteError(null);

      try {
        // TODO: Implement via Stream SDK muteUser capability
        // For now, this is a placeholder
        console.log('[useParticipantControls] Mute requested:', participantId);

        // Stream SDK approach:
        // const call = useCall();
        // await call.muteUser(participantId, 'audio');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        setMuteError(message);
        console.error('[useParticipantControls] Mute error:', error);
      } finally {
        setIsMuting(false);
      }
    },
    [currentUserRole]
  );

  return {
    setSpotlight,
    changeRole,
    removeParticipant,
    requestMute,
    isSpotlighting,
    isChangingRole,
    isRemoving,
    isMuting,
    spotlightError,
    roleError,
    removeError,
    muteError,
  };
}
