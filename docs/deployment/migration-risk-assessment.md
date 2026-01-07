# MeetSolis v2.0 Migration Risk Assessment

**Version:** 1.0
**Last Updated:** January 7, 2026
**Migration:** v1.0 (Video Platform) → v2.0 (Client Memory Assistant)

---

## Executive Summary

**Overall Risk Level:** HIGH (before mitigations) → MEDIUM (after mitigations applied)

**8 Identified Risks:**
- 3 HIGH severity
- 3 MEDIUM severity
- 2 LOW severity

**Critical Mitigation Requirements:**
1. Database backup BEFORE migration (mandatory)
2. Transaction-wrapped migration (auto-rollback on error)
3. Pre-flight checks (Epic 1 tables exist, users table has data)
4. Feature flags disabled by default
5. Staging test with production data clone (recommended)

**Go/No-Go Decision:** CONDITIONAL GO
- ✅ Proceed if: All mitigations implemented, staging test passed, backup verified
- ❌ Do NOT proceed if: Any blocker unresolved, no backup, Epic 1 tests failing

---

## Risk Matrix

| Risk ID | Risk | Probability | Impact | Severity | Mitigation |
|---------|------|-------------|--------|----------|------------|
| R-001 | Epic 1 tables accidentally dropped | Medium | CRITICAL | HIGH | Pre-flight checks, explicit DROP list |
| R-002 | Migration fails mid-execution | Medium | HIGH | HIGH | Transaction wrapper (auto-rollback) |
| R-003 | FK constraints break Epic 1 | Low | MEDIUM | MEDIUM | Schema validation, FK integrity test |
| R-004 | pgvector extension fails to install | High | HIGH | HIGH | Pre-check on staging, fallback schema |
| R-005 | RLS policies conflict | Medium | MEDIUM | MEDIUM | Separate RLS migration step, multi-user test |
| R-006 | Data in old tables (user impact) | High | MEDIUM | HIGH | Pre-migration data check, CSV export |
| R-007 | Performance degradation | Low | LOW | LOW | Index verification, query plan analysis |
| R-008 | Realtime subscriptions break | Low | LOW | LOW | Enable realtime on new tables, test |

**Severity Calculation:** Probability × Impact

---

## Risk Details

### R-001: Epic 1 Tables Accidentally Dropped (HIGH)

**Description:**
Migration script accidentally drops Epic 1 tables (`users`, `ai_usage_tracking`, `usage_alerts`) instead of only v1.0 video tables.

**Probability:** Medium (15%)
- Risk: Developer error in DROP statements
- Example: `DROP TABLE users` instead of `DROP TABLE meetings`

**Impact:** CRITICAL
- Complete data loss for all users
- Auth system broken (no users table)
- Requires full database restore from backup
- Potential downtime: 30+ minutes

**Scenario:**
```sql
-- ❌ DANGEROUS - Drops Epic 1 table
DROP TABLE users CASCADE;

-- ✅ SAFE - Only drops v1.0 table
DROP TABLE meetings CASCADE; -- v1.0 video meetings
```

---

#### Mitigations

**1. Pre-Flight Schema Check**
```sql
-- Verify Epic 1 tables exist BEFORE dropping anything
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
    RAISE EXCEPTION 'ABORT: users table not found';
  END IF;
END $$;
```

**2. Explicit DROP List (Never DROP Epic 1)**
```sql
-- Document EXACT tables to drop
-- Epic 1 (NEVER DROP): users, ai_usage_tracking, usage_alerts
-- v1.0 video (DROP): meetings, participants, messages, reactions, files, meeting_summaries

DROP TABLE IF EXISTS meetings CASCADE;        -- v1.0 only
DROP TABLE IF EXISTS participants CASCADE;    -- v1.0 only
-- etc.
```

**3. Staging Test**
- Run migration on staging with production data clone
- Verify Epic 1 tables intact after migration
- Document: "Staging migration passed on 2026-01-07"

**4. Post-Migration Verification**
```sql
-- Verify Epic 1 tables still exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
    RAISE EXCEPTION 'CRITICAL: users table missing - ROLLBACK!';
  END IF;
END $$;
```

**Recovery:**
- Restore from backup: `psql $DATABASE_URL -f backups/backup-epic1-production-*.sql`
- Timeline: 15 minutes

**Residual Risk:** LOW (after mitigations)

---

### R-002: Migration Fails Mid-Execution (HIGH)

**Description:**
Migration script fails halfway through (e.g., after dropping old tables but before creating new ones), leaving database in inconsistent state.

**Probability:** Medium (20%)
- Syntax error in SQL
- Network interruption
- Database connection timeout
- Out of disk space

**Impact:** HIGH
- Database in unknown state
- May have dropped tables without creating new ones
- Manual recovery required
- Potential downtime: 30+ minutes

**Scenario:**
```sql
DROP TABLE meetings CASCADE;     -- ✅ Succeeds
DROP TABLE participants CASCADE; -- ✅ Succeeds

CREATE TABLE clients (...);      -- ❌ Fails (syntax error)

-- Database now missing meetings & participants, no clients created!
```

---

#### Mitigations

**1. Transaction Wrapper (Auto-Rollback)**
```sql
BEGIN; -- Start transaction

  -- All migration operations here

  -- If ANY step fails, transaction auto-rolls back
  -- Database returns to pre-migration state

COMMIT; -- Only commits if ALL steps succeed
```

**2. Validation Steps Throughout**
```sql
-- After each major operation, verify success
CREATE TABLE clients (...);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'clients') THEN
    RAISE EXCEPTION 'clients table creation failed';
  END IF;
END $$;
```

**3. Idempotent Operations**
```sql
-- Use IF EXISTS / IF NOT EXISTS
DROP TABLE IF EXISTS meetings CASCADE;
CREATE TABLE IF NOT EXISTS clients (...);
```

**4. Detailed Logging**
```sql
RAISE NOTICE 'Step 1/10: Dropping v1.0 tables...';
-- operation
RAISE NOTICE 'Step 1/10: Complete';
```

**Recovery:**
- If transaction: Automatic rollback (0 manual action)
- If no transaction: Restore from backup (15 min)

**Residual Risk:** LOW (with transaction wrapper)

---

### R-003: FK Constraints Break Epic 1 (MEDIUM)

**Description:**
New v2.0 foreign keys conflict with Epic 1 constraints, causing Epic 1 features to break.

**Probability:** Low (10%)
- Well-tested schema should avoid this
- Risk: Circular FK dependencies

**Impact:** MEDIUM
- Epic 1 CRUD operations fail
- Users cannot create new records
- Potential downtime: 15 minutes (fix FK, redeploy)

**Scenario:**
```sql
-- v2.0 adds FK on clients table
ALTER TABLE clients
  ADD CONSTRAINT fk_clients_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Later, Epic 1 tries to delete user
DELETE FROM users WHERE id = 'user_123';
-- ❌ Fails if circular FK exists
```

---

#### Mitigations

**1. Schema Validation**
- Review all FK constraints before migration
- Test FK cascades on staging
- Document FK dependencies

**2. FK Integrity Test Post-Migration**
```sql
-- Verify FK constraints working correctly
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
  AND table_name IN ('clients', 'meetings', 'action_items');
```

**3. Test Epic 1 CRUD Operations**
```bash
# After migration, test Epic 1 user deletion
psql $DATABASE_URL -c "DELETE FROM users WHERE clerk_id = 'test_user_delete'"
# Should succeed with CASCADE
```

**Recovery:**
- Drop conflicting FK: `ALTER TABLE clients DROP CONSTRAINT fk_clients_user_id`
- Fix constraint definition
- Re-apply: `ALTER TABLE clients ADD CONSTRAINT ...`

**Residual Risk:** LOW

---

### R-004: pgvector Extension Fails to Install (HIGH)

**Description:**
Supabase environment doesn't support pgvector extension, causing migration to fail.

**Probability:** High (30%)
- Supabase free tier may not have pgvector
- Version compatibility issues
- Extension not available in region

**Impact:** HIGH
- Migration fails (transaction rolls back)
- Epic 4 (AI features) blocked
- Requires fallback schema redesign

**Scenario:**
```sql
CREATE EXTENSION vector;
-- ❌ ERROR: extension "vector" is not available
-- Hint: You might need to upgrade your Supabase plan
```

---

#### Mitigations

**1. Pre-Check on Staging**
```sql
-- Test pgvector installation on staging FIRST
CREATE EXTENSION IF NOT EXISTS vector;
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
```

**2. Fallback Schema (JSONB Instead of Vector)**
```sql
-- Plan A: pgvector (preferred)
CREATE TABLE embeddings (
  embedding VECTOR(1536)
);

-- Plan B: JSONB fallback (if pgvector unavailable)
CREATE TABLE embeddings (
  embedding JSONB -- Store as JSON array: [0.1, 0.2, ...]
);
```

**3. Conditional Extension Creation**
```sql
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'pgvector not available, using JSONB fallback';
END $$;
```

**4. Contact Supabase Support**
- Verify pgvector availability before migration
- Upgrade plan if needed ($25/mo for Extensions)

**Recovery:**
- Use JSONB fallback (degrades RAG performance but functional)
- Disable Epic 4 features temporarily
- Migrate to pgvector later when available

**Residual Risk:** MEDIUM (depends on Supabase plan)

---

### R-005: RLS Policies Conflict (MEDIUM)

**Description:**
New v2.0 RLS policies conflict with Epic 1 policies, causing auth failures or cross-user access.

**Probability:** Medium (15%)
- Complex RLS logic
- Risk: Policy name collisions, incorrect user_id matching

**Impact:** MEDIUM
- Cross-user data exposure (CRITICAL if it happens)
- Auth failures (users locked out)
- Compliance issue if PII exposed

**Scenario:**
```sql
-- Epic 1 RLS policy (existing)
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (clerk_id = auth.uid());

-- v2.0 RLS policy (new)
CREATE POLICY "users_select_own" -- ❌ Name collision!
  ON clients FOR SELECT
  USING (user_id = auth.uid());

-- ERROR: policy "users_select_own" already exists
```

---

#### Mitigations

**1. Separate RLS Migration Step**
```sql
-- Step 1: Create tables (no RLS yet)
CREATE TABLE clients (...);

-- Step 2: Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies (unique names)
CREATE POLICY "clients_select_own"
  ON clients FOR SELECT
  USING ((SELECT id FROM users WHERE clerk_id = auth.uid()) = user_id);
```

**2. Multi-User Test**
```bash
# Create 2 test users
# User A creates client
# User B tries to query
# Verify User B cannot see User A's client
```

**3. RLS Policy Naming Convention**
```
{table_name}_{operation}_{description}

Examples:
- clients_select_own
- clients_insert_own
- meetings_update_own
```

**4. Service Role Bypass Verification**
```sql
-- Verify service role can still access all data (for admin)
SET ROLE service_role;
SELECT COUNT(*) FROM clients; -- Should see ALL clients
RESET ROLE;
```

**Recovery:**
- Drop conflicting policy: `DROP POLICY "policy_name" ON table_name`
- Fix policy definition
- Re-apply with corrected logic

**Residual Risk:** LOW (with multi-user testing)

---

### R-006: Data in Old Tables (User Impact) (HIGH)

**Description:**
Old v1.0 video tables (`meetings`, `participants`, etc.) contain user data that will be lost when dropped.

**Probability:** High (50%)
- If any users tested video features in Epic 1
- Real user data in production database

**Impact:** MEDIUM
- User data loss (meetings, messages)
- User complaints
- Potential compliance issue (data retention)

**Scenario:**
```sql
-- User has 5 meetings in old meetings table
SELECT COUNT(*) FROM meetings WHERE user_id = 'user_123';
-- Result: 5

DROP TABLE meetings CASCADE; -- ❌ All 5 meetings deleted!

-- User logs in, sees 0 meetings
-- "Where did my meetings go?" - support ticket
```

---

#### Mitigations

**1. Pre-Migration Data Check**
```bash
# Check if old tables have data
psql $DATABASE_URL <<EOF
SELECT
  'meetings' AS table_name,
  COUNT(*) AS row_count
FROM meetings
UNION ALL
SELECT 'participants', COUNT(*) FROM participants
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;
EOF

# If row_count > 0, need export
```

**2. Export to CSV (Archival)**
```sql
-- Export old data before dropping
\copy meetings TO 'backups/meetings-archive-20260107.csv' CSV HEADER
\copy participants TO 'backups/participants-archive-20260107.csv' CSV HEADER
\copy messages TO 'backups/messages-archive-20260107.csv' CSV HEADER
```

**3. User Communication**
```
Email subject: MeetSolis Platform Update - Action Required

We're upgrading to v2.0 (client management focus).

Old video meeting data will be archived on Jan 10, 2026.
- Download your meeting history before this date: [EXPORT LINK]
- After Jan 10, video meeting data will no longer be accessible

Contact support if you need assistance.
```

**4. Archive Schema (Optional)**
```sql
-- Instead of DROP, move to archive schema
CREATE SCHEMA IF NOT EXISTS archive;

ALTER TABLE meetings SET SCHEMA archive;
ALTER TABLE participants SET SCHEMA archive;

-- Data preserved, not in active use
```

**Recovery:**
- Restore from CSV export
- Import into archive schema
- Provide data export to affected users

**Residual Risk:** LOW (with CSV export + user communication)

---

### R-007: Performance Degradation (LOW)

**Description:**
v2.0 tables missing indexes, causing slow queries and high latency.

**Probability:** Low (10%)
- Well-designed schema should have indexes
- Risk: Forgot index on frequently-queried column

**Impact:** LOW
- Slow API responses (p95 latency >500ms)
- Poor user experience
- No data loss, easily fixable

**Scenario:**
```sql
-- Missing index on clients.user_id
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL, -- ❌ No index!
  name TEXT
);

-- Query all clients for user (slow)
SELECT * FROM clients WHERE user_id = 'user_123';
-- Table scan on 10,000+ rows (500ms+)
```

---

#### Mitigations

**1. Index Verification**
```sql
-- Create all necessary indexes in migration
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_created_at ON clients(created_at);
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_client_id ON meetings(client_id);
```

**2. Query Plan Analysis**
```sql
-- Test query performance post-migration
EXPLAIN ANALYZE
SELECT * FROM clients WHERE user_id = 'user_123';

-- Should use Index Scan, not Seq Scan
```

**3. Load Testing**
```bash
# Simulate 100 concurrent users
ab -n 1000 -c 100 https://meetsolis.com/api/clients

# Check p95 latency <200ms
```

**Recovery:**
- Add missing index: `CREATE INDEX idx_name ON table(column)`
- No downtime required (can add concurrently)
- Timeline: <5 minutes

**Residual Risk:** VERY LOW

---

### R-008: Realtime Subscriptions Break (LOW)

**Description:**
Supabase Realtime not enabled on new v2.0 tables, breaking live updates.

**Probability:** Low (10%)
- Migration may forget to enable Realtime

**Impact:** LOW
- Live updates don't work
- Users must refresh to see new data
- Easily fixable, no data loss

**Scenario:**
```typescript
// Frontend subscribes to clients table
const subscription = supabase
  .from('clients')
  .on('INSERT', (payload) => {
    console.log('New client:', payload.new);
  })
  .subscribe();

// ❌ No events received (Realtime not enabled on clients table)
```

---

#### Mitigations

**1. Enable Realtime in Migration**
```sql
-- Enable Realtime publication on v2.0 tables
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE action_items;
```

**2. Test Post-Migration**
```typescript
// Test Realtime subscription
const { error } = await supabase
  .from('clients')
  .on('INSERT', () => console.log('Working!'))
  .subscribe();

// Should log "Working!" when client created
```

**Recovery:**
- Enable Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE clients`
- Timeline: <1 minute

**Residual Risk:** VERY LOW

---

## Risk Mitigation Checklist

### Before Migration

- [ ] **Backup created** (<1 hour old)
  ```bash
  bash scripts/migration/backup.sh production
  ```

- [ ] **Staging test passed**
  - Clone production data to staging
  - Run migration on staging
  - Verify Epic 1 tables intact
  - Test Epic 1 CRUD operations

- [ ] **pgvector availability confirmed**
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

- [ ] **Old tables data exported**
  ```bash
  psql $DATABASE_URL -c "\copy meetings TO 'backups/meetings-export.csv' CSV HEADER"
  ```

- [ ] **Epic 1 tests passing 100%**
  ```bash
  bash scripts/testing/run-epic1-tests.sh baseline
  ```

---

### During Migration

- [ ] **Pre-flight checks run**
  ```bash
  bash scripts/migration/pre-migration-check.sh production
  ```

- [ ] **Migration script reviewed**
  - Verify DROP statements (only v1.0 tables)
  - Confirm transaction wrapper (BEGIN/COMMIT)
  - Check validation steps

- [ ] **Execute migration**
  ```bash
  psql $DATABASE_URL -f scripts/migration/migrate-v2.sql
  ```

- [ ] **Monitor for errors**
  - Watch for EXCEPTION messages
  - Verify COMMIT logged (not ROLLBACK)

---

### After Migration

- [ ] **Epic 1 verification**
  ```bash
  bash scripts/migration/verify-epic1.sh production
  ```

- [ ] **Epic 1 regression tests**
  ```bash
  bash scripts/testing/run-epic1-tests.sh verify
  ```

- [ ] **Performance check**
  - Query latency <200ms (p95)
  - No slow queries in logs

- [ ] **RLS multi-user test**
  - User A creates client
  - User B cannot see it

- [ ] **Realtime test**
  - Subscribe to clients table
  - Insert row, verify event received

---

## Appendix: Risk Probability Definitions

| Probability | % Range | Definition |
|-------------|---------|------------|
| Very Low | 0-5% | Extremely unlikely to occur |
| Low | 5-15% | Unlikely but possible |
| Medium | 15-40% | Reasonably possible |
| High | 40-70% | Likely to occur |
| Very High | 70-100% | Almost certain |

## Appendix: Impact Definitions

| Impact | Definition | Example |
|--------|------------|---------|
| LOW | Minor inconvenience, easily fixed | Missing index (add index, 5 min) |
| MEDIUM | Significant issue, moderate recovery time | Data export needed (1 hour) |
| HIGH | Major issue, extended downtime | Database restore required (30 min) |
| CRITICAL | Catastrophic failure, data loss | Epic 1 tables dropped (full restore) |

---

**Document Owner:** DevOps + QA Teams
**Review Frequency:** Before each major migration
**Last Risk Assessment:** January 7, 2026
**Next Review:** After v2.0 migration complete
