/**
 * Recall.ai Types (Story 6.2)
 * Hand-rolled from Recall.ai API docs — no official SDK types.
 */

// ---------------------------------------------------------------------------
// Bot status (mirrors recall_sessions.status CHECK constraint)
// ---------------------------------------------------------------------------
export type RecallBotStatus =
  | 'pending'
  | 'joining'
  | 'in_meeting'
  | 'done'
  | 'error'
  | 'quota_exceeded'
  | 'skipped';

// ---------------------------------------------------------------------------
// DB row
// ---------------------------------------------------------------------------
export interface RecallSession {
  id: string;
  user_id: string;
  client_id: string;
  calendar_event_id: string;
  recall_bot_id: string | null;
  status: RecallBotStatus;
  raw_recording_url: string | null;
  recording_id: string | null;
  error_reason: string | null;
  joined_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Recall.ai API — create bot request/response
// ---------------------------------------------------------------------------
/**
 * Per-bot real-time webhook endpoint. Recall delivers streaming transcript
 * events here (separate from the account-level Svix lifecycle webhook).
 */
export interface RecallRealtimeEndpoint {
  type: 'webhook';
  url: string;
  events: string[]; // e.g. ['transcript.data']
}

export interface RecallCreateBotRequest {
  meeting_url: string;
  bot_name: string;
  webhook_url: string;
  recording_config?: {
    video_mixed_layout?: 'speaker_view' | 'gallery_view' | 'audio_only';
    video_mixed_mp4?: Record<string, never>;
    audio_mixed_raw?: Record<string, never>;
    /** Streaming transcription provider config (Story 6.2b). */
    transcript?: {
      provider: {
        deepgram_streaming?: {
          model?: string;
          language?: string;
        };
      };
    };
    /** Per-bot endpoints for real-time events (Story 6.2b). */
    realtime_endpoints?: RecallRealtimeEndpoint[];
  };
}

export interface RecallCreateBotResponse {
  id: string; // UUID — recall_bot_id
  status_changes: RecallStatusChange[];
  meeting_url: string;
  bot_name: string;
  created_at: string;
}

export interface RecallStatusChange {
  code: string;
  message: string | null;
  created_at: string;
  sub_code: string | null;
}

export interface RecallGetBotResponse extends RecallCreateBotResponse {
  video_url: string | null;
  audio_url: string | null;
  transcript: null;
}

// ---------------------------------------------------------------------------
// Recall.ai Webhook — event payload (Svix delivery)
// ---------------------------------------------------------------------------
export type RecallWebhookEventType =
  | 'bot.joining_call'
  | 'bot.in_waiting_room'
  | 'bot.in_call_not_recording'
  | 'bot.recording_permission_allowed'
  | 'bot.recording_permission_denied'
  | 'bot.in_call_recording'
  | 'bot.call_ended'
  | 'bot.done'
  | 'bot.fatal';

export interface RecallWebhookPayload {
  event: RecallWebhookEventType;
  data: RecallWebhookEventData;
}

export interface RecallWebhookEventData {
  bot_id: string;
  recording_url?: string;
  transcript_url?: string;
  message?: string;
  sub_code?: string;
  [key: string]: unknown;
}
