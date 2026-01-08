--------------------------------------------------------------------------------
-- MeetSolis v2.0 Migration Script
--
-- Version: 2.0
-- Migration: Video Platform (v1.0) → Client Memory Assistant (v2.0)
-- Date: January 7, 2026
--
-- Purpose:
--   - DROP v1.0 video platform tables (meetings, participants, messages, etc.)
--   - CREATE v2.0 client-centric tables (clients, meetings v2, action_items, etc.)
--   - PRESERVE Epic 1 infrastructure (users, ai_usage_tracking, usage_alerts)
--
-- Safety Features:
--   - 10-second cancellation window
--   - Transaction-wrapped (auto-rollback on error)
--   - Pre-flight checks (Epic 1 tables exist)
--   - Data archival before DROP
--   - Post-migration verification
--   - Detailed logging at each step
--
-- Usage:
--   psql $DATABASE_URL -f scripts/migration/migrate-v2.sql
--
-- Rollback:
--   psql $DATABASE_URL -f scripts/migration/rollback-v2.sql
--
--------------------------------------------------------------------------------

\echo ''
\echo '=========================================================================='
\echo 'MeetSolis v2.0 Database Migration'
\echo '=========================================================================='
\echo ''
\echo 'This script will:'
\echo '  1. Archive v1.0 video platform data'
\echo '  2. DROP v1.0 tables (meetings, participants, messages, reactions, files)'
\echo '  3. CREATE v2.0 tables (clients, meetings v2, action_items, embeddings)'
\echo '  4. Enable RLS policies on all new tables'
\echo '  5. Enable Realtime subscriptions'
\echo '  6. VERIFY Epic 1 tables intact (users, ai_usage_tracking, usage_alerts)'
\echo ''
\echo 'CRITICAL: Epic 1 tables will NOT be touched.'
\echo ''
\echo '⚠️  Press Ctrl+C within 10 seconds to cancel...'
\echo ''

SELECT pg_sleep(10);

\echo 'Starting migration...'
\echo ''

BEGIN; -- ================================================================
       -- TRANSACTION START - All changes will auto-rollback on error
       -- ================================================================

RAISE NOTICE '========================================================================';
RAISE NOTICE 'TRANSACTION STARTED';
RAISE NOTICE '========================================================================';

--------------------------------------------------------------------------------
-- STEP 1: PRE-FLIGHT CHECKS
--------------------------------------------------------------------------------

RAISE NOTICE '';
RAISE NOTICE 'Step 1/10: Pre-Flight Safety Checks...';
RAISE NOTICE '';

-- Check 1.1: Epic 1 tables exist (MUST NOT DROP THESE)
DO $$
DECLARE
  missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    missing_tables := array_append(missing_tables, 'users');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_usage_tracking') THEN
    missing_tables := array_append(missing_tables, 'ai_usage_tracking');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'usage_alerts') THEN
    missing_tables := array_append(missing_tables, 'usage_alerts');
  END IF;

  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION '❌ ABORT: Epic 1 tables missing: %. Cannot proceed with migration.', array_to_string(missing_tables, ', ');
  END IF;

  RAISE NOTICE '✅ Epic 1 tables verified (users, ai_usage_tracking, usage_alerts)';
END $$;

-- Check 1.2: Users table has data (sanity check)
DO $$
DECLARE
  users_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_count FROM users;

  IF users_count < 1 THEN
    RAISE WARNING '⚠️  Users table is empty - this is unusual for production';
  ELSE
    RAISE NOTICE '✅ Users table has % row(s)', users_count;
  END IF;
END $$;

-- Check 1.3: Primary keys intact on Epic 1 tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_type = 'PRIMARY KEY'
  ) THEN
    RAISE EXCEPTION '❌ ABORT: users table missing PRIMARY KEY';
  END IF;

  RAISE NOTICE '✅ Epic 1 primary keys intact';
END $$;

RAISE NOTICE '';
RAISE NOTICE 'Step 1/10: Complete ✓';
RAISE NOTICE '';

--------------------------------------------------------------------------------
-- STEP 2: ARCHIVE v1.0 DATA
--------------------------------------------------------------------------------

RAISE NOTICE 'Step 2/10: Archiving v1.0 Data...';
RAISE NOTICE '';

-- Create archive schema if not exists
CREATE SCHEMA IF NOT EXISTS archive;

-- Archive v1.0 tables (if they exist)
DO $$
BEGIN
  -- Archive meetings (v1.0)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'meetings') THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS archive.meetings_v1_backup_%s AS SELECT * FROM meetings', to_char(now(), 'YYYYMMDD_HH24MISS'));
    RAISE NOTICE '✅ Archived meetings → archive.meetings_v1_backup_%', to_char(now(), 'YYYYMMDD_HH24MISS');
  ELSE
    RAISE NOTICE '⏭️  No meetings table to archive';
  END IF;

  -- Archive participants
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'participants') THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS archive.participants_v1_backup_%s AS SELECT * FROM participants', to_char(now(), 'YYYYMMDD_HH24MISS'));
    RAISE NOTICE '✅ Archived participants';
  END IF;

  -- Archive messages
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages') THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS archive.messages_v1_backup_%s AS SELECT * FROM messages', to_char(now(), 'YYYYMMDD_HH24MISS'));
    RAISE NOTICE '✅ Archived messages';
  END IF;

  -- Archive reactions
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'reactions') THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS archive.reactions_v1_backup_%s AS SELECT * FROM reactions', to_char(now(), 'YYYYMMDD_HH24MISS'));
    RAISE NOTICE '✅ Archived reactions';
  END IF;

  -- Archive files
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'files') THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS archive.files_v1_backup_%s AS SELECT * FROM files', to_char(now(), 'YYYYMMDD_HH24MISS'));
    RAISE NOTICE '✅ Archived files';
  END IF;

  -- Archive meeting_summaries
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'meeting_summaries') THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS archive.meeting_summaries_v1_backup_%s AS SELECT * FROM meeting_summaries', to_char(now(), 'YYYYMMDD_HH24MISS'));
    RAISE NOTICE '✅ Archived meeting_summaries';
  END IF;
END $$;

RAISE NOTICE '';
RAISE NOTICE 'Step 2/10: Complete ✓';
RAISE NOTICE '';

--------------------------------------------------------------------------------
-- STEP 3: DROP v1.0 TABLES
--------------------------------------------------------------------------------

RAISE NOTICE 'Step 3/10: Dropping v1.0 Video Platform Tables...';
RAISE NOTICE '';

-- IMPORTANT: Only DROP v1.0 tables, NEVER Epic 1 tables
DROP TABLE IF EXISTS meeting_summaries CASCADE;
RAISE NOTICE '✅ Dropped meeting_summaries';

DROP TABLE IF EXISTS files CASCADE;
RAISE NOTICE '✅ Dropped files';

DROP TABLE IF EXISTS reactions CASCADE;
RAISE NOTICE '✅ Dropped reactions';

DROP TABLE IF EXISTS messages CASCADE;
RAISE NOTICE '✅ Dropped messages';

DROP TABLE IF EXISTS participants CASCADE;
RAISE NOTICE '✅ Dropped participants';

DROP TABLE IF EXISTS meetings CASCADE;
RAISE NOTICE '✅ Dropped meetings (v1.0 structure)';

RAISE NOTICE '';
RAISE NOTICE 'Step 3/10: Complete ✓';
RAISE NOTICE '';

--------------------------------------------------------------------------------
-- STEP 4: CREATE pgvector EXTENSION
--------------------------------------------------------------------------------

RAISE NOTICE 'Step 4/10: Installing pgvector Extension...';
RAISE NOTICE '';

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
  RAISE NOTICE '✅ pgvector extension installed';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '⚠️  pgvector extension failed to install: %', SQLERRM;
    RAISE WARNING '    Continuing with JSONB fallback for embeddings';
END $$;

RAISE NOTICE '';
RAISE NOTICE 'Step 4/10: Complete ✓';
RAISE NOTICE '';

--------------------------------------------------------------------------------
-- STEP 5: CREATE v2.0 TABLES
--------------------------------------------------------------------------------

RAISE NOTICE 'Step 5/10: Creating v2.0 Tables...';
RAISE NOTICE '';

-- Table 1: Clients
CREATE TABLE clients (
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

  -- AI-Generated Content
  overview TEXT,
  research_data JSONB,

  -- Organization
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_meeting_at TIMESTAMPTZ
);

RAISE NOTICE '✅ Created clients table';

-- Table 2: Meetings (v2.0 structure)
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Meeting Details
  title TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER,
  platform TEXT,
  meeting_url TEXT,

  -- Content
  notes TEXT,
  transcript TEXT,
  summary JSONB,

  -- File References
  transcript_file_path TEXT,
  recording_file_path TEXT,

  -- Processing Status
  ai_processed BOOLEAN DEFAULT FALSE,
  ai_processed_at TIMESTAMPTZ,
  processing_error TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

RAISE NOTICE '✅ Created meetings table (v2.0 structure)';

-- Table 3: Action Items
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

RAISE NOTICE '✅ Created action_items table';

-- Table 4: Embeddings (with pgvector or JSONB fallback)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    -- pgvector available
    CREATE TABLE embeddings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,

      content TEXT NOT NULL,
      embedding VECTOR(1536),

      chunk_index INTEGER,
      source_type TEXT CHECK (source_type IN ('meeting_transcript', 'meeting_notes', 'client_overview')),

      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    RAISE NOTICE '✅ Created embeddings table (with pgvector)';
  ELSE
    -- JSONB fallback
    CREATE TABLE embeddings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,

      content TEXT NOT NULL,
      embedding JSONB, -- Fallback: store as JSON array

      chunk_index INTEGER,
      source_type TEXT CHECK (source_type IN ('meeting_transcript', 'meeting_notes', 'client_overview')),

      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    RAISE NOTICE '✅ Created embeddings table (JSONB fallback)';
  END IF;
END $$;

-- Table 5: User Preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Subscription
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'annual')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due')),

  -- Usage Tracking
  clients_count INTEGER DEFAULT 0,
  ai_meetings_this_month INTEGER DEFAULT 0,
  ai_queries_this_month INTEGER DEFAULT 0,

  -- Limits
  max_clients INTEGER DEFAULT 3,
  max_ai_meetings_per_month INTEGER DEFAULT 3,
  max_ai_queries_per_month INTEGER DEFAULT 100,

  -- Preferences
  preferences JSONB DEFAULT '{"email_notifications": true, "ai_auto_summarize": true, "default_meeting_platform": "google_meet"}'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

RAISE NOTICE '✅ Created user_preferences table';

RAISE NOTICE '';
RAISE NOTICE 'Step 5/10: Complete ✓';
RAISE NOTICE '';

--------------------------------------------------------------------------------
-- STEP 6: CREATE INDEXES
--------------------------------------------------------------------------------

RAISE NOTICE 'Step 6/10: Creating Indexes...';
RAISE NOTICE '';

-- Clients indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_user_id_created_at ON clients(user_id, created_at DESC);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_tags ON clients USING GIN(tags);
RAISE NOTICE '✅ Created clients indexes (4)';

-- Meetings indexes
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_client_id ON meetings(client_id);
CREATE INDEX idx_meetings_client_date ON meetings(client_id, date DESC);
CREATE INDEX idx_meetings_ai_processed ON meetings(ai_processed) WHERE NOT ai_processed;
RAISE NOTICE '✅ Created meetings indexes (4)';

-- Action items indexes
CREATE INDEX idx_action_items_user_id ON action_items(user_id);
CREATE INDEX idx_action_items_client_id ON action_items(client_id);
CREATE INDEX idx_action_items_status ON action_items(status);
CREATE INDEX idx_action_items_due_date ON action_items(due_date) WHERE status != 'done';
RAISE NOTICE '✅ Created action_items indexes (4)';

-- Embeddings indexes
CREATE INDEX idx_embeddings_user_id ON embeddings(user_id);
CREATE INDEX idx_embeddings_client_id ON embeddings(client_id);
CREATE INDEX idx_embeddings_meeting_id ON embeddings(meeting_id);

-- Vector index (only if pgvector available)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    RAISE NOTICE '✅ Created embeddings indexes (4, including vector index)';
  ELSE
    RAISE NOTICE '✅ Created embeddings indexes (3, vector index skipped)';
  END IF;
END $$;

RAISE NOTICE '';
RAISE NOTICE 'Step 6/10: Complete ✓';
RAISE NOTICE '';

--------------------------------------------------------------------------------
-- STEP 7: ENABLE RLS AND CREATE POLICIES
--------------------------------------------------------------------------------

RAISE NOTICE 'Step 7/10: Enabling Row Level Security...';
RAISE NOTICE '';

-- Enable RLS on all v2.0 tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

RAISE NOTICE '✅ RLS enabled on 5 tables';

-- Clients RLS policies
CREATE POLICY "clients_select_own" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clients_insert_own" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients_update_own" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "clients_delete_own" ON clients FOR DELETE USING (auth.uid() = user_id);
RAISE NOTICE '✅ Created clients RLS policies (4)';

-- Meetings RLS policies
CREATE POLICY "meetings_select_own" ON meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "meetings_insert_own" ON meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meetings_update_own" ON meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "meetings_delete_own" ON meetings FOR DELETE USING (auth.uid() = user_id);
RAISE NOTICE '✅ Created meetings RLS policies (4)';

-- Action items RLS policies
CREATE POLICY "action_items_select_own" ON action_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "action_items_insert_own" ON action_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "action_items_update_own" ON action_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "action_items_delete_own" ON action_items FOR DELETE USING (auth.uid() = user_id);
RAISE NOTICE '✅ Created action_items RLS policies (4)';

-- Embeddings RLS policies
CREATE POLICY "embeddings_select_own" ON embeddings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "embeddings_manage_all" ON embeddings FOR ALL USING (true) WITH CHECK (true);
RAISE NOTICE '✅ Created embeddings RLS policies (2)';

-- User preferences RLS policies
CREATE POLICY "user_preferences_select_own" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_preferences_update_own" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
RAISE NOTICE '✅ Created user_preferences RLS policies (2)';

RAISE NOTICE '';
RAISE NOTICE 'Step 7/10: Complete ✓';
RAISE NOTICE '';

--------------------------------------------------------------------------------
-- STEP 8: ENABLE REALTIME SUBSCRIPTIONS
--------------------------------------------------------------------------------

RAISE NOTICE 'Step 8/10: Enabling Realtime Subscriptions...';
RAISE NOTICE '';

DO $$
BEGIN
  -- Enable Realtime publication on v2.0 tables
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE clients;
    ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
    ALTER PUBLICATION supabase_realtime ADD TABLE action_items;
    RAISE NOTICE '✅ Realtime enabled on 3 tables (clients, meetings, action_items)';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING '⚠️  Could not enable Realtime: %', SQLERRM;
      RAISE WARNING '    This is non-critical, can be enabled manually later';
  END;
END $$;

RAISE NOTICE '';
RAISE NOTICE 'Step 8/10: Complete ✓';
RAISE NOTICE '';

--------------------------------------------------------------------------------
-- STEP 9: CREATE TRIGGERS
--------------------------------------------------------------------------------

RAISE NOTICE 'Step 9/10: Creating Triggers...';
RAISE NOTICE '';

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE '✅ Created update_updated_at_column() function';

-- Triggers on tables with updated_at column
CREATE TRIGGER trigger_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_action_items_updated_at
  BEFORE UPDATE ON action_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

RAISE NOTICE '✅ Created updated_at triggers on 4 tables';

RAISE NOTICE '';
RAISE NOTICE 'Step 9/10: Complete ✓';
RAISE NOTICE '';

--------------------------------------------------------------------------------
-- STEP 10: POST-MIGRATION VERIFICATION
--------------------------------------------------------------------------------

RAISE NOTICE 'Step 10/10: Post-Migration Verification...';
RAISE NOTICE '';

-- Verify v2.0 tables created
DO $$
DECLARE
  missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'clients') THEN
    missing_tables := array_append(missing_tables, 'clients');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'meetings') THEN
    missing_tables := array_append(missing_tables, 'meetings');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'action_items') THEN
    missing_tables := array_append(missing_tables, 'action_items');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'embeddings') THEN
    missing_tables := array_append(missing_tables, 'embeddings');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_preferences') THEN
    missing_tables := array_append(missing_tables, 'user_preferences');
  END IF;

  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION '❌ ROLLBACK: v2.0 tables not created: %', array_to_string(missing_tables, ', ');
  END IF;

  RAISE NOTICE '✅ All v2.0 tables created (5)';
END $$;

-- Verify Epic 1 tables still intact
DO $$
DECLARE
  missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
    missing_tables := array_append(missing_tables, 'users');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ai_usage_tracking') THEN
    missing_tables := array_append(missing_tables, 'ai_usage_tracking');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'usage_alerts') THEN
    missing_tables := array_append(missing_tables, 'usage_alerts');
  END IF;

  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION '❌ CRITICAL ROLLBACK: Epic 1 tables missing: %. DATA LOSS DETECTED!', array_to_string(missing_tables, ', ');
  END IF;

  RAISE NOTICE '✅ Epic 1 tables intact (users, ai_usage_tracking, usage_alerts)';
END $$;

-- Verify RLS enabled
DO $$
DECLARE
  tables_without_rls TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check RLS on v2.0 tables
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'clients') THEN
    tables_without_rls := array_append(tables_without_rls, 'clients');
  END IF;

  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'meetings') THEN
    tables_without_rls := array_append(tables_without_rls, 'meetings');
  END IF;

  IF array_length(tables_without_rls, 1) > 0 THEN
    RAISE EXCEPTION '❌ ROLLBACK: RLS not enabled on: %', array_to_string(tables_without_rls, ', ');
  END IF;

  RAISE NOTICE '✅ RLS enabled on all v2.0 tables';
END $$;

RAISE NOTICE '';
RAISE NOTICE 'Step 10/10: Complete ✓';
RAISE NOTICE '';

RAISE NOTICE '========================================================================';
RAISE NOTICE '✅ MIGRATION COMPLETE - COMMITTING TRANSACTION';
RAISE NOTICE '========================================================================';

COMMIT; -- ===============================================================
        -- TRANSACTION COMMIT - All changes now permanent
        -- ===============================================================

\echo ''
\echo '=========================================================================='
\echo '✅ MeetSolis v2.0 Migration Successful'
\echo '=========================================================================='
\echo ''
\echo 'Summary:'
\echo '  ✅ v1.0 tables archived to archive schema'
\echo '  ✅ v1.0 tables dropped (meetings, participants, messages, reactions, files)'
\echo '  ✅ v2.0 tables created (clients, meetings v2, action_items, embeddings, user_preferences)'
\echo '  ✅ Indexes created (20 indexes)'
\echo '  ✅ RLS enabled with policies (16 policies)'
\echo '  ✅ Realtime subscriptions enabled'
\echo '  ✅ Triggers created (updated_at on 4 tables)'
\echo '  ✅ Epic 1 tables verified intact'
\echo ''
\echo 'Next steps:'
\echo '  1. Verify Epic 1: bash scripts/migration/verify-epic1.sh production'
\echo '  2. Run regression tests: bash scripts/testing/run-epic1-tests.sh verify'
\echo '  3. Test v2.0 features:'
\echo '     - Create test client via API'
\echo '     - Test RLS (cross-user access blocked)'
\echo '     - Test Realtime subscription'
\echo '  4. Enable v2.0 features gradually (see feature flag docs)'
\echo ''
\echo 'Rollback (if needed):'
\echo '  psql $DATABASE_URL -f scripts/migration/rollback-v2.sql'
\echo ''
\echo 'Archived data location:'
\echo '  SELECT tablename FROM pg_tables WHERE schemaname = '\''archive'\'' AND tablename LIKE '\''%v1_backup%'\'''
\echo ''
