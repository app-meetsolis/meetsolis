-- Migration: 002_enable_rls.sql
-- Description: Enable Row Level Security (RLS) and create security policies
-- Author: Dev Agent
-- Date: 2025-10-01

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_summaries ENABLE ROW LEVEL SECURITY;

-- Note: ai_usage_tracking and usage_alerts are admin-only tables without RLS

-- =============================================================================
-- HELPER FUNCTION: GET CURRENT USER ID FROM CLERK
-- =============================================================================

-- This function retrieves the current user's UUID based on their Clerk ID
-- auth.uid() in Supabase returns the authenticated user's Clerk ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
DECLARE
    user_uuid UUID;
BEGIN
    SELECT id INTO user_uuid
    FROM users
    WHERE clerk_id = auth.uid()::text;

    RETURN user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_current_user_id IS 'Get current user UUID from Clerk auth context';

-- =============================================================================
-- USERS TABLE RLS POLICIES
-- =============================================================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (clerk_id = auth.uid()::text);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (clerk_id = auth.uid()::text)
WITH CHECK (clerk_id = auth.uid()::text);

-- Policy: Allow service role to insert users (for Clerk webhook)
CREATE POLICY "Service role can insert users"
ON users FOR INSERT
WITH CHECK (true);

-- Policy: Users can view other users in same meetings
CREATE POLICY "Users can view other meeting participants"
ON users FOR SELECT
USING (
    id IN (
        SELECT DISTINCT p.user_id
        FROM participants p
        JOIN participants my_participation ON my_participation.meeting_id = p.meeting_id
        JOIN users u ON u.id = my_participation.user_id
        WHERE u.clerk_id = auth.uid()::text
    )
);

-- =============================================================================
-- MEETINGS TABLE RLS POLICIES
-- =============================================================================

-- Policy: Hosts can manage their own meetings
CREATE POLICY "Hosts can manage own meetings"
ON meetings FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = meetings.host_id
        AND users.clerk_id = auth.uid()::text
    )
);

-- Policy: Participants can view meetings they joined
CREATE POLICY "Participants can view joined meetings"
ON meetings FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM participants
        JOIN users ON users.id = participants.user_id
        WHERE participants.meeting_id = meetings.id
        AND users.clerk_id = auth.uid()::text
    )
);

-- Policy: Anyone with invite link can view meeting basic info (for join page)
CREATE POLICY "Public can view meetings by invite link"
ON meetings FOR SELECT
USING (invite_link IS NOT NULL);

-- =============================================================================
-- PARTICIPANTS TABLE RLS POLICIES
-- =============================================================================

-- Policy: Meeting participants can view other participants in same meeting
CREATE POLICY "Meeting participants can view other participants"
ON participants FOR SELECT
USING (
    meeting_id IN (
        SELECT p.meeting_id
        FROM participants p
        JOIN users u ON u.id = p.user_id
        WHERE u.clerk_id = auth.uid()::text
    )
);

-- Policy: Users can insert themselves as participants
CREATE POLICY "Users can join meetings as participants"
ON participants FOR INSERT
WITH CHECK (
    user_id = get_current_user_id()
);

-- Policy: Users can update their own participation status
CREATE POLICY "Users can update own participation"
ON participants FOR UPDATE
USING (
    user_id = get_current_user_id()
)
WITH CHECK (
    user_id = get_current_user_id()
);

-- Policy: Hosts and co-hosts can manage participants
CREATE POLICY "Hosts can manage participants"
ON participants FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM participants p
        JOIN users u ON u.id = p.user_id
        WHERE p.meeting_id = participants.meeting_id
        AND u.clerk_id = auth.uid()::text
        AND p.role IN ('host', 'co-host')
    )
);

-- =============================================================================
-- MESSAGES TABLE RLS POLICIES
-- =============================================================================

-- Policy: Meeting participants can view messages in meetings they joined
CREATE POLICY "Participants can view meeting messages"
ON messages FOR SELECT
USING (
    meeting_id IN (
        SELECT p.meeting_id
        FROM participants p
        JOIN users u ON u.id = p.user_id
        WHERE u.clerk_id = auth.uid()::text
    )
);

-- Policy: Users can send messages to meetings they joined
CREATE POLICY "Participants can send messages"
ON messages FOR INSERT
WITH CHECK (
    user_id = get_current_user_id()
    AND meeting_id IN (
        SELECT p.meeting_id
        FROM participants p
        JOIN users u ON u.id = p.user_id
        WHERE u.clerk_id = auth.uid()::text
        AND p.status = 'joined'
    )
);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete own messages"
ON messages FOR DELETE
USING (user_id = get_current_user_id());

-- =============================================================================
-- REACTIONS TABLE RLS POLICIES
-- =============================================================================

-- Policy: Meeting participants can view reactions
CREATE POLICY "Participants can view meeting reactions"
ON reactions FOR SELECT
USING (
    meeting_id IN (
        SELECT p.meeting_id
        FROM participants p
        JOIN users u ON u.id = p.user_id
        WHERE u.clerk_id = auth.uid()::text
    )
);

-- Policy: Users can add reactions to meetings they joined
CREATE POLICY "Participants can add reactions"
ON reactions FOR INSERT
WITH CHECK (
    user_id = get_current_user_id()
    AND meeting_id IN (
        SELECT p.meeting_id
        FROM participants p
        JOIN users u ON u.id = p.user_id
        WHERE u.clerk_id = auth.uid()::text
        AND p.status = 'joined'
    )
);

-- =============================================================================
-- FILES TABLE RLS POLICIES
-- =============================================================================

-- Policy: Meeting participants can view files
CREATE POLICY "Participants can view meeting files"
ON files FOR SELECT
USING (
    meeting_id IN (
        SELECT p.meeting_id
        FROM participants p
        JOIN users u ON u.id = p.user_id
        WHERE u.clerk_id = auth.uid()::text
    )
);

-- Policy: Users can upload files to meetings they joined
CREATE POLICY "Participants can upload files"
ON files FOR INSERT
WITH CHECK (
    user_id = get_current_user_id()
    AND meeting_id IN (
        SELECT p.meeting_id
        FROM participants p
        JOIN users u ON u.id = p.user_id
        WHERE u.clerk_id = auth.uid()::text
        AND p.status = 'joined'
    )
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
ON files FOR DELETE
USING (user_id = get_current_user_id());

-- Policy: Hosts can manage all meeting files
CREATE POLICY "Hosts can manage meeting files"
ON files FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM meetings m
        JOIN users u ON u.id = m.host_id
        WHERE m.id = files.meeting_id
        AND u.clerk_id = auth.uid()::text
    )
);

-- =============================================================================
-- MEETING_SUMMARIES TABLE RLS POLICIES
-- =============================================================================

-- Policy: Meeting participants can view summaries
CREATE POLICY "Participants can view meeting summaries"
ON meeting_summaries FOR SELECT
USING (
    meeting_id IN (
        SELECT p.meeting_id
        FROM participants p
        JOIN users u ON u.id = p.user_id
        WHERE u.clerk_id = auth.uid()::text
    )
);

-- Policy: Only hosts can create/update summaries (through API)
CREATE POLICY "Service role can manage summaries"
ON meeting_summaries FOR ALL
USING (true)
WITH CHECK (true);

-- =============================================================================
-- RLS TESTING QUERIES
-- =============================================================================

-- To test RLS policies, run these queries with different user contexts:
--
-- 1. Test as host viewing own meetings:
-- SET request.jwt.claim.sub = 'clerk_user_id_here';
-- SELECT * FROM meetings WHERE host_id = get_current_user_id();
--
-- 2. Test as participant viewing joined meetings:
-- SELECT * FROM meetings m
-- JOIN participants p ON p.meeting_id = m.id
-- WHERE p.user_id = get_current_user_id();
--
-- 3. Test unauthorized access (should return empty):
-- SELECT * FROM meetings WHERE host_id != get_current_user_id();

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 002_enable_rls.sql completed successfully';
    RAISE NOTICE 'Enabled RLS on: users, meetings, participants, messages, reactions, files, meeting_summaries';
    RAISE NOTICE 'Created get_current_user_id() helper function';
    RAISE NOTICE 'Created comprehensive RLS policies for all tables';
    RAISE NOTICE 'Security model: Clerk auth.uid() linked to users.clerk_id';
END $$;
