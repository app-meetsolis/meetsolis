-- Migration: Add meeting_code field for short, user-friendly meeting identifiers
-- This fixes the bug where meetings cannot be joined via invite links

-- Add meeting_code column (nullable initially for backfill)
ALTER TABLE meetings
ADD COLUMN meeting_code TEXT;

-- Create unique index on meeting_code for fast lookups
CREATE UNIQUE INDEX idx_meetings_meeting_code ON meetings(meeting_code);

-- Backfill meeting_code from existing invite_link URLs
-- Extract the nanoid from invite_link (e.g., "https://meetsolis.app/meeting/aEMWdU0Q9-" -> "aEMWdU0Q9-")
UPDATE meetings
SET meeting_code = SUBSTRING(invite_link FROM '/meeting/(.+)$')
WHERE meeting_code IS NULL;

-- Make meeting_code NOT NULL after backfill
ALTER TABLE meetings
ALTER COLUMN meeting_code SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN meetings.meeting_code IS 'Short, user-friendly meeting identifier used in invite URLs (e.g., aEMWdU0Q9-)';
