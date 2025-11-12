-- Migration: 004_add_user_profile_fields.sql
-- Description: Add user profile fields for onboarding data persistence
-- Author: Dev Agent
-- Date: 2025-10-08
-- Story: 1.8 - User Onboarding & Experience Risk Mitigation

-- =============================================================================
-- ADD USER PROFILE COLUMNS
-- =============================================================================

-- Add display_name column (user's preferred display name)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add title column (job title / role)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add bio column (user biography / description)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add timezone column (user's timezone for meeting scheduling)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add onboarding_completed column (track if user finished onboarding)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add onboarding_completed_at timestamp (when onboarding was completed)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- ADD INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index for searching users by display name
CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name);

-- Index for filtering by onboarding completion status
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);

-- =============================================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON COLUMN users.display_name IS 'User preferred display name (from onboarding)';
COMMENT ON COLUMN users.title IS 'User job title or professional role';
COMMENT ON COLUMN users.bio IS 'User biography or description';
COMMENT ON COLUMN users.timezone IS 'User timezone for meeting scheduling (IANA timezone identifier)';
COMMENT ON COLUMN users.onboarding_completed IS 'Flag indicating if user completed onboarding flow';
COMMENT ON COLUMN users.onboarding_completed_at IS 'Timestamp when user completed onboarding';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 004_add_user_profile_fields.sql completed successfully';
    RAISE NOTICE 'Added columns: display_name, title, bio, timezone, onboarding_completed, onboarding_completed_at';
    RAISE NOTICE 'Created indexes for display_name and onboarding_completed';
END $$;
