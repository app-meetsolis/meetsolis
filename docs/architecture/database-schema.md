# Database Schema

**Version:** 2.0 (Updated for Client Memory Pivot)
**Last Updated:** January 6, 2026

## Schema Overview

MeetSolis v2.0 uses a client-centric data model where all information is organized around client cards. Each user manages their own clients, meetings, notes, and action items with full Row-Level Security isolation.

## Core Tables

### 1. Clients Table

Stores client information and serves as the central hub for all client-related data.

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  linkedin_url TEXT,

  -- AI-Generated Content
  overview TEXT, -- AI-generated or manual client summary
  research_data JSONB, -- Scraped public data from website/LinkedIn

  -- Organization
  tags TEXT[] DEFAULT '{}', -- Max 3 tags per client
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_meeting_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_user_id_created_at ON clients(user_id, created_at DESC);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_tags ON clients USING GIN(tags);

-- RLS Policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. Meetings Table

Stores meeting logs with transcripts, summaries, and metadata.

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Meeting Details
  title TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER,
  platform TEXT, -- 'google_meet', 'zoom', 'teams', 'other'
  meeting_url TEXT,

  -- Content
  notes TEXT, -- Manual notes
  transcript TEXT, -- From Gladia or manual upload
  summary JSONB, -- {overview, key_points[], decisions[], next_steps[]}

  -- File References
  transcript_file_path TEXT, -- Supabase Storage: {user_id}/meetings/{meeting_id}/transcript.txt
  recording_file_path TEXT, -- Supabase Storage: {user_id}/meetings/{meeting_id}/recording.mp3

  -- Processing Status
  ai_processed BOOLEAN DEFAULT FALSE,
  ai_processed_at TIMESTAMPTZ,
  processing_error TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_client_id ON meetings(client_id);
CREATE INDEX idx_meetings_client_date ON meetings(client_id, date DESC);
CREATE INDEX idx_meetings_ai_processed ON meetings(ai_processed) WHERE NOT ai_processed;

-- RLS Policies
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meetings" ON meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own meetings" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meetings" ON meetings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings" ON meetings
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Action Items Table

Tracks tasks and commitments extracted from meetings or added manually.

```sql
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,

  -- Content
  description TEXT NOT NULL,
  status TEXT DEFAULT 'to_prepare' CHECK (status IN ('to_prepare', 'promised', 'done', 'canceled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),

  -- Dates
  due_date DATE,
  completed_at TIMESTAMPTZ,

  -- Source
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ai_extracted')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_action_items_user_id ON action_items(user_id);
CREATE INDEX idx_action_items_client_id ON action_items(client_id);
CREATE INDEX idx_action_items_status ON action_items(status);
CREATE INDEX idx_action_items_due_date ON action_items(due_date) WHERE status != 'done';

-- RLS Policies
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own action items" ON action_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own action items" ON action_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own action items" ON action_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own action items" ON action_items
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Embeddings Table (pgvector for RAG)

Stores vector embeddings for semantic search across meeting transcripts and notes.

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL, -- Original text chunk
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small

  -- Metadata
  chunk_index INTEGER, -- For multi-chunk documents
  source_type TEXT CHECK (source_type IN ('meeting_transcript', 'meeting_notes', 'client_overview')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_embeddings_user_id ON embeddings(user_id);
CREATE INDEX idx_embeddings_client_id ON embeddings(client_id);
CREATE INDEX idx_embeddings_meeting_id ON embeddings(meeting_id);
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- RLS Policies
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own embeddings" ON embeddings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage embeddings" ON embeddings
  FOR ALL USING (true) WITH CHECK (true); -- Managed by backend
```

### 5. User Preferences Table

Stores user settings and tier limits.

```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Subscription
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'annual')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due')),

  -- Usage Tracking (for tier enforcement)
  clients_count INTEGER DEFAULT 0,
  ai_meetings_this_month INTEGER DEFAULT 0,
  ai_queries_this_month INTEGER DEFAULT 0,

  -- Limits (enforced based on tier)
  max_clients INTEGER DEFAULT 3, -- Free: 3, Pro: 50
  max_ai_meetings_per_month INTEGER DEFAULT 3, -- Free: 3, Pro: 20
  max_ai_queries_per_month INTEGER DEFAULT 100, -- Free: 100, Pro: 1000

  -- Preferences
  preferences JSONB DEFAULT '{
    "email_notifications": true,
    "ai_auto_summarize": true,
    "default_meeting_platform": "google_meet"
  }'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);
```

## Supporting Tables

### 6. AI Usage Tracking

Monitors AI API usage for cost control.

```sql
CREATE TABLE ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Service Info
  service TEXT NOT NULL CHECK (service IN ('openai', 'gladia')),
  operation TEXT NOT NULL, -- 'transcription', 'summary', 'embedding', 'rag_query', 'research'

  -- Usage Metrics
  tokens_used INTEGER,
  characters_processed INTEGER,
  duration_seconds INTEGER,
  cost_usd DECIMAL(10, 4),

  -- Context
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_usage_user_id ON ai_usage_tracking(user_id);
CREATE INDEX idx_ai_usage_service ON ai_usage_tracking(service);
CREATE INDEX idx_ai_usage_created_at ON ai_usage_tracking(created_at);
```

## Database Functions

### Update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON action_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Update Client Last Meeting

```sql
CREATE OR REPLACE FUNCTION update_client_last_meeting()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clients
  SET last_meeting_at = NEW.date
  WHERE id = NEW.client_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_last_meeting_trigger
  AFTER INSERT ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_client_last_meeting();
```

### RAG Similarity Search Function

```sql
CREATE OR REPLACE FUNCTION search_embeddings(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  filter_user_id UUID DEFAULT NULL,
  filter_client_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  client_id UUID,
  meeting_id UUID,
  source_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.content,
    1 - (e.embedding <=> query_embedding) AS similarity,
    e.client_id,
    e.meeting_id,
    e.source_type
  FROM embeddings e
  WHERE
    (filter_user_id IS NULL OR e.user_id = filter_user_id)
    AND (filter_client_id IS NULL OR e.client_id = filter_client_id)
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
```

## Migration Strategy from v1.0

**For existing v1.0 deployments:**

1. **Backup existing data** (meetings table has participant/message data)
2. **Archive v1.0 schema** (rename tables with `_v1` suffix)
3. **Create v2.0 schema** (run above SQL)
4. **Optional data migration:**
   - Convert v1.0 `meetings` → v2.0 `clients` (extract unique participants as clients)
   - Convert v1.0 `meeting_summaries` → v2.0 `meetings` (preserve AI summaries)
5. **Drop v1.0 tables** after verification

## Notes

- **RLS Isolation:** Each user can only access their own data
- **Tier Enforcement:** API layer checks `user_preferences.max_*` limits before operations
- **Cost Monitoring:** `ai_usage_tracking` logs all AI API calls for budget tracking
- **pgvector Performance:** `ivfflat` index optimizes similarity search for 100-1000 users
- **File Storage:** Actual files stored in Supabase Storage, referenced by paths in schema
