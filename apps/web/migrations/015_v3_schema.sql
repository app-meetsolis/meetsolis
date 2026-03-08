-- Migration 015: v3 Executive Coach Schema
-- Alters clients table, creates sessions, action_items, solis_queries, usage_tracking, subscriptions

-- Enable pgvector extension (safe if already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- ALTER clients table: add v3 fields, drop v2 fields
-- ============================================================
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS goal TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE clients
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS linkedin_url,
  DROP COLUMN IF EXISTS tags,
  DROP COLUMN IF EXISTS status;

-- ============================================================
-- sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  session_date DATE NOT NULL,

  -- Transcript storage
  transcript_text TEXT,
  transcript_file_url TEXT,
  transcript_audio_url TEXT,

  -- AI-generated content
  summary TEXT,
  key_topics TEXT[] DEFAULT '{}',
  embedding vector(1536),

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'error')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_date ON sessions(client_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_embedding ON sessions USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sessions_all" ON sessions;
CREATE POLICY "sessions_all" ON sessions FOR ALL USING (true);

DROP TRIGGER IF EXISTS trigger_sessions_updated_at ON sessions;
CREATE TRIGGER trigger_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- action_items
-- ============================================================
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add v3 columns idempotently (safe if table already existed without them)
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES sessions(id) ON DELETE CASCADE;
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS assignee TEXT CHECK (assignee IN ('coach', 'client'));
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_action_items_client_id ON action_items(client_id);
CREATE INDEX IF NOT EXISTS idx_action_items_session_id ON action_items(session_id);
CREATE INDEX IF NOT EXISTS idx_action_items_user_id_completed ON action_items(user_id, completed);

ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "action_items_all" ON action_items;
CREATE POLICY "action_items_all" ON action_items FOR ALL USING (true);

DROP TRIGGER IF EXISTS trigger_action_items_updated_at ON action_items;
CREATE TRIGGER trigger_action_items_updated_at
  BEFORE UPDATE ON action_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- solis_queries
-- ============================================================
CREATE TABLE IF NOT EXISTS solis_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  query TEXT NOT NULL,
  response TEXT NOT NULL,
  citations JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solis_queries_user_id ON solis_queries(user_id);

ALTER TABLE solis_queries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "solis_queries_all" ON solis_queries;
CREATE POLICY "solis_queries_all" ON solis_queries FOR ALL USING (true);

-- ============================================================
-- usage_tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Transcript count (lifetime for free, monthly for pro)
  transcript_count INTEGER DEFAULT 0,
  transcript_reset_at TIMESTAMPTZ,

  -- Query count (monthly)
  query_count INTEGER DEFAULT 0,
  query_reset_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "usage_tracking_all" ON usage_tracking;
CREATE POLICY "usage_tracking_all" ON usage_tracking FOR ALL USING (true);

DROP TRIGGER IF EXISTS trigger_usage_tracking_updated_at ON usage_tracking;
CREATE TRIGGER trigger_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),

  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  current_period_end TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subscriptions_all" ON subscriptions;
CREATE POLICY "subscriptions_all" ON subscriptions FOR ALL USING (true);

DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update clients last_session_at (replaces last_meeting_at)
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS last_session_at TIMESTAMPTZ;
