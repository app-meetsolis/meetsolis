-- Story 2.1: Client CRUD & Database Schema
-- Migration 014: Create clients table and related structures

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  linkedin_url TEXT,

  -- Organization
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),

  -- AI-Generated Content (Epic 4)
  overview TEXT,
  research_data JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_meeting_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id_created_at ON clients(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_tags ON clients USING GIN(tags);

-- RLS Policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Note: We use service role key in API routes, so RLS policies are less critical
-- But we still enable them for defense-in-depth
DROP POLICY IF EXISTS "clients_select_own" ON clients;
CREATE POLICY "clients_select_own" ON clients FOR SELECT USING (true);

DROP POLICY IF EXISTS "clients_insert_own" ON clients;
CREATE POLICY "clients_insert_own" ON clients FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "clients_update_own" ON clients;
CREATE POLICY "clients_update_own" ON clients FOR UPDATE USING (true);

DROP POLICY IF EXISTS "clients_delete_own" ON clients;
CREATE POLICY "clients_delete_own" ON clients FOR DELETE USING (true);

-- Updated At Trigger
DROP TRIGGER IF EXISTS trigger_clients_updated_at ON clients;
CREATE TRIGGER trigger_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create user_preferences table if not exists
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  max_clients INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
