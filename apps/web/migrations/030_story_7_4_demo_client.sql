-- 030: Story 7.4 — Demo client "Alex Rivera" + schema groundwork for Story 7.2
--
-- Adds is_demo flag + ai_intelligence_strip JSONB to clients. The strip column
-- is added here (not in 7.2's migration) so the demo seed can pre-populate it;
-- Story 7.2 will own the read/regenerate logic.
--
-- coach_note is NOT added — existing clients.coach_notes (plural; from Story 6.4
-- migration 20260519_story_6_4_coach_briefs.sql) serves the same purpose and is
-- already wired through the codebase. Story 7.2 / 7.7 will read/write that.

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_intelligence_strip JSONB;

CREATE INDEX IF NOT EXISTS idx_clients_is_demo
  ON clients(user_id)
  WHERE is_demo = TRUE;

COMMENT ON COLUMN clients.is_demo IS
  'Story 7.4. TRUE for the Alex Rivera demo client seeded into each new user.';

COMMENT ON COLUMN clients.ai_intelligence_strip IS
  'Story 7.4 (schema + demo seed) / Story 7.2 (regen logic). JSON: {recurring_theme, theme_frequency, recent_breakthrough, current_focus, generated_at}.';
