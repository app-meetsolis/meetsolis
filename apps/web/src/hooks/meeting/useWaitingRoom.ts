/**
 * useWaitingRoom Hook
 *
 * Custom hook for managing waiting room participants.
 * Provides methods to fetch, admit, and reject participants.
 * Subscribes to realtime updates for automatic state sync.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToMeetingEvents } from '@/lib/supabase/realtime';
import type { WaitingRoomEventPayload } from '../../../../../packages/shared/types/realtime';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Waiting room participant data
 */
export interface WaitingParticipant {
  id: string;
  user_id: string;
  display_name: string;
  joined_at: string;
  status: 'waiting' | 'admitted' | 'rejected';
}

/**
 * useWaitingRoom return type
 */
export interface UseWaitingRoomReturn {
  waitingParticipants: WaitingParticipant[];
  isLoading: boolean;
  error: string | null;
  admitParticipant: (userId: string) => Promise<void>;
  rejectParticipant: (userId: string) => Promise<void>;
  admitAll: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * useWaitingRoom Hook
 *
 * Manages waiting room state with realtime updates.
 *
 * @param meetingId - Meeting ID
 * @param enabled - Whether to enable the hook (default: true)
 * @returns Waiting room state and actions
 *
 * @example
 * ```typescript
 * const { waitingParticipants, admitParticipant, rejectParticipant } = useWaitingRoom(meetingId);
 *
 * // Admit participant
 * await admitParticipant(userId);
 *
 * // Reject participant
 * await rejectParticipant(userId);
 * ```
 */
export function useWaitingRoom(
  meetingId: string,
  enabled: boolean = true
): UseWaitingRoomReturn {
  const [waitingParticipants, setWaitingParticipants] = useState<
    WaitingParticipant[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  /**
   * Fetch waiting room participants from API
   */
  const fetchParticipants = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/meetings/${meetingId}/waiting-room`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to fetch waiting room participants'
        );
      }

      const data = await response.json();
      setWaitingParticipants(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('[useWaitingRoom] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [meetingId, enabled]);

  /**
   * Admit participant
   */
  const admitParticipant = useCallback(
    async (userId: string) => {
      setError(null);

      try {
        const response = await fetch(
          `/api/meetings/${meetingId}/waiting-room/admit`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to admit participant');
        }

        // Optimistic update: remove from local state
        setWaitingParticipants(prev => prev.filter(p => p.user_id !== userId));

        console.log('[useWaitingRoom] Participant admitted:', userId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('[useWaitingRoom] Admit error:', err);
        throw err; // Re-throw for caller to handle
      }
    },
    [meetingId]
  );

  /**
   * Reject participant
   */
  const rejectParticipant = useCallback(
    async (userId: string) => {
      setError(null);

      try {
        const response = await fetch(
          `/api/meetings/${meetingId}/waiting-room/reject`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to reject participant');
        }

        // Optimistic update: remove from local state
        setWaitingParticipants(prev => prev.filter(p => p.user_id !== userId));

        console.log('[useWaitingRoom] Participant rejected:', userId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('[useWaitingRoom] Reject error:', err);
        throw err; // Re-throw for caller to handle
      }
    },
    [meetingId]
  );

  /**
   * Admit all participants
   */
  const admitAll = useCallback(async () => {
    if (waitingParticipants.length === 0) return;

    setError(null);
    setIsLoading(true);

    try {
      // Admit each participant individually
      await Promise.all(
        waitingParticipants.map(p =>
          fetch(`/api/meetings/${meetingId}/waiting-room/admit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: p.user_id }),
          })
        )
      );

      // Clear local state
      setWaitingParticipants([]);

      console.log('[useWaitingRoom] All participants admitted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('[useWaitingRoom] Admit all error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [meetingId, waitingParticipants]);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    if (enabled) {
      fetchParticipants();
    }
  }, [enabled, fetchParticipants]);

  /**
   * Subscribe to realtime waiting room events
   */
  useEffect(() => {
    if (!enabled) return;

    console.log('[useWaitingRoom] Subscribing to realtime events:', meetingId);

    const channel = subscribeToMeetingEvents(meetingId, {
      onWaitingRoomEvent: (payload: WaitingRoomEventPayload | null) => {
        if (!payload) {
          console.warn('[useWaitingRoom] Received null payload');
          return;
        }

        console.log('[useWaitingRoom] Realtime event:', payload);

        // Remove participant from local state when admitted or rejected
        if (payload.status === 'admitted' || payload.status === 'rejected') {
          setWaitingParticipants(prev =>
            prev.filter(p => p.user_id !== payload.user_id)
          );
        }
      },
    });

    channelRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      console.log('[useWaitingRoom] Unsubscribing from realtime events');
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [meetingId, enabled]);

  /**
   * Poll for updates every 10 seconds as fallback
   * (Realtime should handle most updates, but this ensures consistency)
   */
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      console.log('[useWaitingRoom] Polling for updates...');
      fetchParticipants();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [enabled, fetchParticipants]);

  return {
    waitingParticipants,
    isLoading,
    error,
    admitParticipant,
    rejectParticipant,
    admitAll,
    refetch: fetchParticipants,
  };
}
