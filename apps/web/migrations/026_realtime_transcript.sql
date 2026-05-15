-- Migration 026: Real-Time Transcription (Story 6.2b)
-- Extends sessions for streaming transcript chunks; links sessions <-> recall_sessions.

-- ============================================================
-- sessions — streaming transcript columns + recall_sessions link
-- ============================================================
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS transcript_chunks JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS transcript_streaming_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transcript_streaming_complete BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recall_session_id UUID
    REFERENCES recall_sessions(id) ON DELETE SET NULL;

-- UNIQUE enables webhook lazy-create via upsert ON CONFLICT (recall_session_id).
-- Standard unique index allows multiple NULLs, so manual-upload sessions
-- (recall_session_id IS NULL) are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS sessions_recall_session_id_idx
  ON sessions (recall_session_id);

COMMENT ON COLUMN sessions.transcript_chunks IS 'Append-only array of TranscriptChunk objects streamed during a live meeting (Story 6.2b).';
COMMENT ON COLUMN sessions.transcript_streaming_started_at IS 'Set on first transcript chunk or bot.in_call_recording, whichever fires first.';
COMMENT ON COLUMN sessions.transcript_streaming_complete IS 'True once bot.call_ended processed; UI stops polling transcript-live.';
COMMENT ON COLUMN sessions.recall_session_id IS 'Links a session to the bot dispatch that produced it. Used by webhook to upsert the sessions row.';

-- ============================================================
-- recall_sessions — recording_id for on-demand signed-URL refresh
-- ============================================================
ALTER TABLE recall_sessions
  ADD COLUMN IF NOT EXISTS recording_id TEXT;

COMMENT ON COLUMN recall_sessions.recording_id IS 'Recall.ai recording id (data.recording.id). Used to re-fetch expired signed audio URLs.';

-- ============================================================
-- append_transcript_chunk — atomic dedup + append for streaming
-- The UPDATE takes a row lock, so concurrent webhook writes serialize;
-- NOT EXISTS drops duplicate finals (Recall retries webhooks up to 60x).
-- Dedup key is (start_ms, speaker): two speakers can share a start_ms.
-- ============================================================
CREATE OR REPLACE FUNCTION append_transcript_chunk(
  p_recall_session_id UUID,
  p_chunk JSONB
) RETURNS VOID AS $$
BEGIN
  UPDATE sessions
  SET transcript_chunks = transcript_chunks || p_chunk,
      updated_at = NOW()
  WHERE recall_session_id = p_recall_session_id
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(transcript_chunks) elem
      WHERE (elem->>'start_ms')::numeric = (p_chunk->>'start_ms')::numeric
        AND (elem->>'speaker')::numeric = (p_chunk->>'speaker')::numeric
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION append_transcript_chunk IS 'Story 6.2b. Atomic dedup-by-(start_ms,speaker) + append into sessions.transcript_chunks.';

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 026_realtime_transcript completed';
    RAISE NOTICE 'Extended sessions: transcript_chunks, transcript_streaming_started_at, transcript_streaming_complete, recall_session_id';
    RAISE NOTICE 'Extended recall_sessions: recording_id';
    RAISE NOTICE 'Created function append_transcript_chunk';
END $$;
