-- Migration 010: Create audit_logs table for compliance and debugging
-- Tracks all host/co-host actions in meetings
-- Created: 2025-12-17
-- Story: 2.3 (Video Layout and Participant Management)

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Who performed the action
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- What meeting was affected
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,

    -- Action details
    action TEXT NOT NULL CHECK (action IN (
        'spotlight_set',
        'spotlight_clear',
        'meeting_locked',
        'meeting_unlocked',
        'participant_promoted',
        'participant_demoted',
        'participant_removed',
        'participant_admitted',
        'participant_rejected'
    )),

    -- Target user (for role changes, removals, etc.)
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Additional context (JSON for flexibility)
    metadata JSONB DEFAULT '{}',

    -- IP address for security auditing
    ip_address INET,

    -- User agent for security auditing
    user_agent TEXT,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_meeting_id ON audit_logs(meeting_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_target_user_id ON audit_logs(target_user_id) WHERE target_user_id IS NOT NULL;

-- Composite index for common query pattern (meeting + time)
CREATE INDEX idx_audit_logs_meeting_created ON audit_logs(meeting_id, created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE audit_logs IS 'Audit trail for all host/co-host actions in meetings. Required for GDPR/SOC2 compliance and debugging.';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed. Enum ensures data consistency.';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context in JSON format (e.g., old_role, new_role for promotions).';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the user who performed the action (for security auditing).';
