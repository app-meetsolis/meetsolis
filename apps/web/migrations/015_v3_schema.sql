-- Migration 015: v3 Schema for Executive Coach Pivot
-- Alters clients table, creates sessions, action_items, solis_queries, usage_tracking, subscriptions

-- ============================================================
-- ALTER CLIENTS TABLE
-- ============================================================

-- Add v3 coaching fields
ALTER TABLE clients ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS start_date DATE;

-- Drop deprecated v2 fields (no prod data)
ALTER TABLE clients DROP COLUMN IF EXISTS phone;
ALTER TABLE clients DROP COLUMN IF EXISTS email;
ALTER TABLE clients DROP COLUMN IF EXISTS linkedin_url;
ALTER TABLE clients DROP COLUMN IF EXISTS tags;

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- user_id = Clerk ID (TEXT) directly — no extra join
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subscriptions_all" ON subscriptions;
CREATE POLICY "subscriptions_all" ON subscriptions FOR ALL USING (true);

DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SESSIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  -- Session content
  title TEXT,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transcript_text TEXT,
  transcript_file_url TEXT,
  transcript_audio_url TEXT,

  -- AI-generated content
  summary TEXT,
  key_topics TEXT[] DEFAULT '{}',
  embedding vector(1536),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'error')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_date ON sessions(session_date DESC);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sessions_all" ON sessions;
CREATE POLICY "sessions_all" ON sessions FOR ALL USING (true);

DROP TRIGGER IF EXISTS trigger_sessions_updated_at ON sessions;
CREATE TRIGGER trigger_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ACTION ITEMS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_action_items_session_id ON action_items(session_id);
CREATE INDEX IF NOT EXISTS idx_action_items_client_id ON action_items(client_id);
CREATE INDEX IF NOT EXISTS idx_action_items_user_id ON action_items(user_id);
CREATE INDEX IF NOT EXISTS idx_action_items_completed ON action_items(completed);

ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "action_items_all" ON action_items;
CREATE POLICY "action_items_all" ON action_items FOR ALL USING (true);

DROP TRIGGER IF EXISTS trigger_action_items_updated_at ON action_items;
CREATE TRIGGER trigger_action_items_updated_at
  BEFORE UPDATE ON action_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SOLIS QUERIES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS solis_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  query TEXT NOT NULL,
  response TEXT,
  source_session_ids UUID[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solis_queries_user_id ON solis_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_solis_queries_client_id ON solis_queries(client_id);

ALTER TABLE solis_queries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "solis_queries_all" ON solis_queries;
CREATE POLICY "solis_queries_all" ON solis_queries FOR ALL USING (true);

-- ============================================================
-- USAGE TRACKING TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  month TEXT NOT NULL, -- 'YYYY-MM'
  transcript_count INTEGER NOT NULL DEFAULT 0,
  query_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "usage_tracking_all" ON usage_tracking;
CREATE POLICY "usage_tracking_all" ON usage_tracking FOR ALL USING (true);

DROP TRIGGER IF EXISTS trigger_usage_tracking_updated_at ON usage_tracking;
CREATE TRIGGER trigger_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ENABLE PGVECTOR EXTENSION
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- Vector similarity search index on sessions.embedding
CREATE INDEX IF NOT EXISTS idx_sessions_embedding ON sessions
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================
-- MATCH SESSIONS FUNCTION (pgvector semantic search)
-- ============================================================

CREATE OR REPLACE FUNCTION match_sessions(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id text,
  filter_client_id uuid DEFAULT NULL
)
RETURNS TABLE (id uuid, similarity float)
LANGUAGE sql STABLE
AS $$
  SELECT
    s.id,
    1 - (s.embedding <=> query_embedding) AS similarity
  FROM sessions s
  WHERE
    s.user_id = filter_user_id
    AND (filter_client_id IS NULL OR s.client_id = filter_client_id)
    AND s.embedding IS NOT NULL
    AND 1 - (s.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- ============================================================
-- INCREMENT USAGE FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id text,
  p_month text,
  p_field text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO usage_tracking (user_id, month, query_count, transcript_count)
  VALUES (p_user_id, p_month,
    CASE WHEN p_field = 'query_count' THEN 1 ELSE 0 END,
    CASE WHEN p_field = 'transcript_count' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, month) DO UPDATE
  SET
    query_count = CASE WHEN p_field = 'query_count'
      THEN usage_tracking.query_count + 1
      ELSE usage_tracking.query_count END,
    transcript_count = CASE WHEN p_field = 'transcript_count'
      THEN usage_tracking.transcript_count + 1
      ELSE usage_tracking.transcript_count END;
END;
$$;
