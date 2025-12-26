-- Migration: 013_add_security_features.sql
-- Description: Add security features for Story 2.5 - Meeting Security and Access Controls
-- Author: Dev Agent (James)
-- Date: 2025-12-21

-- =============================================================================
-- MEETINGS TABLE UPDATES - Add security features
-- =============================================================================

-- Add secure invite token and expiration
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS invite_token UUID UNIQUE DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS waiting_room_whitelist JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS allow_participant_screenshare BOOLEAN DEFAULT false;

-- Add indexes for security queries
CREATE INDEX IF NOT EXISTS idx_meetings_invite_token ON meetings(invite_token);
CREATE INDEX IF NOT EXISTS idx_meetings_expires_at ON meetings(expires_at);

COMMENT ON COLUMN meetings.invite_token IS 'Cryptographically secure UUID v4 for invite links (AC 10)';
COMMENT ON COLUMN meetings.expires_at IS 'Link expiration timestamp - null means never expires (AC 10)';
COMMENT ON COLUMN meetings.waiting_room_whitelist IS 'JSONB array of whitelisted emails for auto-admit: ["email1@example.com", "email2@example.com"] (AC 2)';
COMMENT ON COLUMN meetings.allow_participant_screenshare IS 'Allow all participants to screen share (false = host-only) (AC 6)';

-- =============================================================================
-- PARTICIPANTS TABLE UPDATES - Simplify role constraint to 2 roles
-- =============================================================================

-- First, migrate existing co-host data to participant role
-- Story 2.5 AC 3: Simplified to 2 roles (co-host deferred to post-launch)

-- Update users table (if co-host exists there)
UPDATE users
SET role = 'host'
WHERE role = 'co-host';

-- Update participants table
UPDATE participants
SET role = 'participant'
WHERE role = 'co-host';

-- Remove old constraint
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_role_check;

-- Add new simplified constraint (host, participant only)
ALTER TABLE participants
ADD CONSTRAINT participants_role_check
CHECK (role IN ('host', 'participant'));

COMMENT ON CONSTRAINT participants_role_check ON participants IS 'MVP simplified to 2 roles: host, participant (co-host deferred to post-launch)';

-- =============================================================================
-- WAITING ROOM ENHANCEMENTS - Add email column for whitelist matching
-- =============================================================================

-- Add email column to waiting_room_participants for whitelist matching
ALTER TABLE waiting_room_participants
ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_waiting_room_email ON waiting_room_participants(email);

COMMENT ON COLUMN waiting_room_participants.email IS 'Participant email for whitelist matching (AC 2)';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 013_add_security_features.sql completed successfully';
    RAISE NOTICE 'Added invite_token (UUID) to meetings table for secure URLs';
    RAISE NOTICE 'Added expires_at timestamp to meetings table for link expiration';
    RAISE NOTICE 'Added waiting_room_whitelist JSONB to meetings table for auto-admit';
    RAISE NOTICE 'Added allow_participant_screenshare boolean to meetings table';
    RAISE NOTICE 'Updated participants role constraint to host/participant only (removed co-host)';
    RAISE NOTICE 'Added email column to waiting_room_participants for whitelist matching';
    RAISE NOTICE 'Story 2.5 MVP database requirements satisfied';
END $$;
