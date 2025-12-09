-- Migration: Add waiting room and spotlight features for Story 2.3
-- Description: Participant management and layout control features
-- Author: Product Owner - Sarah
-- Date: 2025-12-09

-- =============================================================================
-- MEETINGS TABLE UPDATES - Add spotlight participant reference
-- =============================================================================

ALTER TABLE meetings
ADD COLUMN spotlight_participant_id UUID REFERENCES participants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_meetings_spotlight_participant ON meetings(spotlight_participant_id);

COMMENT ON COLUMN meetings.spotlight_participant_id IS 'Participant currently spotlighted by host (visible to all, overrides local pins)';

-- =============================================================================
-- WAITING ROOM TABLE - New table for pre-meeting participant queue
-- =============================================================================

CREATE TABLE waiting_room_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'admitted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(meeting_id, user_id)
);

CREATE INDEX idx_waiting_room_meeting_id ON waiting_room_participants(meeting_id);
CREATE INDEX idx_waiting_room_status ON waiting_room_participants(status);
CREATE INDEX idx_waiting_room_user_id ON waiting_room_participants(user_id);

COMMENT ON TABLE waiting_room_participants IS 'Queue for participants awaiting host approval to join meeting (AC 7)';
COMMENT ON COLUMN waiting_room_participants.status IS 'Participant status: waiting (in queue), admitted (approved by host), rejected (denied entry)';

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE waiting_room_participants ENABLE ROW LEVEL SECURITY;

-- Hosts can view their meeting's waiting room
CREATE POLICY "Hosts can view waiting room" ON waiting_room_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings
            JOIN users ON users.id = meetings.host_id
            WHERE meetings.id = waiting_room_participants.meeting_id
            AND users.clerk_id = auth.uid()::text
        )
    );

-- Hosts can manage (admit/reject) waiting room participants
CREATE POLICY "Hosts can manage waiting room" ON waiting_room_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meetings
            JOIN users ON users.id = meetings.host_id
            WHERE meetings.id = waiting_room_participants.meeting_id
            AND users.clerk_id = auth.uid()::text
        )
    );

-- Users can view their own waiting room status
CREATE POLICY "Users can view own waiting room status" ON waiting_room_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = waiting_room_participants.user_id
            AND users.clerk_id = auth.uid()::text
        )
    );

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 009_add_waiting_room_and_spotlight.sql completed successfully';
    RAISE NOTICE 'Added spotlight_participant_id column to meetings table';
    RAISE NOTICE 'Created waiting_room_participants table with RLS policies';
    RAISE NOTICE 'Story 2.3 database requirements satisfied';
END $$;
