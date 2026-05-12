-- Migration 024: Google Calendar Integration (Story 6.1)
-- Creates user_calendar_tokens + calendar_events tables, re-adds clients.email for auto-match.

-- ============================================================
-- clients.email (re-added — dropped in migration 015)
-- Required for auto-matching calendar attendees to Client Cards.
-- ============================================================
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_clients_user_email
  ON clients(user_id, email)
  WHERE email IS NOT NULL;

-- ============================================================
-- user_calendar_tokens — encrypted Google OAuth tokens, one row per user
-- ============================================================
CREATE TABLE IF NOT EXISTS user_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  expiry_at TIMESTAMPTZ NOT NULL,
  google_account_email TEXT NOT NULL,
  connection_broken BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_calendar_tokens_user_id
  ON user_calendar_tokens(user_id);

ALTER TABLE user_calendar_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_calendar_tokens_all" ON user_calendar_tokens;
CREATE POLICY "user_calendar_tokens_all" ON user_calendar_tokens FOR ALL USING (true);

DROP TRIGGER IF EXISTS trigger_user_calendar_tokens_updated_at ON user_calendar_tokens;
CREATE TRIGGER trigger_user_calendar_tokens_updated_at
  BEFORE UPDATE ON user_calendar_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_calendar_tokens IS 'Encrypted Google Calendar OAuth tokens. AES-256-GCM via CALENDAR_TOKEN_ENCRYPTION_KEY env var.';
COMMENT ON COLUMN user_calendar_tokens.connection_broken IS 'True when refresh fails — surfaces re-auth prompt to user.';

-- ============================================================
-- calendar_events — synced upcoming events from Google Calendar
-- bot_status + bot_skipped reserved for Story 6.2 forward compat.
-- ============================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  google_event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  attendees JSONB NOT NULL DEFAULT '[]'::jsonb,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  meet_link TEXT,
  bot_status TEXT,
  bot_skipped BOOLEAN NOT NULL DEFAULT FALSE,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, google_event_id)
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_start
  ON calendar_events(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_client_id
  ON calendar_events(client_id)
  WHERE client_id IS NOT NULL;

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "calendar_events_all" ON calendar_events;
CREATE POLICY "calendar_events_all" ON calendar_events FOR ALL USING (true);

COMMENT ON TABLE calendar_events IS 'Upcoming Google Calendar events synced every 15 min. Filter: has Meet/Zoom link OR attendee matches Client Card email.';
COMMENT ON COLUMN calendar_events.bot_status IS 'Populated by Story 6.2 (Recall.ai bot lifecycle).';
COMMENT ON COLUMN calendar_events.bot_skipped IS 'Populated by Story 6.5 per-meeting bot skip toggle.';

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 024_calendar_integration completed';
    RAISE NOTICE 'Added clients.email (re-added — dropped in 015)';
    RAISE NOTICE 'Created user_calendar_tokens (encrypted OAuth)';
    RAISE NOTICE 'Created calendar_events (15-min sync target)';
END $$;
