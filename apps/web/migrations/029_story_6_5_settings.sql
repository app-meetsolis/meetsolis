-- Migration 029: Story 6.5 — Coach Brief Settings, Bot Toggle & Live Transcript View
-- Only one new column + Realtime publication. All other Story 6.5 fields already exist:
--   - user_preferences.auto_transcribe_enabled (migration 025)
--   - user_preferences.coach_brief_window_minutes (Story 6.4 migration, CHECK BETWEEN 15 AND 240)
--   - sessions.transcript_chunks for live transcript (migration 026, Story 6.2b)
--   - calendar_events.bot_skipped + PATCH route (Story 6.1)

-- ============================================================
-- user_preferences — manual upload transcription provider
-- ============================================================
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS manual_transcription_provider TEXT NOT NULL DEFAULT 'deepgram'
    CHECK (manual_transcription_provider IN ('deepgram', 'gladia'));

COMMENT ON COLUMN user_preferences.manual_transcription_provider IS
  'Story 6.5. Engine for manual uploads only. Bot sessions always use Gladia.';

-- ============================================================
-- Realtime on sessions — for live transcript panel subscription
-- RLS on sessions already filters per-user (user_id = auth.uid()).
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
  END IF;
END $$;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 029_story_6_5_settings completed';
    RAISE NOTICE 'Added user_preferences.manual_transcription_provider (deepgram|gladia)';
    RAISE NOTICE 'Enabled Realtime publication on sessions table';
END $$;
