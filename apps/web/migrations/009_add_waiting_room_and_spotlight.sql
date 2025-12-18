-- Migration 009: Add Spotlight and Waiting Room Features
-- Story 2.3: Video Layout and Participant Management
-- Created: 2025-12-09

-- Add spotlight column to meetings table
-- Allows host/co-host to highlight a specific participant for all meeting attendees
ALTER TABLE meetings
ADD COLUMN spotlight_participant_id UUID REFERENCES participants(id) ON DELETE SET NULL;

-- Create index for efficient spotlight queries
CREATE INDEX idx_meetings_spotlight ON meetings(spotlight_participant_id);

-- Create waiting_room_participants table
-- Stores participants waiting for host approval to join the meeting
CREATE TABLE waiting_room_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'admitted', 'rejected')),
    UNIQUE(meeting_id, user_id)
);

-- Create indexes for efficient waiting room queries
CREATE INDEX idx_waiting_room_meeting_id ON waiting_room_participants(meeting_id);
CREATE INDEX idx_waiting_room_status ON waiting_room_participants(status);
CREATE INDEX idx_waiting_room_user_id ON waiting_room_participants(user_id);

-- Enable Supabase Realtime for waiting room events
-- Allows real-time updates when participants are admitted/rejected
ALTER PUBLICATION supabase_realtime ADD TABLE waiting_room_participants;

-- Add comment for documentation
COMMENT ON COLUMN meetings.spotlight_participant_id IS 'Participant currently spotlighted by host (visible to all attendees)';
COMMENT ON TABLE waiting_room_participants IS 'Participants waiting for host approval to join meeting';
COMMENT ON COLUMN waiting_room_participants.status IS 'Current status: waiting (default), admitted, rejected';
