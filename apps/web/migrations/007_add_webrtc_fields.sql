-- Migration: 007_add_webrtc_fields.sql
-- Description: Add WebRTC-specific fields for Story 2.1 - video call functionality
-- Author: Dev Agent - James
-- Date: 2025-11-14

-- =============================================================================
-- MEETINGS TABLE UPDATES
-- =============================================================================

-- Rename started_at to actual_start for consistency
ALTER TABLE meetings
RENAME COLUMN started_at TO actual_start;

-- Rename ended_at to actual_end for consistency
ALTER TABLE meetings
RENAME COLUMN ended_at TO actual_end;

-- Update existing indexes
DROP INDEX IF EXISTS idx_meetings_started_at;
DROP INDEX IF EXISTS idx_meetings_ended_at;

CREATE INDEX IF NOT EXISTS idx_meetings_actual_start ON meetings(actual_start);
CREATE INDEX IF NOT EXISTS idx_meetings_actual_end ON meetings(actual_end);

COMMENT ON COLUMN meetings.actual_start IS 'Actual meeting start timestamp (when first participant joins)';
COMMENT ON COLUMN meetings.actual_end IS 'Actual meeting end timestamp (when last participant leaves)';

-- =============================================================================
-- PARTICIPANTS TABLE UPDATES
-- =============================================================================

-- Add is_muted column (default TRUE for auto-mute on join)
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT TRUE;

-- Add is_video_off column (default FALSE - video on by default)
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS is_video_off BOOLEAN DEFAULT FALSE;

-- Add connection_quality column for WebRTC monitoring
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS connection_quality TEXT DEFAULT 'good'
CHECK (connection_quality IN ('excellent', 'good', 'poor'));

-- Rename joined_at for clarity (already exists as joined_at)
-- Rename left_at for clarity (already exists as left_at)
-- These already match the story requirements, so no changes needed

-- Add join_time and leave_time as aliases if needed
ALTER TABLE participants
RENAME COLUMN joined_at TO join_time;

ALTER TABLE participants
RENAME COLUMN left_at TO leave_time;

-- Update indexes
DROP INDEX IF EXISTS idx_participants_joined_at;
DROP INDEX IF EXISTS idx_participants_left_at;

CREATE INDEX IF NOT EXISTS idx_participants_join_time ON participants(join_time);
CREATE INDEX IF NOT EXISTS idx_participants_leave_time ON participants(leave_time);
CREATE INDEX IF NOT EXISTS idx_participants_connection_quality ON participants(connection_quality);

-- Add comments
COMMENT ON COLUMN participants.is_muted IS 'Audio mute status (TRUE = muted)';
COMMENT ON COLUMN participants.is_video_off IS 'Video off status (TRUE = video off)';
COMMENT ON COLUMN participants.connection_quality IS 'WebRTC connection quality (excellent, good, poor)';
COMMENT ON COLUMN participants.join_time IS 'Timestamp when participant joined the meeting';
COMMENT ON COLUMN participants.leave_time IS 'Timestamp when participant left the meeting';

-- =============================================================================
-- UPDATE SETTINGS JSONB DEFAULTS
-- =============================================================================

-- Update meetings.settings default to match Story 2.1 requirements
ALTER TABLE meetings
ALTER COLUMN settings SET DEFAULT '{
    "allow_screen_share": true,
    "allow_whiteboard": true,
    "allow_file_upload": true,
    "auto_record": false,
    "enable_reactions": true,
    "enable_polls": true,
    "background_blur_default": false
}'::jsonb;

-- Update participants.permissions default to match Story 2.1 requirements
ALTER TABLE participants
ALTER COLUMN permissions SET DEFAULT '{
    "can_share_screen": true,
    "can_use_whiteboard": true,
    "can_upload_files": true,
    "can_send_messages": true,
    "can_create_polls": true,
    "can_use_reactions": true
}'::jsonb;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 007_add_webrtc_fields.sql completed successfully';
    RAISE NOTICE 'Updated meetings table: renamed started_at → actual_start, ended_at → actual_end';
    RAISE NOTICE 'Updated participants table: added is_muted, is_video_off, connection_quality';
    RAISE NOTICE 'Updated participants table: renamed joined_at → join_time, left_at → leave_time';
    RAISE NOTICE 'Updated default JSONB values for settings and permissions';
END $$;
