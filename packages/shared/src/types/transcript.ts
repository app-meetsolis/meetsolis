/**
 * Real-time transcription types (Story 6.2b).
 *
 * TranscriptChunk is the stored shape — one finalized utterance from one
 * speaker. Persisted append-only into sessions.transcript_chunks (JSONB),
 * served by /api/sessions/[id]/transcript-live, consumed by the live UI.
 */

export interface TranscriptChunk {
  /** Recall participant.id — stable per speaker within a meeting. */
  speaker: number;
  /** Real name when the meeting platform exposes it, else null. */
  speaker_name: string | null;
  text: string;
  start_ms: number;
  end_ms: number;
}
