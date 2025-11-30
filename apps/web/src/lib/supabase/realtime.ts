/**
 * Supabase Realtime Utilities
 *
 * Utilities for managing Realtime subscriptions and channels.
 * Channel naming conventions and subscription helpers.
 *
 * CRITICAL: Event Type Consistency
 *
 * When adding new realtime subscriptions:
 * - ALWAYS subscribe to BOTH 'broadcast' AND 'postgres_changes' events
 * - ALWAYS normalize payloads to common format using normalizeParticipantPayload()
 * - ALWAYS add comprehensive logging for debugging
 *
 * See subscribeToParticipants() for reference implementation.
 */

import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from './client';
import {
  normalizeParticipantPayload,
  formatParticipantLogData,
  type NormalizedParticipantData,
  normalizeMeetingEndedPayload,
  formatMeetingEndedLogData,
  type MeetingEndedPayload,
} from '../../../../../packages/shared/types/realtime';

/**
 * Channel naming conventions for meeting-specific channels
 */
export const RealtimeChannels = {
  participants: (meetingId: string) => `meeting:${meetingId}:participants`,
  messages: (meetingId: string) => `meeting:${meetingId}:messages`,
  reactions: (meetingId: string) => `meeting:${meetingId}:reactions`,
  webrtc: (meetingId: string) => `meeting:${meetingId}:webrtc`,
} as const;

/**
 * Subscribe to all meeting events (participants + meeting lifecycle)
 *
 * UNIFIED SUBSCRIPTION: This function creates a SINGLE Realtime channel that handles:
 * 1. Participant state updates (broadcast + postgres_changes)
 * 2. Meeting ended events (broadcast)
 *
 * This prevents creating duplicate channels which can cause race conditions and interference.
 *
 * @param meetingId - UUID of the meeting
 * @param callbacks - Object containing callbacks for different event types
 * @returns RealtimeChannel instance for cleanup
 */
export function subscribeToMeetingEvents(
  meetingId: string,
  callbacks: {
    onParticipantUpdate?: (_payload: NormalizedParticipantData | null) => void;
    onMeetingEnded?: (_payload: MeetingEndedPayload | null) => void;
  }
): RealtimeChannel {
  const supabase = getSupabaseClient();
  const channelName = RealtimeChannels.participants(meetingId);

  let channel = supabase.channel(channelName);

  // Participant update: BROADCAST events (PRIMARY)
  if (callbacks.onParticipantUpdate) {
    channel = channel.on(
      'broadcast',
      { event: 'participant_update' },
      payload => {
        console.log('[Realtime] Received broadcast event:', {
          channel: channelName,
          payload: payload.payload,
        });

        const normalized = normalizeParticipantPayload(payload.payload);
        if (normalized) {
          console.log(
            '[Realtime] Normalized broadcast data:',
            formatParticipantLogData(normalized)
          );
          callbacks.onParticipantUpdate!(normalized);
        } else {
          console.warn('[Realtime] Failed to normalize broadcast payload');
        }
      }
    );
  }

  // Participant update: POSTGRES_CHANGES events (FALLBACK)
  if (callbacks.onParticipantUpdate) {
    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `meeting_id=eq.${meetingId}`,
      },
      payload => {
        console.log('[Realtime] Received postgres_changes event:', {
          channel: channelName,
          eventType: payload.eventType,
        });

        const normalized = normalizeParticipantPayload(payload);
        if (normalized) {
          console.log(
            '[Realtime] Normalized postgres_changes data:',
            formatParticipantLogData(normalized)
          );
          callbacks.onParticipantUpdate!(normalized);
        } else {
          console.warn(
            '[Realtime] Failed to normalize postgres_changes payload'
          );
        }
      }
    );
  }

  // Meeting ended: BROADCAST events
  if (callbacks.onMeetingEnded) {
    channel = channel.on('broadcast', { event: 'meeting_ended' }, payload => {
      console.log('[Realtime] Received meeting_ended event:', {
        channel: channelName,
        payload: payload.payload,
      });

      const normalized = normalizeMeetingEndedPayload(payload.payload);
      if (normalized) {
        console.log(
          '[Realtime] Normalized meeting_ended data:',
          formatMeetingEndedLogData(normalized)
        );
        callbacks.onMeetingEnded!(normalized);
      } else {
        console.warn('[Realtime] Failed to normalize meeting_ended payload');
      }
    });
  }

  // Subscribe to the channel
  channel = channel.subscribe(status => {
    console.log('[Realtime] Meeting events subscription status:', {
      channel: channelName,
      status,
    });
  });

  return channel;
}

/**
 * @deprecated Use subscribeToMeetingEvents instead to avoid duplicate channels
 *
 * Subscribe to meeting participants (presence tracking + state updates)
 *
 * This subscription handles TWO event types:
 * 1. BROADCAST events - Sent by API endpoints for immediate state sync (PRIMARY)
 * 2. POSTGRES_CHANGES events - Sent by database triggers as fallback (SECONDARY)
 *
 * Both event types are normalized to a unified format before being passed to the callback.
 *
 * @param meetingId - UUID of the meeting
 * @param callback - Called with normalized participant data on any state change
 * @returns RealtimeChannel instance for cleanup
 */
export function subscribeToParticipants(
  meetingId: string,
  // eslint-disable-next-line no-unused-vars
  callback: (_payload: NormalizedParticipantData | null) => void
): RealtimeChannel {
  return subscribeToMeetingEvents(meetingId, {
    onParticipantUpdate: callback,
  });
}

/**
 * @deprecated Use subscribeToMeetingEvents instead to avoid duplicate channels
 *
 * Subscribe to meeting ended events
 *
 * Listens for broadcast events when a meeting ends (organizer leaves or last participant leaves).
 * Reuses the SAME channel as participants to avoid creating duplicate connections.
 *
 * IMPORTANT: This function is additive and does NOT interfere with participant state sync.
 * It only adds a new event listener to the existing channel pattern.
 *
 * @param meetingId - UUID of the meeting
 * @param callback - Called with normalized meeting ended data when meeting ends
 * @returns RealtimeChannel instance for cleanup
 *
 * @example
 * ```typescript
 * const channel = subscribeToMeetingEnded(meetingId, (data) => {
 *   if (data) {
 *     toast.info('Meeting ended');
 *     router.push('/dashboard');
 *   }
 * });
 *
 * // Cleanup on unmount
 * return () => unsubscribeChannel(channel);
 * ```
 */
export function subscribeToMeetingEnded(
  meetingId: string,
  // eslint-disable-next-line no-unused-vars
  callback: (_payload: MeetingEndedPayload | null) => void
): RealtimeChannel {
  return subscribeToMeetingEvents(meetingId, {
    onMeetingEnded: callback,
  });
}

/**
 * Subscribe to meeting messages (live chat)
 */
export function subscribeToMessages(
  meetingId: string,
  // eslint-disable-next-line no-unused-vars
  callback: (_payload: any) => void
): RealtimeChannel {
  const supabase = getSupabaseClient();
  const channelName = RealtimeChannels.messages(meetingId);

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `meeting_id=eq.${meetingId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to meeting reactions (live reactions)
 */
export function subscribeToReactions(
  meetingId: string,
  // eslint-disable-next-line no-unused-vars
  callback: (_payload: any) => void
): RealtimeChannel {
  const supabase = getSupabaseClient();
  const channelName = RealtimeChannels.reactions(meetingId);

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'reactions',
        filter: `meeting_id=eq.${meetingId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Create WebRTC signaling channel for peer connections
 */
export function createWebRTCChannel(meetingId: string): RealtimeChannel {
  const supabase = getSupabaseClient();
  const channelName = RealtimeChannels.webrtc(meetingId);

  return supabase.channel(channelName);
}

/**
 * Unsubscribe from a channel and clean up
 */
export async function unsubscribeChannel(
  channel: RealtimeChannel
): Promise<void> {
  await channel.unsubscribe();
}

/**
 * Unsubscribe from all channels for a meeting
 */
export async function unsubscribeAllMeetingChannels(
  meetingId: string
): Promise<void> {
  const supabase = getSupabaseClient();

  const channelNames = [
    RealtimeChannels.participants(meetingId),
    RealtimeChannels.messages(meetingId),
    RealtimeChannels.reactions(meetingId),
    RealtimeChannels.webrtc(meetingId),
  ];

  for (const channelName of channelNames) {
    const channel = supabase.channel(channelName);
    await channel.unsubscribe();
  }
}
