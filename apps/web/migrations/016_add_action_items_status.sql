-- Migration 016: Add status column to action_items
-- Story 2.6: Client Detail View — action items status tracking

-- Add status column (additive, idempotent)
ALTER TABLE action_items
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'));

-- Migrate existing data: completed=true → status='completed'
UPDATE action_items
  SET status = 'completed'
  WHERE completed = TRUE AND status = 'pending';

-- Index for pending action item queries (GET ?status=pending)
CREATE INDEX IF NOT EXISTS idx_action_items_user_status
  ON action_items(user_id, status)
  WHERE status = 'pending';
