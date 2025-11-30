/**
 * Supabase Realtime Event Types & Normalization
 *
 * This module provides type-safe handling for Supabase Realtime events.
 * Supports both 'broadcast' and 'postgres_changes' event types with payload normalization.
 *
 * CRITICAL: When adding new realtime subscriptions:
 * - ALWAYS subscribe to BOTH 'broadcast' AND 'postgres_changes' events
 * - ALWAYS normalize payloads using the functions provided here
 * - ALWAYS add comprehensive logging for debugging
 *
 * See apps/web/src/lib/supabase/realtime.ts for reference implementation.
 */

/**
 * Broadcast event payload (sent by API endpoints)
 *
 * Used when API manually broadcasts state changes via:
 * `supabase.channel(name).send({ type: 'broadcast', event: 'participant_update', payload: {...} })`
 */
export interface BroadcastParticipantPayload {
  user_id: string;
  meeting_id: string;
  is_muted: boolean;
  is_video_off: boolean;
  connection_quality: string;
  updated_at: string;
}

/**
 * Postgres changes event payload (sent by database triggers)
 *
 * Received from Supabase when database rows change:
 * `.on('postgres_changes', { event: '*', table: 'participants' }, callback)`
 */
export interface PostgresChangesParticipantPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: {
    id: string;
    user_id: string;
    meeting_id: string;
    is_muted: boolean;
    is_video_off: boolean;
    connection_quality: string;
    joined_at: string;
    left_at: string | null;
    updated_at: string;
  };
  old?: {
    id: string;
    user_id: string;
    meeting_id: string;
    is_muted: boolean;
    is_video_off: boolean;
    connection_quality: string;
    joined_at: string;
    left_at: string | null;
    updated_at: string;
  };
}

/**
 * Normalized participant data (unified format)
 *
 * All realtime events are normalized to this format before being passed to consumers.
 * This ensures consistent handling regardless of event source.
 */
export interface NormalizedParticipantData {
  user_id: string;
  meeting_id: string;
  is_muted: boolean;
  is_video_off: boolean;
  connection_quality: string;
  updated_at: string;
  eventSource: 'broadcast' | 'postgres_changes'; // For debugging and metrics
}

/**
 * Type guard: Check if payload is a broadcast event
 */
export function isBroadcastPayload(
  payload: any
): payload is BroadcastParticipantPayload {
  return (
    payload &&
    typeof payload === 'object' &&
    typeof payload.user_id === 'string' &&
    typeof payload.meeting_id === 'string' &&
    typeof payload.is_muted === 'boolean' &&
    typeof payload.is_video_off === 'boolean' &&
    !('eventType' in payload) // Distinguish from postgres_changes
  );
}

/**
 * Type guard: Check if payload is a postgres_changes event
 */
export function isPostgresChangesPayload(
  payload: any
): payload is PostgresChangesParticipantPayload {
  return (
    payload &&
    typeof payload === 'object' &&
    typeof payload.eventType === 'string' &&
    ['INSERT', 'UPDATE', 'DELETE'].includes(payload.eventType) &&
    ('new' in payload || 'old' in payload)
  );
}

/**
 * Normalize participant payload from ANY realtime event type
 *
 * Converts both broadcast and postgres_changes events to a unified format.
 * Returns null if payload is invalid or cannot be normalized.
 *
 * @param payload - Raw payload from Supabase Realtime subscription
 * @returns Normalized participant data or null
 *
 * @example
 * ```typescript
 * subscribeToParticipants(meetingId, (payload) => {
 *   const normalized = normalizeParticipantPayload(payload);
 *   if (normalized) {
 *     console.log('Received update:', normalized);
 *     updateParticipantUI(normalized);
 *   }
 * });
 * ```
 */
export function normalizeParticipantPayload(
  payload: any
): NormalizedParticipantData | null {
  try {
    // Handle broadcast events (from API endpoints)
    if (isBroadcastPayload(payload)) {
      return {
        user_id: payload.user_id,
        meeting_id: payload.meeting_id,
        is_muted: payload.is_muted,
        is_video_off: payload.is_video_off,
        connection_quality: payload.connection_quality,
        updated_at: payload.updated_at,
        eventSource: 'broadcast',
      };
    }

    // Handle postgres_changes events (from database triggers)
    if (isPostgresChangesPayload(payload)) {
      const record = payload.new;

      // Only process UPDATE and INSERT events (ignore DELETE for now)
      if (!record || payload.eventType === 'DELETE') {
        return null;
      }

      return {
        user_id: record.user_id,
        meeting_id: record.meeting_id,
        is_muted: record.is_muted,
        is_video_off: record.is_video_off,
        connection_quality: record.connection_quality,
        updated_at: record.updated_at,
        eventSource: 'postgres_changes',
      };
    }

    // Unknown payload format
    console.warn(
      '[Realtime] Unknown payload format, cannot normalize:',
      payload
    );
    return null;
  } catch (error) {
    console.error('[Realtime] Error normalizing participant payload:', error);
    return null;
  }
}

/**
 * Format normalized data for logging (redacts sensitive info)
 */
export function formatParticipantLogData(data: NormalizedParticipantData) {
  return {
    source: data.eventSource,
    user_id: data.user_id.substring(0, 8) + '...', // Redact for privacy
    is_muted: data.is_muted,
    is_video_off: data.is_video_off,
    connection_quality: data.connection_quality,
  };
}

/**
 * Meeting ended event payload (broadcast only)
 *
 * Sent when a meeting ends (organizer leaves or last participant leaves)
 * via broadcast event: 'meeting_ended'
 */
export interface MeetingEndedPayload {
  meeting_id: string;
  ended_by_host: boolean;
  ended_at: string;
  participant_count_before_leave: number;
}

/**
 * Type guard: Check if payload is a meeting ended event
 */
export function isMeetingEndedPayload(
  payload: any
): payload is MeetingEndedPayload {
  return (
    payload &&
    typeof payload === 'object' &&
    typeof payload.meeting_id === 'string' &&
    typeof payload.ended_by_host === 'boolean' &&
    typeof payload.ended_at === 'string' &&
    typeof payload.participant_count_before_leave === 'number'
  );
}

/**
 * Normalize meeting ended payload from broadcast event
 *
 * Validates and normalizes meeting_ended broadcast events.
 * Returns null if payload is invalid.
 *
 * @param payload - Raw payload from Supabase Realtime broadcast
 * @returns Normalized meeting ended data or null
 *
 * @example
 * ```typescript
 * subscribeToMeetingEnded(meetingId, (payload) => {
 *   const normalized = normalizeMeetingEndedPayload(payload);
 *   if (normalized) {
 *     console.log('Meeting ended:', normalized);
 *     redirectToDashboard();
 *   }
 * });
 * ```
 */
export function normalizeMeetingEndedPayload(
  payload: any
): MeetingEndedPayload | null {
  try {
    // Validate required fields
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    if (!payload.meeting_id || !payload.ended_at) {
      console.warn('[Realtime] Invalid meeting_ended payload:', payload);
      return null;
    }

    return {
      meeting_id: payload.meeting_id,
      ended_by_host: payload.ended_by_host ?? false,
      ended_at: payload.ended_at,
      participant_count_before_leave: payload.participant_count_before_leave ?? 0,
    };
  } catch (error) {
    console.error('[Realtime] Error normalizing meeting_ended payload:', error);
    return null;
  }
}

/**
 * Format meeting ended data for logging
 */
export function formatMeetingEndedLogData(data: MeetingEndedPayload) {
  return {
    meeting_id: data.meeting_id.substring(0, 8) + '...', // Redact for privacy
    ended_by_host: data.ended_by_host,
    ended_at: data.ended_at,
    participant_count: data.participant_count_before_leave,
  };
}
