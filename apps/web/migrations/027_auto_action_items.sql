-- Migration 027: Auto Action Items preference (Story 6.2c)
-- Action items are decoupled from the summary and are opt-in. This flag, when
-- true, auto-generates action items after each meeting's summary completes.
-- Preferences live on the users table (same pattern as migration 023).

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS auto_action_items_enabled BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN users.auto_action_items_enabled IS 'Story 6.2c. When true, action items auto-generate after each session summary. Default OFF — action items are otherwise generated on demand.';

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 027_auto_action_items completed';
    RAISE NOTICE 'Added users.auto_action_items_enabled (default FALSE)';
END $$;
