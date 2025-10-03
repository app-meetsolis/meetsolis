-- Migration: 003_enable_realtime.sql
-- Description: Enable Supabase Realtime for live updates on specific tables
-- Author: Dev Agent
-- Date: 2025-10-01

-- =============================================================================
-- ENABLE REALTIME REPLICATION
-- =============================================================================

-- Enable Realtime for participants table (presence tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE participants;

-- Enable Realtime for messages table (live chat)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable Realtime for reactions table (live reactions)
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;

-- =============================================================================
-- REALTIME CHANNEL NAMING CONVENTIONS
-- =============================================================================

-- Meeting-specific channels follow this pattern:
--
-- Participants:  meeting:{meeting_id}:participants
-- Messages:      meeting:{meeting_id}:messages
-- Reactions:     meeting:{meeting_id}:reactions
-- WebRTC:        meeting:{meeting_id}:webrtc (broadcast channel only)
--
-- Example: meeting:550e8400-e29b-41d4-a716-446655440000:messages

-- =============================================================================
-- REALTIME SUBSCRIPTION PATTERNS
-- =============================================================================

-- These are example subscription patterns for the application layer:
--
-- 1. Subscribe to new messages:
-- supabase
--   .channel('meeting:${meetingId}:messages')
--   .on('postgres_changes', {
--     event: 'INSERT',
--     schema: 'public',
--     table: 'messages',
--     filter: 'meeting_id=eq.${meetingId}'
--   }, callback)
--   .subscribe();
--
-- 2. Subscribe to participant changes:
-- supabase
--   .channel('meeting:${meetingId}:participants')
--   .on('postgres_changes', {
--     event: '*',
--     schema: 'public',
--     table: 'participants',
--     filter: 'meeting_id=eq.${meetingId}'
--   }, callback)
--   .subscribe();
--
-- 3. WebRTC signaling (broadcast only, no postgres changes):
-- supabase
--   .channel('meeting:${meetingId}:webrtc')
--   .on('broadcast', { event: 'signal' }, callback)
--   .subscribe();

-- =============================================================================
-- REALTIME PERFORMANCE OPTIMIZATION
-- =============================================================================

-- Rate limiting for Realtime events is configured in Supabase client:
-- eventsPerSecond: 10 (default)
--
-- For high-traffic meetings, consider:
-- 1. Debouncing rapid updates (reactions, typing indicators)
-- 2. Pagination for message history
-- 3. Virtual scrolling for long message lists
-- 4. Unsubscribe from channels when leaving meeting

-- =============================================================================
-- REALTIME SECURITY
-- =============================================================================

-- Realtime subscriptions respect RLS policies:
-- - Only meeting participants will receive live updates
-- - Non-participants will not see channel data
-- - Clerk authentication required for all subscriptions

-- Test Realtime RLS enforcement:
-- 1. Subscribe to channel as authorized user → receives updates
-- 2. Subscribe to channel as unauthorized user → no updates received
-- 3. User removed from meeting → stops receiving updates

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 003_enable_realtime.sql completed successfully';
    RAISE NOTICE 'Enabled Realtime replication on: participants, messages, reactions';
    RAISE NOTICE 'Channel naming convention: meeting:{meeting_id}:{feature}';
    RAISE NOTICE 'Realtime respects RLS policies for security';
END $$;
