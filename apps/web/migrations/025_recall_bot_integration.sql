-- Migration 025: Recall.ai Bot Integration (Story 6.2)
-- Creates recall_sessions table; extends usage_tracking + user_preferences.

-- ============================================================
-- recall_sessions — one row per bot dispatch attempt
-- ============================================================
CREATE TABLE IF NOT EXISTS recall_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  calendar_event_id UUID NOT NULL UNIQUE REFERENCES calendar_events(id) ON DELETE CASCADE,
  recall_bot_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','joining','in_meeting','done','error','quota_exceeded','skipped')),
  raw_recording_url TEXT,
  error_reason TEXT,
  joined_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS recall_sessions_user_status_idx
  ON recall_sessions (user_id, status);

ALTER TABLE recall_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS recall_sessions_owner ON recall_sessions;
CREATE POLICY recall_sessions_owner ON recall_sessions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS trigger_recall_sessions_updated_at ON recall_sessions;
CREATE TRIGGER trigger_recall_sessions_updated_at
  BEFORE UPDATE ON recall_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE recall_sessions IS 'Recall.ai bot dispatch records. One row per calendar_event. Status tracks full lifecycle.';

-- ============================================================
-- usage_tracking — add bot_session_count + period_start
-- ============================================================
ALTER TABLE usage_tracking
  ADD COLUMN IF NOT EXISTS bot_session_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bot_session_count_period_start TIMESTAMPTZ;

COMMENT ON COLUMN usage_tracking.bot_session_count IS 'Pro-only. Resets monthly aligned to Dodo billing cycle.';
COMMENT ON COLUMN usage_tracking.bot_session_count_period_start IS 'When bot_session_count period started. NULL = never reset (use subscription start).';

-- ============================================================
-- user_preferences — add auto_transcribe_enabled (UI in Story 6.5)
-- ============================================================
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS auto_transcribe_enabled BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN user_preferences.auto_transcribe_enabled IS 'Pro-only. When true, bot auto-joins matched calendar sessions.';

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 025_recall_bot_integration completed';
    RAISE NOTICE 'Created recall_sessions table with RLS';
    RAISE NOTICE 'Extended usage_tracking: bot_session_count, bot_session_count_period_start';
    RAISE NOTICE 'Extended user_preferences: auto_transcribe_enabled';
END $$;
