/**
 * useParticipantState Hook
 * Manages participant state updates (mute/video) with API synchronization
 */

import { useState, useCallback, useRef } from 'react';

export interface ParticipantStateUpdate {
  is_muted?: boolean;
  is_video_off?: boolean;
}

export interface UseParticipantStateOptions {
  meetingId: string;
  debounceMs?: number;
}

export interface UseParticipantStateReturn {
  updateMyState: (state: ParticipantStateUpdate) => Promise<void>;
  isUpdating: boolean;
  error: Error | null;
}

/**
 * Hook for updating current participant's state in a meeting
 */
export function useParticipantState({
  meetingId,
  debounceMs = 100,
}: UseParticipantStateOptions): UseParticipantStateReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdateRef = useRef<ParticipantStateUpdate | null>(null);

  /**
   * Update participant state with debouncing
   */
  const updateMyState = useCallback(
    async (state: ParticipantStateUpdate) => {
      // Merge with any pending update
      pendingUpdateRef.current = {
        ...pendingUpdateRef.current,
        ...state,
      };

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the actual API call
      debounceTimerRef.current = setTimeout(async () => {
        const updateData = pendingUpdateRef.current;
        pendingUpdateRef.current = null;

        if (!updateData) return;

        setIsUpdating(true);
        setError(null);

        try {
          const response = await fetch(
            `/api/meetings/${meetingId}/participants/me/state`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updateData),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update state');
          }

          // Success - Supabase real-time will notify other participants via broadcast
        } catch (err) {
          const error = err as Error;
          console.error('Failed to update participant state:', error);
          setError(error);
        } finally {
          setIsUpdating(false);
        }
      }, debounceMs);
    },
    [meetingId, debounceMs]
  );

  return {
    updateMyState,
    isUpdating,
    error,
  };
}
