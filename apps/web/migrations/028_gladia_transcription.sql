-- Migration 028: Gladia Transcription Pipeline (Story 6.3)
-- Re-transcribes Recall.ai bot recordings via Gladia with speaker diarization.

-- ============================================================
-- recall_sessions — Gladia job + diarization columns
-- ============================================================
ALTER TABLE recall_sessions
  ADD COLUMN IF NOT EXISTS gladia_job_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS diarized_transcript JSONB,
  ADD COLUMN IF NOT EXISTS speaker_map JSONB,
  ADD COLUMN IF NOT EXISTS speaker_review_needed BOOLEAN NOT NULL DEFAULT FALSE;

-- Extend the status CHECK to cover the Gladia lifecycle.
ALTER TABLE recall_sessions DROP CONSTRAINT IF EXISTS recall_sessions_status_check;
ALTER TABLE recall_sessions ADD CONSTRAINT recall_sessions_status_check
  CHECK (status IN ('pending','joining','in_meeting','transcribing','done','error',
                    'quota_exceeded','skipped','transcription_failed','summary_failed'));

COMMENT ON COLUMN recall_sessions.gladia_job_id IS 'Gladia pre-recorded job id. UNIQUE — used for webhook lookup + submit idempotency.';
COMMENT ON COLUMN recall_sessions.diarized_transcript IS 'Raw Gladia utterances array (DiarizedUtterance[]). Source of truth for re-formatting on speaker reassignment.';
COMMENT ON COLUMN recall_sessions.speaker_map IS 'JSONB { "speaker_0": "Coach", "speaker_1": "Sarah Chen" }.';
COMMENT ON COLUMN recall_sessions.speaker_review_needed IS 'True when >2 or 1 speaker detected — surfaces a dashboard review banner.';

-- ============================================================
-- sessions — provenance of the transcript
-- sessions.recall_session_id already exists (migration 026) — do NOT re-add.
-- ============================================================
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual','recall_ai'));

COMMENT ON COLUMN sessions.source IS 'recall_ai = bot-transcribed (Gladia); manual = uploaded transcript.';

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 028_gladia_transcription completed';
    RAISE NOTICE 'Extended recall_sessions: gladia_job_id, diarized_transcript, speaker_map, speaker_review_needed';
    RAISE NOTICE 'Extended recall_sessions status CHECK: transcribing, transcription_failed, summary_failed';
    RAISE NOTICE 'Extended sessions: source';
END $$;
