-- Migration: Add action_items table and next_steps field for Story 2.6
-- Created: 2026-01-12

-- Create action_items table for manual action item tracking
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL CHECK (LENGTH(TRIM(description)) > 0),
  completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_action_items_client_id ON action_items(client_id);
CREATE INDEX IF NOT EXISTS idx_action_items_user_id ON action_items(user_id);

-- Enable Row Level Security
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own action items
CREATE POLICY "Users can only access their own action items"
  ON action_items FOR ALL
  USING (user_id = auth.uid());

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON action_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add next_steps JSONB field to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS next_steps JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN clients.next_steps IS 'Array of next step strings for manual tracking (max 10 steps, max 200 chars each)';
COMMENT ON TABLE action_items IS 'Manual action items for client tracking (Story 2.6 MVP)';
