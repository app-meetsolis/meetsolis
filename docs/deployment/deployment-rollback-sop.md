# MeetSolis Deployment Rollback SOP

**Standard Operating Procedure**
**Version:** 1.0
**Last Updated:** January 7, 2026
**Status:** Production-ready

---

## Quick Reference Card

| Scenario | Symptom | Decision Time | Rollback Method | ETA |
|----------|---------|---------------|-----------------|-----|
| **Migration Fails** | Error in logs, ROLLBACK message | Immediate | Automatic (transaction) | 0 min |
| **High Error Rate** | >5% errors sustained 5+ min | 2 minutes | Disable feature flags | 3 min |
| **Auth Failures** | >10 login failures/min | 1 minute | Disable flags + verify | 5 min |
| **Database Errors** | >1% DB connection errors | 1 minute | Restore from backup | 20 min |
| **Data Exposure** | RLS policy failure | Immediate | Full rollback + notify | 60 min |

**Emergency Contact:**
- **On-call:** [PHONE NUMBER]
- **Slack:** `#incidents`
- **Escalation:** [MANAGER EMAIL]

---

## Monitoring Triggers

### Automatic Alerts (Require Action)

**Trigger rollback when ANY of these occur:**

| Trigger | Threshold | Source | Action |
|---------|-----------|--------|--------|
| Error rate spike | >5% for 5+ minutes | Sentry | Disable flags (Method A) |
| Login failures | >10/minute | Clerk webhooks | Disable flags (Method A) |
| Database errors | >1% of queries | Supabase logs | Restore DB (Method B) |
| RLS violations | >0 (any occurrence) | Supabase RLS logs | Full rollback (Method C) |
| 5xx responses | >100/minute | Vercel logs | Disable flags (Method A) |
| AI cost spike | >$10/hour | OpenAI usage API | Disable pgvector flag |

### Manual Triggers (Judgment Call)

**Consider rollback when:**

- User complaints >10 in support channel
- Latency p95 >500ms (2.5x normal)
- Customer escalation (enterprise client)
- Silent data corruption detected

---

## Rollback Methods

### Method A: Feature Flag Disable (FASTEST)

**Use when:**
- High error rate but database intact
- App errors isolated to v2.0 features
- Need instant mitigation

**Timeline:** 3 minutes
**Risk:** Low (no data loss)

#### Procedure

**Step 1: Disable flags (1 minute)**

```bash
# Run from terminal with Vercel CLI authenticated
vercel env rm NEXT_PUBLIC_ENABLE_CLIENT_CARDS production
vercel env rm NEXT_PUBLIC_ENABLE_NEW_MEETINGS production
vercel env rm ENABLE_PGVECTOR production
```

**Step 2: Redeploy (1 minute)**

```bash
vercel --prod
# Wait for deployment to complete (auto-redirects to new URL)
```

**Step 3: Verify (1 minute)**

```bash
# Check error rate dropped
curl https://meetsolis.com/api/clients
# Expected: 503 Service Unavailable (feature disabled)

# Check legacy routes work
curl https://meetsolis.com/api/auth/user -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK
```

**Success Criteria:**
- Error rate <1% within 2 minutes
- Users see legacy UI (no 500 errors)
- Epic 1 features functional

**Next Steps:**
- Post in `#incidents`: "v2.0 features disabled, investigating"
- Monitor for 30 minutes
- Schedule post-mortem

---

### Method B: Database Restore (MEDIUM RISK)

**Use when:**
- Database corruption detected
- Epic 1 tables affected
- Feature flags already disabled but errors persist

**Timeline:** 20 minutes
**Risk:** Medium (potential 5-10 min data loss)

#### Procedure

**Step 1: Stop writes (2 minutes)**

```bash
# Option A: Disable domain (hard stop)
vercel domains disable meetsolis.com

# Option B: Enable maintenance mode (gentler)
vercel env add MAINTENANCE_MODE true production
vercel --prod
```

**Step 2: Restore database (10 minutes)**

```bash
# 1. Find latest backup
ls -lh backups/backup-epic1-production-*.sql.gz

# 2. Decompress
gunzip backups/backup-epic1-production-YYYYMMDD-HHMMSS.sql.gz

# 3. Restore to database
psql $DATABASE_URL -f backups/backup-epic1-production-YYYYMMDD-HHMMSS.sql

# Expected output:
# DROP TABLE
# CREATE TABLE
# COPY 1247 (users)
# COPY 5632 (ai_usage_tracking)
# ...
# COMMIT
```

**Step 3: Verify restoration (5 minutes)**

```bash
# Run verification script
bash scripts/migration/verify-epic1.sh production

# Expected output:
# ✅ Database connection OK
# ✅ Epic 1 tables exist
# ✅ RLS policies active
# ✅ Auth endpoint responding
# ✅ Redis rate limiting functional
```

**Step 4: Re-enable application (3 minutes)**

```bash
# Option A: Re-enable domain
vercel domains enable meetsolis.com

# Option B: Disable maintenance mode
vercel env rm MAINTENANCE_MODE production
vercel --prod
```

**Success Criteria:**
- All Epic 1 verification tests pass
- Error rate <1%
- Users can log in and access data

**Data Loss:**
- Up to 10 minutes of data (time since last backup)
- Notify affected users (see Communication section)

**Next Steps:**
- Document incident timeline
- Identify root cause
- Plan remediation

---

### Method C: Full Rollback + Cleanup (HIGHEST RISK)

**Use when:**
- Data exposure (RLS failure)
- Database corruption beyond repair
- Epic 1 tables dropped accidentally

**Timeline:** 60 minutes
**Risk:** High (requires user notification, potential compliance issue)

#### Procedure

**Step 1: Assess data impact (10 minutes)**

```bash
# Check for cross-user data leakage
psql $DATABASE_URL <<EOF
SELECT
  'clients' AS table_name,
  COUNT(*) AS exposed_rows
FROM clients
WHERE user_id NOT IN (SELECT id FROM users)
UNION ALL
SELECT
  'meetings' AS table_name,
  COUNT(*) AS exposed_rows
FROM meetings
WHERE user_id NOT IN (SELECT id FROM users);
EOF
```

**Document findings:**
- Number of affected users
- Type of data exposed (client names, meeting transcripts, etc.)
- Time window of exposure

**Step 2: Disable features immediately (2 minutes)**

```bash
# Same as Method A
vercel env rm NEXT_PUBLIC_ENABLE_CLIENT_CARDS production
vercel env rm NEXT_PUBLIC_ENABLE_NEW_MEETINGS production
vercel env rm ENABLE_PGVECTOR production
vercel --prod
```

**Step 3: Export v2.0 data (5 minutes)**

```bash
# Export before dropping tables (forensic analysis)
psql $DATABASE_URL <<EOF
\copy clients TO 'backups/forensic-clients-$(date +%Y%m%d-%H%M%S).csv' CSV HEADER
\copy meetings TO 'backups/forensic-meetings-$(date +%Y%m%d-%H%M%S).csv' CSV HEADER
EOF
```

**Step 4: Run rollback SQL (5 minutes)**

```bash
psql $DATABASE_URL -f scripts/migration/rollback-v2.sql

# Expected output:
# 🗑️ Step 3/5: Dropping v2.0 tables...
# ✅ Dropped clients
# ✅ Dropped meetings (v2.0 structure)
# ✅ Epic 1 tables intact
```

**Step 5: Restore Epic 1 from backup (10 minutes)**

```bash
# If Epic 1 tables affected
gunzip backups/backup-epic1-production-*.sql.gz
psql $DATABASE_URL -f backups/backup-epic1-production-*.sql
```

**Step 6: Verify integrity (5 minutes)**

```bash
bash scripts/migration/verify-epic1.sh production
```

**Step 7: Notify users (15 minutes)**

```bash
# Use communication template (see below)
# Send to affected users only (if identifiable)
```

**Step 8: Document incident (8 minutes)**

Create: `docs/deployment/incident-YYYYMMDD.md`

Include:
- Timeline of events
- Root cause analysis
- Affected users (count + IDs)
- Data exposed (type + volume)
- Mitigation steps taken
- Prevention measures

**Success Criteria:**
- All Epic 1 tests pass
- v2.0 tables dropped cleanly
- Users notified within 2 hours
- Incident documented

**Compliance:**
- If PII exposed: Notify users within 72 hours (GDPR)
- File incident report with legal team

---

## Decision Tree

```
[ALERT TRIGGERED]
       ↓
Migration in progress?
  ├─ YES → Wait for transaction rollback (automatic)
  │         ↓
  │    Verify Epic 1 → Done
  │
  └─ NO → Check error rate
            ↓
       Error rate >5%?
       ├─ YES → Method A (disable flags)
       │         ↓
       │    Error rate dropped?
       │    ├─ YES → Monitor + investigate
       │    └─ NO → Method B (restore DB)
       │
       └─ NO → Check symptom
                ↓
           Login failures?
           ├─ YES → Method A (disable flags)
           │
           Database errors?
           ├─ YES → Method B (restore DB)
           │
           Data exposure?
           └─ YES → Method C (full rollback + notify)
```

---

## Communication Templates

### Slack Alert (Incident Channel)

**Post immediately when rollback initiated:**

```
🚨 **PRODUCTION ROLLBACK IN PROGRESS**

**Trigger:** [Error rate >5% / Login failures / Database errors]
**Time:** 2026-01-07 14:23 UTC
**Method:** [A / B / C] - [Feature flag disable / DB restore / Full rollback]
**On-call:** @engineer-name

**Current Status:**
- Feature flags: DISABLED
- Error rate: 8.3% → 2.1% (declining)
- Affected users: ~47
- Downtime: 0 min (degraded service only)

**Next Updates:** Every 10 minutes in this thread

**ETA:** 5 minutes

---
React with ✅ when you see this message.
```

**Update after resolution:**

```
✅ **ROLLBACK COMPLETE**

**Resolution Time:** 4 minutes
**Final Error Rate:** 0.2%
**User Impact:** Redirected to legacy UI, no data loss

**Next Steps:**
1. Post-mortem scheduled: Tomorrow 10am
2. Root cause: [Brief description]
3. Prevention: [Immediate fix applied]

**Status Page:** Updated to "Resolved"
```

---

### User Email (Data Exposure)

**Subject:** MeetSolis Security Update - Action Not Required

```
Hi [First Name],

We're writing to inform you about a brief technical issue that occurred on [DATE] between [START TIME] and [END TIME] UTC.

**What happened:**
During a system upgrade, a configuration error allowed [X] of your client records to be temporarily visible to other users. We detected and resolved this issue within [MINUTES] minutes.

**What data was affected:**
- [X] client records (names and basic contact info only)
- No meeting transcripts, recordings, or AI-generated content
- No passwords or payment information

**What we did:**
1. Immediately disabled the affected feature
2. Restored from backup to remove all exposed data
3. Implemented additional safeguards to prevent recurrence
4. Notified all affected users (including you)

**What you should do:**
- No action required on your part
- Your account password was NOT compromised
- If you have concerns, reply to this email or contact support

**How we're preventing this:**
- Added automated data access tests (run every 5 minutes)
- Implemented row-level security verification on all tables
- Enhanced our deployment review process

We take data privacy seriously and sincerely apologize for this incident. If you have any questions, please reach out.

Best regards,
[Your Name]
MeetSolis Team

---
For technical details: [INCIDENT REPORT URL]
```

---

### Status Page Update

**Incident:** MeetSolis v2.0 Feature Rollback

**Status:** Monitoring
**Started:** Jan 7, 2026 14:23 UTC
**Duration:** 4 minutes

**Timeline:**
- **14:23 UTC** - High error rate detected (8.3%)
- **14:24 UTC** - Feature flags disabled
- **14:25 UTC** - Deployment complete
- **14:27 UTC** - Error rate normalized (0.2%)
- **14:30 UTC** - Monitoring for anomalies

**Impact:**
- Users redirected to legacy interface
- No data loss or service interruption
- All features operational

**Resolution:**
v2.0 features temporarily disabled. Users can continue using MeetSolis with previous interface. We're investigating the root cause and will provide updates.

---

## Post-Rollback Actions

### Immediate (0-30 minutes)

- [ ] **Verify Epic 1 functionality**
  ```bash
  bash scripts/migration/verify-epic1.sh production
  ```

- [ ] **Check error rate** (target: <1%)
  - Sentry dashboard
  - Vercel logs

- [ ] **Test critical paths**
  - User login
  - Meeting creation (legacy)
  - AI usage tracking

- [ ] **Update status page**
  - Status: Monitoring
  - Incident timeline
  - Expected resolution

- [ ] **Post in Slack**
  - `#incidents` - rollback complete
  - `#engineering` - action items
  - `#customer-success` - user communication plan

### Short-term (30-120 minutes)

- [ ] **Monitor metrics**
  - Error rate stable <1%
  - Latency p95 <200ms
  - No new Sentry issues

- [ ] **Review logs**
  - Identify root cause
  - Document timeline
  - List affected users

- [ ] **Notify users** (if data exposure)
  - Use email template above
  - Send within 2 hours

- [ ] **Schedule post-mortem**
  - Within 24 hours
  - Include: PM, Dev, DevOps
  - Document: `docs/deployment/incident-YYYYMMDD.md`

### Long-term (1-7 days)

- [ ] **Post-mortem complete**
  - Root cause identified
  - Prevention plan documented
  - Action items assigned

- [ ] **Fix root cause**
  - Code changes
  - Additional tests
  - Staging validation

- [ ] **Re-attempt migration** (if applicable)
  - Wait minimum 48 hours
  - Complete all action items first
  - Test on staging with production data clone

- [ ] **Update documentation**
  - Add lessons learned
  - Update rollback SOP (this doc)
  - Enhance pre-migration checklist

---

## Pre-Rollback Checklist

**Before initiating any rollback:**

- [ ] Confirm trigger threshold exceeded (see Monitoring Triggers)
- [ ] Notify on-call engineer (`@engineer` in Slack)
- [ ] Post in `#incidents` (use template above)
- [ ] Have backup file path ready (`backups/backup-epic1-production-*.sql.gz`)
- [ ] Verify Vercel CLI authenticated (`vercel whoami`)
- [ ] Open Sentry dashboard (monitor error rate real-time)
- [ ] Open status page admin (prepare update)

**Do NOT rollback if:**
- Error rate <5% and declining
- Isolated to single user (<3 reports)
- Non-critical feature (analytics, etc.)
- Monitoring alert is false positive

**Instead:**
- Monitor for 10 more minutes
- Investigate logs
- Contact affected user directly

---

## Testing Rollback Procedures

### Staging Rehearsal (Required Before Production)

**Frequency:** Before each major migration

**Steps:**

```bash
# 1. Clone production to staging
pg_dump $PROD_DATABASE_URL | psql $STAGING_DATABASE_URL

# 2. Run migration on staging
psql $STAGING_DATABASE_URL -f scripts/migration/migrate-v2.sql

# 3. Simulate failure (manual corruption)
psql $STAGING_DATABASE_URL -c "UPDATE users SET clerk_id = NULL WHERE id IN (SELECT id FROM users LIMIT 5)"

# 4. Detect "issue" (RLS failures)
# Check Supabase logs for auth errors

# 5. Execute Method B rollback
bash scripts/migration/backup.sh staging
vercel env rm NEXT_PUBLIC_ENABLE_CLIENT_CARDS preview
psql $STAGING_DATABASE_URL -f scripts/migration/rollback-v2.sql

# 6. Verify Epic 1
bash scripts/migration/verify-epic1.sh staging

# 7. Document results
# Expected: All tests pass, rollback takes <10 min
```

**Document:** `test-results/staging-rollback-rehearsal-YYYYMMDD.md`

---

## Appendix: Command Quick Copy

**Feature flag disable:**
```bash
vercel env rm NEXT_PUBLIC_ENABLE_CLIENT_CARDS production && vercel env rm NEXT_PUBLIC_ENABLE_NEW_MEETINGS production && vercel env rm ENABLE_PGVECTOR production && vercel --prod
```

**Database restore:**
```bash
gunzip backups/backup-epic1-production-*.sql.gz && psql $DATABASE_URL -f backups/backup-epic1-production-*.sql
```

**Verification:**
```bash
bash scripts/migration/verify-epic1.sh production
```

**Rollback SQL:**
```bash
psql $DATABASE_URL -f scripts/migration/rollback-v2.sql
```

---

**Document Owner:** DevOps Team
**Last Tested:** Never (pending staging rehearsal)
**Next Review:** After first production rollback
**Change Log:**
- 2026-01-07: Initial version created
