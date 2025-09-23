# Database Schema

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (synced from Clerk)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL, -- Clerk user ID for sync
    email TEXT NOT NULL,
    name TEXT, -- Encrypted in production
    role TEXT DEFAULT 'host' CHECK (role IN ('host', 'co-host', 'participant')),
    verified_badge BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{
        "auto_mute_on_join": true,
        "default_video_off": false,
        "preferred_view": "gallery",
        "theme": "light"
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings table
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended')),
    scheduled_start TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{
        "allow_screen_share": true,
        "allow_whiteboard": true,
        "allow_file_upload": true,
        "auto_record": false,
        "enable_reactions": true,
        "enable_polls": true,
        "background_blur_default": false
    }'::jsonb,
    invite_link TEXT UNIQUE NOT NULL,
    waiting_room_enabled BOOLEAN DEFAULT TRUE,
    locked BOOLEAN DEFAULT FALSE,
    max_participants INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participants table (junction table for meeting participation)
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'participant' CHECK (role IN ('host', 'co-host', 'participant')),
    join_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    leave_time TIMESTAMP WITH TIME ZONE,
    is_muted BOOLEAN DEFAULT TRUE, -- Auto-mute on join
    is_video_off BOOLEAN DEFAULT FALSE,
    permissions JSONB DEFAULT '{
        "can_share_screen": true,
        "can_use_whiteboard": true,
        "can_upload_files": true,
        "can_send_messages": true,
        "can_create_polls": true,
        "can_use_reactions": true
    }'::jsonb,
    connection_quality TEXT DEFAULT 'good' CHECK (connection_quality IN ('excellent', 'good', 'poor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(meeting_id, user_id) -- Prevent duplicate participation
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- Sanitized content
    type TEXT DEFAULT 'public' CHECK (type IN ('public', 'private', 'system')),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE, -- For private messages
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reactions table
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL CHECK (emoji IN ('👍', '👎', '👏', '❤️', '😀', '🤔', '✋')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT NOT NULL, -- Supabase Storage path
    url TEXT, -- Signed URL (temporary)
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting summaries (AI-generated)
CREATE TABLE meeting_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    action_items JSONB DEFAULT '[]'::jsonb,
    key_points JSONB DEFAULT '[]'::jsonb,
    generated_by TEXT DEFAULT 'openai-gpt4',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI usage tracking
CREATE TABLE ai_usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month TEXT NOT NULL, -- YYYY-MM format
    usage_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(month)
);

-- Usage alerts
CREATE TABLE usage_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service TEXT NOT NULL,
    metric TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    usage_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_meetings_host_id ON meetings(host_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_participants_meeting_id ON participants(meeting_id);
CREATE INDEX idx_participants_user_id ON participants(user_id);
CREATE INDEX idx_messages_meeting_id ON messages(meeting_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_reactions_meeting_id ON reactions(meeting_id);
CREATE INDEX idx_files_meeting_id ON files(meeting_id);
CREATE INDEX idx_files_expires_at ON files(expires_at);
CREATE INDEX idx_usage_alerts_service ON usage_alerts(service);
CREATE INDEX idx_usage_alerts_created_at ON usage_alerts(created_at);

-- Full-text search index for messages
CREATE INDEX idx_messages_content_search ON messages USING gin(to_tsvector('english', content));

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = clerk_id);

-- RLS Policies for Meetings
CREATE POLICY "Hosts can manage own meetings" ON meetings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = meetings.host_id
            AND users.clerk_id = auth.uid()::text
        )
    );

CREATE POLICY "Participants can view joined meetings" ON meetings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM participants
            JOIN users ON users.id = participants.user_id
            WHERE participants.meeting_id = meetings.id
            AND users.clerk_id = auth.uid()::text
        )
    );

-- RLS Policies for Participants
CREATE POLICY "Meeting participants can view other participants" ON participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM participants p2
            JOIN users ON users.id = p2.user_id
            WHERE p2.meeting_id = participants.meeting_id
            AND users.clerk_id = auth.uid()::text
        )
    );

-- RLS Policies for Messages
CREATE POLICY "Meeting participants can view public messages" ON messages
    FOR SELECT USING (
        type = 'public' AND
        EXISTS (
            SELECT 1 FROM participants
            JOIN users ON users.id = participants.user_id
            WHERE participants.meeting_id = messages.meeting_id
            AND users.clerk_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can send messages to meetings they joined" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM participants
            JOIN users ON users.id = participants.user_id
            WHERE participants.meeting_id = messages.meeting_id
            AND users.clerk_id = auth.uid()::text
            AND participants.permissions->>'can_send_messages' = 'true'
        )
    );

-- Functions for automated cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_files()
RETURNS void AS $$
BEGIN
    -- Mark expired files as deleted
    UPDATE files
    SET is_deleted = TRUE
    WHERE expires_at < NOW() AND NOT is_deleted;

    -- Log cleanup action
    INSERT INTO usage_alerts (service, metric, alert_type, usage_data)
    VALUES ('system', 'file_cleanup', 'info', jsonb_build_object('deleted_count', ROW_COUNT));
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
    BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
