/**
 * Supabase Realtime Utilities
 *
 * Utilities for managing Realtime subscriptions and channels.
 * Channel naming conventions and subscription helpers.
 */

import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from './client';

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
 * Subscribe to meeting participants (presence tracking)
 */
export function subscribeToParticipants(
  meetingId: string,
  // eslint-disable-next-line no-unused-vars
  callback: (_payload: any) => void
): RealtimeChannel {
  const supabase = getSupabaseClient();
  const channelName = RealtimeChannels.participants(meetingId);

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `meeting_id=eq.${meetingId}`,
      },
      callback
    )
    .subscribe();

  return channel;
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
