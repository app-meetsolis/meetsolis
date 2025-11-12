-- Migration: 005_add_scheduled_start.sql
-- Description: Add scheduled_start column to meetings table for scheduling future meetings
-- Author: Dev Agent
-- Date: 2025-11-12

-- Add scheduled_start column to meetings table
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMP WITH TIME ZONE;

-- Add index for scheduled meetings queries
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_start ON meetings(scheduled_start);

COMMENT ON COLUMN meetings.scheduled_start IS 'Scheduled start time for future meetings';

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 005_add_scheduled_start.sql completed successfully';
    RAISE NOTICE 'Added scheduled_start column to meetings table';
END $$;
