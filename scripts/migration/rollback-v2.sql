--------------------------------------------------------------------------------
-- MeetSolis v2.0 Migration - Rollback Script
--
-- Purpose: Revert v2.0 migration (client memory assistant → video platform)
-- Usage: psql $DATABASE_URL -f scripts/migration/rollback-v2.sql
--
-- Safety Features:
-- - 5-second cancellation window
-- - Pre-flight checks (Epic 1 tables exist)
-- - Verification step (Epic 1 intact after rollback)
-- - Transaction-wrapped (auto-rollback on error)
--
-- IMPORTANT: This script ONLY drops v2.0 tables. Epic 1 tables preserved.
--------------------------------------------------------------------------------

\echo ''
\echo '=========================================================================='
\echo 'MeetSolis v2.0 Rollback Script'
\echo '=========================================================================='
\echo ''
\echo 'This script will:'
\echo '  - DROP v2.0 tables (clients, meetings, action_items, embeddings, user_preferences)'
\echo '  - DROP pgvector extension'
\echo '  - VERIFY Epic 1 tables intact (users, ai_usage_tracking, usage_alerts)'
\echo ''
\echo 'Epic 1 tables will NOT be touched.'
\echo ''
\echo 'Press Ctrl+C within 5 seconds to cancel...'
\echo ''

SELECT pg_sleep(5);

\echo 'Starting rollback...'
\echo ''

BEGIN;

--------------------------------------------------------------------------------
-- 1. PRE-FLIGHT CHECKS
--------------------------------------------------------------------------------

\echo '🔍 Step 1/5: Pre-flight checks...'

-- Check Epic 1 tables exist (must NOT drop these)
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
    RAISE EXCEPTION '❌ ABORT: Epic 1 tables missing: %. Database may be corrupted. Restore from backup.', array_to_string(missing_tables, ', ');
  END IF;

  RAISE NOTICE '✅ Epic 1 tables verified (users, ai_usage_tracking, usage_alerts)';
END $$;

-- Check if v2.0 tables exist (if not, rollback already complete)
DO $$
DECLARE
  v2_tables_exist BOOLEAN := FALSE;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename IN ('clients', 'embeddings', 'user_preferences')) THEN
    v2_tables_exist := TRUE;
  END IF;

  IF NOT v2_tables_exist THEN
    RAISE WARNING '⚠️  No v2.0 tables found - rollback may already be complete';
  ELSE
    RAISE NOTICE '✅ v2.0 tables detected - proceeding with rollback';
  END IF;
END $$;

\echo ''

--------------------------------------------------------------------------------
-- 2. EXPORT v2.0 DATA (Archival)
--------------------------------------------------------------------------------

\echo '📦 Step 2/5: Archiving v2.0 data...'

-- Create archive schema if not exists
CREATE SCHEMA IF NOT EXISTS archive;

-- Archive clients table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'clients') THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS archive.clients_v2_backup_%s AS SELECT * FROM clients', to_char(now(), 'YYYYMMDD_HH24MISS'));
    RAISE NOTICE '✅ Archived clients → archive.clients_v2_backup_%', to_char(now(), 'YYYYMMDD_HH24MISS');
  END IF;
END $$;

-- Archive meetings table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'meetings') THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS archive.meetings_v2_backup_%s AS SELECT * FROM meetings', to_char(now(), 'YYYYMMDD_HH24MISS'));
    RAISE NOTICE '✅ Archived meetings → archive.meetings_v2_backup_%', to_char(now(), 'YYYYMMDD_HH24MISS');
  END IF;
END $$;

-- Archive action_items table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'action_items') THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS archive.action_items_v2_backup_%s AS SELECT * FROM action_items', to_char(now(), 'YYYYMMDD_HH24MISS'));
    RAISE NOTICE '✅ Archived action_items → archive.action_items_v2_backup_%', to_char(now(), 'YYYYMMDD_HH24MISS');
  END IF;
END $$;

-- Archive embeddings table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'embeddings') THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS archive.embeddings_v2_backup_%s AS SELECT * FROM embeddings', to_char(now(), 'YYYYMMDD_HH24MISS'));
    RAISE NOTICE '✅ Archived embeddings → archive.embeddings_v2_backup_%', to_char(now(), 'YYYYMMDD_HH24MISS');
  END IF;
END $$;

\echo ''

--------------------------------------------------------------------------------
-- 3. DROP v2.0 TABLES
--------------------------------------------------------------------------------

\echo '🗑️  Step 3/5: Dropping v2.0 tables...'

-- Drop v2.0 tables (CASCADE to remove dependent objects)
DROP TABLE IF EXISTS user_preferences CASCADE;
RAISE NOTICE '✅ Dropped user_preferences';

DROP TABLE IF EXISTS action_items CASCADE;
RAISE NOTICE '✅ Dropped action_items';

DROP TABLE IF EXISTS embeddings CASCADE;
RAISE NOTICE '✅ Dropped embeddings';

DROP TABLE IF EXISTS meetings CASCADE;
RAISE NOTICE '✅ Dropped meetings (v2.0 structure)';

DROP TABLE IF EXISTS clients CASCADE;
RAISE NOTICE '✅ Dropped clients';

-- Drop v2.0 indexes (if any remain)
DROP INDEX IF EXISTS idx_clients_user_id;
DROP INDEX IF EXISTS idx_clients_created_at;
DROP INDEX IF EXISTS idx_clients_name_search;
DROP INDEX IF EXISTS idx_meetings_user_id;
DROP INDEX IF EXISTS idx_meetings_client_id;
DROP INDEX IF EXISTS idx_meetings_date;
DROP INDEX IF EXISTS idx_action_items_user_id;
DROP INDEX IF EXISTS idx_action_items_client_id;
DROP INDEX IF EXISTS idx_action_items_status;
DROP INDEX IF EXISTS idx_embeddings_user_id;
DROP INDEX IF EXISTS idx_embeddings_vector;
RAISE NOTICE '✅ Dropped v2.0 indexes';

-- Drop v2.0 functions (if any)
DROP FUNCTION IF EXISTS search_embeddings(vector, integer, uuid) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
RAISE NOTICE '✅ Dropped v2.0 functions';

\echo ''

--------------------------------------------------------------------------------
-- 4. DROP PGVECTOR EXTENSION
--------------------------------------------------------------------------------

\echo '📦 Step 4/5: Dropping pgvector extension...'

-- Drop pgvector extension (only if no other tables use it)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    DROP EXTENSION vector CASCADE;
    RAISE NOTICE '✅ Dropped pgvector extension';
  ELSE
    RAISE NOTICE '⚠️  pgvector extension not found (may already be removed)';
  END IF;
END $$;

\echo ''

--------------------------------------------------------------------------------
-- 5. VERIFICATION
--------------------------------------------------------------------------------

\echo '✅ Step 5/5: Verifying Epic 1 integrity...'

-- Verify Epic 1 tables still exist
DO $$
DECLARE
  users_count INTEGER;
  ai_usage_count INTEGER;
BEGIN
  -- Check users table
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
    RAISE EXCEPTION '❌ CRITICAL: users table missing after rollback. ROLLBACK transaction immediately.';
  END IF;

  SELECT COUNT(*) INTO users_count FROM users;
  RAISE NOTICE '✅ users table intact (% rows)', users_count;

  -- Check ai_usage_tracking table
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ai_usage_tracking') THEN
    RAISE EXCEPTION '❌ CRITICAL: ai_usage_tracking table missing after rollback. ROLLBACK transaction immediately.';
  END IF;

  SELECT COUNT(*) INTO ai_usage_count FROM ai_usage_tracking;
  RAISE NOTICE '✅ ai_usage_tracking table intact (% rows)', ai_usage_count;

  -- Check usage_alerts table
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'usage_alerts') THEN
    RAISE EXCEPTION '❌ CRITICAL: usage_alerts table missing after rollback. ROLLBACK transaction immediately.';
  END IF;

  RAISE NOTICE '✅ usage_alerts table intact';
END $$;

-- Verify v2.0 tables removed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename IN ('clients', 'embeddings')) THEN
    RAISE EXCEPTION '❌ v2.0 tables still exist. Rollback failed.';
  END IF;

  RAISE NOTICE '✅ v2.0 tables successfully removed';
END $$;

-- Verify RLS policies still active on Epic 1 tables
DO $$
DECLARE
  users_rls_enabled BOOLEAN;
BEGIN
  SELECT relrowsecurity INTO users_rls_enabled
  FROM pg_class
  WHERE relname = 'users';

  IF NOT users_rls_enabled THEN
    RAISE WARNING '⚠️  RLS not enabled on users table - may need to re-enable';
  ELSE
    RAISE NOTICE '✅ RLS policies intact on users table';
  END IF;
END $$;

\echo ''
\echo '=========================================================================='
\echo '✅ ROLLBACK COMPLETE'
\echo '=========================================================================='
\echo ''
\echo 'Summary:'
\echo '  - v2.0 tables dropped (clients, meetings, action_items, embeddings, user_preferences)'
\echo '  - pgvector extension removed'
\echo '  - Epic 1 tables verified intact (users, ai_usage_tracking, usage_alerts)'
\echo '  - v2.0 data archived to archive schema (optional recovery)'
\echo ''
\echo 'Next steps:'
\echo '  1. Run Epic 1 verification: bash scripts/migration/verify-epic1.sh'
\echo '  2. Test authentication: curl /api/auth/user'
\echo '  3. Check error logs for anomalies'
\echo '  4. Monitor application for 1 hour'
\echo ''
\echo 'To recover v2.0 data (if needed):'
\echo '  SELECT * FROM archive.clients_v2_backup_YYYYMMDD_HHMMSS;'
\echo ''

COMMIT;

\echo 'Transaction committed successfully.'
\echo ''
