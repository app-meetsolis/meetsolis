-- Migration: 012_add_chat_and_reactions.sql
-- Description: Enhance messaging schema for Story 2.4 - Real-Time Messaging and Chat Features
-- Author: Dev Agent (James)
-- Date: 2025-12-19

-- =============================================================================
-- ALTER MESSAGES TABLE FOR CHAT FEATURES
-- =============================================================================

-- Add new columns for chat functionality
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS message_read_by JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS file_id UUID REFERENCES files(id) ON DELETE SET NULL;

-- Rename user_id to sender_id for clarity (if needed)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE messages RENAME COLUMN user_id TO sender_id;
    END IF;
END $$;

-- Update type constraint to support public/private/system
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_type_check;
ALTER TABLE messages ADD CONSTRAINT messages_type_check
CHECK (type IN ('public', 'private', 'system', 'text', 'file'));

-- Rename created_at to timestamp for consistency with story spec
-- (Keep created_at as well for backward compatibility)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE messages SET timestamp = created_at WHERE timestamp IS NULL;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON messages(is_deleted);
CREATE INDEX IF NOT EXISTS idx_messages_read_by ON messages USING GIN(message_read_by);

COMMENT ON COLUMN messages.recipient_id IS 'Recipient for private messages (NULL for public messages)';
COMMENT ON COLUMN messages.edited_at IS 'Timestamp when message was last edited';
COMMENT ON COLUMN messages.is_deleted IS 'Soft delete flag for deleted messages';
COMMENT ON COLUMN messages.message_read_by IS 'JSONB array of read receipts: [{"user_id": "uuid", "read_at": "timestamp"}]';
COMMENT ON COLUMN messages.file_id IS 'Reference to attached file in files table';

-- =============================================================================
-- ALTER REACTIONS TABLE FOR MESSAGE-SPECIFIC REACTIONS
-- =============================================================================

-- Add message_id to support reactions to specific messages
ALTER TABLE reactions
ADD COLUMN IF NOT EXISTS message_id UUID REFERENCES messages(id) ON DELETE CASCADE;

-- Update emoji constraint to support wider range of emojis
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_emoji_check;
ALTER TABLE reactions ADD CONSTRAINT reactions_emoji_check
CHECK (LENGTH(emoji) <= 10 AND emoji ~ '^[\x{1F300}-\x{1F9FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}]+$|^[👍👎👏❤️😀🤔✋]$');

-- Add index for message_id
CREATE INDEX IF NOT EXISTS idx_reactions_message_id ON reactions(message_id);

COMMENT ON COLUMN reactions.message_id IS 'Reference to message for message-specific reactions (NULL for general meeting reactions)';

-- =============================================================================
-- ALTER PARTICIPANTS TABLE FOR HAND RAISE FEATURE
-- =============================================================================

-- Add hand raise columns
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS hand_raised BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hand_raised_at TIMESTAMP WITH TIME ZONE;

-- Add index for hand_raised
CREATE INDEX IF NOT EXISTS idx_participants_hand_raised ON participants(hand_raised);

COMMENT ON COLUMN participants.hand_raised IS 'Whether participant has raised their hand';
COMMENT ON COLUMN participants.hand_raised_at IS 'Timestamp when hand was raised';

-- =============================================================================
-- UPDATE MEETINGS SETTINGS FOR CHAT PERMISSIONS
-- =============================================================================

-- Ensure meetings.settings includes chat permission fields
UPDATE meetings
SET settings = settings || '{"chat_enabled": true, "private_chat_enabled": true, "file_uploads_enabled": true}'::jsonb
WHERE NOT (settings ? 'chat_enabled');

COMMENT ON COLUMN meetings.settings IS 'JSONB settings including chat_enabled, private_chat_enabled, file_uploads_enabled, allow_screen_share, allow_recording, max_participants';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 012_add_chat_and_reactions.sql completed successfully';
    RAISE NOTICE 'Enhanced messages table with recipient_id, edited_at, is_deleted, message_read_by, file_id';
    RAISE NOTICE 'Enhanced reactions table with message_id for message-specific reactions';
    RAISE NOTICE 'Enhanced participants table with hand_raised, hand_raised_at';
    RAISE NOTICE 'Updated meetings.settings with chat permission fields';
END $$;
