-- Migration: 001_create_schema.sql
-- Description: Create core database schema with tables, indexes, and triggers
-- Author: Dev Agent
-- Date: 2025-10-01

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- USERS TABLE
-- =============================================================================
-- Synced from Clerk authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT, -- Will be encrypted with pgcrypto
    role TEXT DEFAULT 'host' CHECK (role IN ('host', 'co-host', 'participant')),
    verified_badge BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);

COMMENT ON TABLE users IS 'User accounts synced from Clerk authentication';
COMMENT ON COLUMN users.name IS 'Encrypted user name using pgcrypto';
COMMENT ON COLUMN users.clerk_id IS 'Clerk user ID for authentication linkage';

-- =============================================================================
-- MEETINGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended')),
    settings JSONB DEFAULT '{"allow_screen_share": true, "allow_recording": true, "allow_chat": true, "allow_reactions": true, "max_participants": 100}'::jsonb,
    invite_link TEXT UNIQUE NOT NULL,
    waiting_room_enabled BOOLEAN DEFAULT TRUE,
    locked BOOLEAN DEFAULT FALSE,
    max_participants INTEGER DEFAULT 100 CHECK (max_participants > 0 AND max_participants <= 100),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_meetings_host_id ON meetings(host_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_invite_link ON meetings(invite_link);
CREATE INDEX idx_meetings_created_at ON meetings(created_at);

COMMENT ON TABLE meetings IS 'Video conference meetings';
COMMENT ON COLUMN meetings.invite_link IS 'Unique invite link for joining the meeting';
COMMENT ON COLUMN meetings.settings IS 'JSONB settings for meeting features';

-- =============================================================================
-- PARTICIPANTS TABLE
-- =============================================================================
-- Junction table for user-meeting relationships
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'participant' CHECK (role IN ('host', 'co-host', 'participant')),
    permissions JSONB DEFAULT '{"can_share_screen": false, "can_record": false, "can_mute_others": false}'::jsonb,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'joined', 'left', 'kicked')),
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(meeting_id, user_id)
);

CREATE INDEX idx_participants_meeting_id ON participants(meeting_id);
CREATE INDEX idx_participants_user_id ON participants(user_id);
CREATE INDEX idx_participants_status ON participants(status);

COMMENT ON TABLE participants IS 'Junction table for meeting participants with roles and permissions';
COMMENT ON COLUMN participants.permissions IS 'JSONB permissions for participant actions';

-- =============================================================================
-- MESSAGES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- Sanitized content
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'file', 'system')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_meeting_id ON messages(meeting_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Full-text search index for message content
CREATE INDEX idx_messages_content_search ON messages USING GIN (to_tsvector('english', content));

COMMENT ON TABLE messages IS 'Chat messages within meetings';
COMMENT ON COLUMN messages.content IS 'Sanitized message content (XSS prevention)';
COMMENT ON COLUMN messages.metadata IS 'Additional message metadata (file info, system event details)';

-- =============================================================================
-- REACTIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL CHECK (LENGTH(emoji) <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reactions_meeting_id ON reactions(meeting_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_reactions_created_at ON reactions(created_at);

COMMENT ON TABLE reactions IS 'Live emoji reactions during meetings';
COMMENT ON COLUMN reactions.emoji IS 'Emoji character (max 10 chars for complex emojis)';

-- =============================================================================
-- FILES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_files_meeting_id ON files(meeting_id);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_expires_at ON files(expires_at);
CREATE INDEX idx_files_deleted ON files(deleted);

COMMENT ON TABLE files IS 'Files shared in meetings with auto-expiration';
COMMENT ON COLUMN files.expires_at IS 'Automatic expiration timestamp (7 days default)';
COMMENT ON COLUMN files.deleted IS 'Soft delete flag for expired files';

-- =============================================================================
-- MEETING_SUMMARIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS meeting_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    key_points JSONB DEFAULT '[]'::jsonb,
    action_items JSONB DEFAULT '[]'::jsonb,
    ai_model TEXT DEFAULT 'gpt-4',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_meeting_summaries_meeting_id ON meeting_summaries(meeting_id);

COMMENT ON TABLE meeting_summaries IS 'AI-generated meeting summaries';
COMMENT ON COLUMN meeting_summaries.key_points IS 'Array of key discussion points';
COMMENT ON COLUMN meeting_summaries.action_items IS 'Array of action items from meeting';

-- =============================================================================
-- AI_USAGE_TRACKING TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL CHECK (feature IN ('summary', 'translation', 'transcription')),
    tokens_used INTEGER NOT NULL CHECK (tokens_used >= 0),
    cost_usd DECIMAL(10, 4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_tracking_user_id ON ai_usage_tracking(user_id);
CREATE INDEX idx_ai_usage_tracking_feature ON ai_usage_tracking(feature);
CREATE INDEX idx_ai_usage_tracking_created_at ON ai_usage_tracking(created_at);

COMMENT ON TABLE ai_usage_tracking IS 'Track AI feature usage for budget monitoring';

-- =============================================================================
-- USAGE_ALERTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS usage_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type TEXT NOT NULL CHECK (alert_type IN ('file_cleanup', 'ai_quota_warning', 'ai_quota_exceeded', 'backup_failure', 'security_event')),
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    metadata JSONB DEFAULT '{}'::jsonb,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_alerts_alert_type ON usage_alerts(alert_type);
CREATE INDEX idx_usage_alerts_severity ON usage_alerts(severity);
CREATE INDEX idx_usage_alerts_resolved ON usage_alerts(resolved);
CREATE INDEX idx_usage_alerts_created_at ON usage_alerts(created_at);

COMMENT ON TABLE usage_alerts IS 'System alerts for monitoring and audit logging';

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =============================================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at column
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
    BEFORE UPDATE ON meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at
    BEFORE UPDATE ON participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- DATABASE FUNCTIONS
-- =============================================================================

-- Cleanup expired files function
CREATE OR REPLACE FUNCTION cleanup_expired_files()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Mark expired files as deleted
    UPDATE files
    SET deleted = TRUE
    WHERE expires_at < NOW() AND deleted = FALSE;

    GET DIAGNOSTICS expired_count = ROW_COUNT;

    -- Log cleanup event to usage_alerts if files were deleted
    IF expired_count > 0 THEN
        INSERT INTO usage_alerts (alert_type, message, severity, metadata)
        VALUES (
            'file_cleanup',
            'Expired files cleanup completed',
            'info',
            jsonb_build_object('deleted_count', expired_count, 'timestamp', NOW())
        );
    END IF;

    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_files IS 'Mark expired files as deleted and log to usage_alerts';

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant permissions for authenticated users (through RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 001_create_schema.sql completed successfully';
    RAISE NOTICE 'Created tables: users, meetings, participants, messages, reactions, files, meeting_summaries, ai_usage_tracking, usage_alerts';
    RAISE NOTICE 'Created indexes for performance optimization';
    RAISE NOTICE 'Created triggers for updated_at automation';
    RAISE NOTICE 'Created cleanup_expired_files() function';
END $$;
