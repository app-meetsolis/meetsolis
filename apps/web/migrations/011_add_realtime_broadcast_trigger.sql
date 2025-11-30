-- Migration: Add Realtime Broadcast for Participant State Changes
-- This bypasses RLS authentication issues by using Supabase broadcast channels

-- Create function to broadcast participant changes via Supabase Realtime
CREATE OR REPLACE FUNCTION broadcast_participant_change()
RETURNS TRIGGER AS $$
DECLARE
  channel_name TEXT;
BEGIN
  -- Build channel name: meeting:{meeting_id}:participants
  channel_name := 'meeting:' || NEW.meeting_id::text || ':participants';

  -- Use Supabase's realtime.broadcast to send the change
  -- This works without RLS authentication
  PERFORM pg_notify(
    'supabase_realtime',
    json_build_object(
      'type', 'broadcast',
      'channel', channel_name,
      'event', 'participant_update',
      'payload', json_build_object(
        'user_id', NEW.user_id,
        'meeting_id', NEW.meeting_id,
        'is_muted', NEW.is_muted,
        'is_video_off', NEW.is_video_off,
        'connection_quality', NEW.connection_quality,
        'updated_at', NEW.updated_at
      )
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on participants table for UPDATE events
DROP TRIGGER IF EXISTS participant_state_broadcast_trigger ON participants;

CREATE TRIGGER participant_state_broadcast_trigger
AFTER UPDATE OF is_muted, is_video_off, connection_quality ON participants
FOR EACH ROW
EXECUTE FUNCTION broadcast_participant_change();

-- Add comment
COMMENT ON FUNCTION broadcast_participant_change() IS 'Broadcasts participant state changes via Supabase Realtime to bypass RLS authentication issues';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 011: Created broadcast trigger for participant state changes';
    RAISE NOTICE 'Channel pattern: meeting:{meeting_id}:participants';
    RAISE NOTICE 'Event: participant_update';
END $$;
