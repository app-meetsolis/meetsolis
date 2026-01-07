# MeetSolis v2.0 Migration Rollback Procedures

**Version:** 1.0
**Last Updated:** January 7, 2026
**Status:** Production-ready

---

## Executive Summary

This document defines rollback procedures for the v2.0 migration (video platform → client memory assistant). Three failure scenarios covered: automatic transaction rollback, feature flag disable + DB restore, and full backup restoration.

**Critical:** Backup database BEFORE migration. No rollback possible without backup.

---

## Pre-Migration Requirements

### Mandatory Backup

**MUST complete before migration:**

```bash
# Run backup script (creates timestamped .sql.gz)
bash scripts/migration/backup.sh production

# Verify backup exists
ls -lh backups/backup-epic1-production-*.sql.gz

# Expected: File size >1MB, timestamp <1 hour old
```

**Backup Contents:**
- Epic 1 tables: `users`, `ai_usage_tracking`, `usage_alerts`
- All RLS policies
- All indexes and constraints
- Supabase auth configuration

**Storage:**
- Local: `D:\meetsolis\backups\`
- Supabase Storage: `backup-epic1-production-YYYYMMDD-HHMMSS.sql.gz`
- Retention: 30 days

---

## Feature Flag Configuration

### Environment Variables

**Default state (pre-migration):**

```env
# .env.production
NEXT_PUBLIC_ENABLE_CLIENT_CARDS=false
NEXT_PUBLIC_ENABLE_NEW_MEETINGS=false
ENABLE_PGVECTOR=false
```

**Enable flags ONLY after successful migration + verification:**

```bash
# Enable v2.0 features gradually
vercel env add NEXT_PUBLIC_ENABLE_CLIENT_CARDS true production
vercel env add NEXT_PUBLIC_ENABLE_NEW_MEETINGS true production
vercel env add ENABLE_PGVECTOR true production

# Redeploy to apply
vercel --prod
```

### Feature Flag Guards

**API Routes:**

```typescript
// apps/web/src/app/api/clients/route.ts
if (process.env.NEXT_PUBLIC_ENABLE_CLIENT_CARDS !== 'true') {
  return NextResponse.json(
    { error: 'Feature not enabled' },
    { status: 503 }
  );
}
```

**UI Components:**

```typescript
// apps/web/src/components/ClientCard.tsx
if (process.env.NEXT_PUBLIC_ENABLE_CLIENT_CARDS !== 'true') {
  return null; // Hide component
}
```

**Middleware:**

```typescript
// apps/web/src/middleware.ts
if (request.nextUrl.pathname.startsWith('/clients')) {
  if (process.env.NEXT_PUBLIC_ENABLE_CLIENT_CARDS !== 'true') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
```

---

## Transaction-Wrapped Migration Pattern

### Safe Migration Execution

**Migration script structure:**

```sql
-- scripts/migration/migrate-v2.sql

BEGIN; -- Start transaction (auto-rollback on error)

  -- 1. Pre-flight checks
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
      RAISE EXCEPTION 'Epic 1 table "users" not found - ABORT';
    END IF;
  END $$;

  -- 2. DROP v1.0 tables
  DROP TABLE IF EXISTS meetings CASCADE;
  DROP TABLE IF EXISTS participants CASCADE;

  -- 3. CREATE v2.0 tables
  CREATE TABLE clients (...);
  CREATE TABLE meetings (...); -- New structure

  -- 4. Enable RLS
  ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

  -- 5. Verification
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'clients') THEN
      RAISE EXCEPTION 'v2.0 table "clients" not created - ROLLBACK';
    END IF;
  END $$;

COMMIT; -- Only commits if all steps succeed
```

**Automatic Rollback:**
- Any error → transaction auto-rolls back
- Database reverts to pre-migration state
- No manual intervention required

**Execution:**

```bash
# Run migration (production)
psql $DATABASE_URL -f scripts/migration/migrate-v2.sql

# If error occurs:
# ERROR:  v2.0 table "clients" not created - ROLLBACK
# Transaction automatically rolled back
```

---

## Rollback Scenarios

### Scenario A: Migration Fails During Execution

**Symptoms:**
- Migration script exits with error
- Transaction rollback message in logs

**Example:**

```
ERROR:  relation "clients" already exists
CONTEXT:  SQL statement "CREATE TABLE clients (...)"
ROLLBACK
```

**What Happened:**
- Transaction wrapper detected error
- **Automatically rolled back** all changes
- Database returned to pre-migration state

**Action Required:**

✅ **NO ACTION NEEDED** - Database already restored

**Verification:**

```bash
# 1. Verify Epic 1 tables intact
bash scripts/migration/verify-epic1.sh

# Expected output:
# ✅ Database connection OK
# ✅ Epic 1 tables exist
# ✅ RLS policies active
# ✅ Auth endpoint responding
# ✅ Redis rate limiting functional
```

**Next Steps:**
1. Investigate error cause (check migration logs)
2. Fix migration script
3. Test on staging
4. Retry migration

**Timeline:** Immediate (automatic rollback)

---

### Scenario B: App Breaks After Migration

**Symptoms:**
- Migration succeeded (COMMIT logged)
- App errors in production (500 errors, auth failures, etc.)
- Epic 1 features not working

**Example:**

```
Error: Cannot read property 'id' of undefined
  at /api/auth/user (line 42)

Rate: 1500 errors/minute
```

**Decision Criteria:**

| Metric | Threshold | Action |
|--------|-----------|--------|
| Error rate | >5% | Rollback |
| Login failures | >10/minute | Rollback |
| Database errors | >1% | Rollback |
| User complaints | >5 | Rollback |

**Action Required:**

### Step 1: Disable v2.0 Features (5 minutes)

```bash
# 1. Disable feature flags (fastest mitigation)
vercel env rm NEXT_PUBLIC_ENABLE_CLIENT_CARDS production
vercel env rm NEXT_PUBLIC_ENABLE_NEW_MEETINGS production
vercel env rm ENABLE_PGVECTOR production

# 2. Redeploy (triggers instant rollback)
vercel --prod

# 3. Monitor error rate
# Expected: Error rate drops to <1% within 2 minutes
```

**If error rate remains high → Proceed to Step 2**

### Step 2: Restore Database (15 minutes)

```bash
# 1. Stop application (prevent new writes)
vercel domains disable meetsolis.com

# 2. Restore from backup
gunzip backups/backup-epic1-production-*.sql.gz
psql $DATABASE_URL -f backups/backup-epic1-production-*.sql

# Expected output:
# DROP TABLE
# CREATE TABLE
# ... (100+ lines)
# COMMIT

# 3. Verify Epic 1 tables restored
bash scripts/migration/verify-epic1.sh

# 4. Re-enable application
vercel domains enable meetsolis.com
```

### Step 3: Verify Rollback Success

```bash
# 1. Check error rate
# Expected: <1% within 5 minutes

# 2. Test critical flows
curl https://meetsolis.com/api/auth/user -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK, user object returned

# 3. Check RLS
curl https://meetsolis.com/api/meetings -H "Authorization: Bearer $ATTACKER_TOKEN"
# Expected: 403 Forbidden (cross-user access blocked)

# 4. Test Redis rate limiting
for i in {1..15}; do curl https://meetsolis.com/api/meetings; done
# Expected: HTTP 429 Too Many Requests after 10 requests
```

**Timeline:** 20 minutes (disable flags + restore + verify)

---

### Scenario C: Silent Data Issues Detected

**Symptoms:**
- No immediate errors post-migration
- Issues discovered hours/days later:
  - Users reporting missing data
  - Cross-user data leakage (RLS failure)
  - AI features consuming excessive credits

**Example:**

```
User report: "I can see another user's clients"
Investigation: RLS policy not enabled on clients table
```

**Action Required:**

### Step 1: Assess Data Impact

```bash
# 1. Check affected tables
psql $DATABASE_URL -c "SELECT * FROM clients WHERE user_id != auth.uid() LIMIT 10"

# If rows returned → RLS not enforcing

# 2. Quantify impact
psql $DATABASE_URL -c "SELECT COUNT(*) FROM clients"
# Example: 47 clients created (need to audit ownership)
```

### Step 2: Disable Feature + Preserve Data

```bash
# 1. Export v2.0 data (before dropping tables)
psql $DATABASE_URL -c "\COPY clients TO 'backups/clients-export-$(date +%Y%m%d-%H%M%S).csv' CSV HEADER"
psql $DATABASE_URL -c "\COPY meetings TO 'backups/meetings-export-$(date +%Y%m%d-%H%M%S).csv' CSV HEADER"

# 2. Disable v2.0 features
vercel env rm NEXT_PUBLIC_ENABLE_CLIENT_CARDS production
vercel --prod

# 3. Communicate with users (if data exposed)
# Template: docs/deployment/incident-communication-template.md
```

### Step 3: Full Restore from Backup

```bash
# 1. Run rollback SQL (drops v2.0 tables cleanly)
psql $DATABASE_URL -f scripts/migration/rollback-v2.sql

# Expected output:
# DROP TABLE clients CASCADE
# DROP TABLE meetings CASCADE
# DROP EXTENSION pgvector CASCADE
# Verification: Epic 1 tables intact

# 2. Verify Epic 1 functionality
bash scripts/migration/verify-epic1.sh

# 3. Re-import v2.0 data (if fixable)
# Fix RLS policies first, then:
psql $DATABASE_URL -f scripts/migration/migrate-v2.sql
psql $DATABASE_URL -c "\COPY clients FROM 'backups/clients-export-*.csv' CSV HEADER"
```

**Timeline:** 1 hour (assess + disable + restore + communicate)

---

## Rollback Decision Tree

```
Migration completed
    ↓
Is error rate >5%? ────YES──→ ROLLBACK (Scenario B)
    ↓ NO
Are users reporting issues? ────YES──→ Investigate
    ↓ NO                                  ↓
Monitor for 24 hours               Data exposure? ────YES──→ ROLLBACK (Scenario C)
    ↓                                     ↓ NO
Declare success                    Fix in place + monitor
```

### When to Rollback vs Monitor

**Rollback Immediately:**
- Error rate >5% sustained for >5 minutes
- Login failures >10/minute
- Database connection errors
- RLS policy failures (cross-user access)
- AI usage spike >10x normal (runaway costs)

**Monitor (Don't Rollback):**
- Isolated errors (<1%)
- Single user complaints (investigate first)
- Performance degradation <20%
- UI bugs (non-blocking)

**Fix in Place (No Rollback):**
- Missing index (add index)
- UI typo (deploy fix)
- Incorrect AI prompt (update config)

---

## Post-Rollback Verification Checklist

### Critical Systems (P0 - Test First)

- [ ] **Authentication**: User can log in
  ```bash
  curl https://meetsolis.com/api/auth/user -H "Authorization: Bearer $TOKEN"
  # Expected: 200 OK
  ```

- [ ] **Database Connection**: App connects to DB
  ```bash
  curl https://meetsolis.com/api/health
  # Expected: {"status": "healthy", "database": "connected"}
  ```

- [ ] **RLS Enforcement**: Cross-user access blocked
  ```bash
  # Test with different user tokens
  curl https://meetsolis.com/api/meetings -H "Authorization: Bearer $USER_A"
  # Should NOT return User B's meetings
  ```

- [ ] **Rate Limiting**: Redis functional
  ```bash
  for i in {1..15}; do curl https://meetsolis.com/api/meetings; done
  # Expected: HTTP 429 after 10 requests
  ```

### Epic 1 Features (P1 - Test Second)

- [ ] **User Table**: Clerk sync works
  ```bash
  psql $DATABASE_URL -c "SELECT COUNT(*) FROM users"
  # Expected: Same count as pre-migration
  ```

- [ ] **AI Usage Tracking**: Logs still writing
  ```bash
  psql $DATABASE_URL -c "SELECT * FROM ai_usage_tracking ORDER BY created_at DESC LIMIT 5"
  # Expected: Recent entries exist
  ```

### Monitoring (P2 - Observe for 1 hour)

- [ ] Error rate <1%
- [ ] Latency <200ms (p95)
- [ ] No Sentry alerts
- [ ] No user complaints in support channel

### Communication (P3 - After Verification)

- [ ] Update status page: "Issue resolved, service restored"
- [ ] Post in Slack: "#incident-YYYYMMDD resolved"
- [ ] Email affected users (if applicable)
- [ ] Document post-mortem: `docs/deployment/incident-YYYYMMDD.md`

---

## Communication Templates

### User Communication (If Data Exposed)

**Subject:** MeetSolis Service Update - Data Integrity Issue Resolved

```
Hi [User Name],

We identified and resolved a data visibility issue during our v2.0 migration.

What happened:
- Between [START_TIME] and [END_TIME] on [DATE], a small number of client records may have been visible to other users.
- Affected: [X] users, [Y] client records
- We immediately disabled the feature and restored from backup.

Your data:
- [X] of your client records were potentially exposed
- No deletion or modification occurred
- All data has been restored

Actions we've taken:
- Disabled v2.0 features until issue fixed
- Enabled additional access controls
- Added monitoring to detect similar issues

What you should do:
- No action required on your part
- Your account security was not compromised
- If you have concerns, reply to this email

We apologize for this issue and have implemented additional safeguards.

MeetSolis Team
```

### Slack Alert Template

```
🚨 **MIGRATION ROLLBACK INITIATED**

**Time:** 2026-01-07 14:23 UTC
**Trigger:** Error rate >5% for 7 minutes
**Action:** Disabled v2.0 feature flags + DB restore
**Status:** In progress

**Current Metrics:**
- Error rate: 8.3% → 2.1% (declining)
- Affected users: ~34
- Downtime: 0 minutes (degraded service only)

**Next Steps:**
1. Complete Epic 1 verification (ETA: 5 min)
2. Re-enable application
3. Monitor for 1 hour
4. Schedule post-mortem

**Updates:** This thread
```

---

## Testing Rollback Procedures (Staging)

### Rehearsal Steps

**Before production migration:**

```bash
# 1. Clone production database to staging
pg_dump $PROD_DATABASE_URL | psql $STAGING_DATABASE_URL

# 2. Run migration on staging
psql $STAGING_DATABASE_URL -f scripts/migration/migrate-v2.sql

# 3. Simulate failure scenario
# Scenario B: Manually introduce error
psql $STAGING_DATABASE_URL -c "DROP TABLE users"

# 4. Test rollback
bash scripts/migration/rollback-v2.sql
bash scripts/migration/verify-epic1.sh

# Expected: All Epic 1 tests pass
```

**Document results:** `test-results/staging-rollback-test.md`

---

## Appendix: Quick Reference Card

| Scenario | Symptom | First Action | Timeline |
|----------|---------|--------------|----------|
| A: Migration fails | Error in logs, ROLLBACK | Verify Epic 1 (`verify-epic1.sh`) | Immediate |
| B: App breaks | Error rate >5% | Disable flags (`vercel env rm`) | 5 min |
| C: Silent issues | Data exposure | Export data + rollback SQL | 1 hour |

**Emergency Contact:**
- On-call: [PHONE]
- Slack: #incidents
- Escalation: [EMAIL]

---

**Last Tested:** Never (pending staging test)
**Next Review:** After first production rollback
**Owner:** @dev team
