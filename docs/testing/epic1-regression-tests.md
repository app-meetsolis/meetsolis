# Epic 1 Regression Test Strategy

**Version:** 1.0
**Last Updated:** January 7, 2026
**Purpose:** Ensure Epic 1 functionality preserved during v2.0 migration

---

## Executive Summary

**Objective:** Verify all Epic 1 features work identically before and after v2.0 migration

**Test Categories:** 5 (Authentication, Database/RLS, Realtime, Rate Limiting, Security)
**Total Tests:** 23 test cases
**Priority:** P0 (Critical) = 15 tests, P1 (High) = 8 tests

**Success Criteria:**
- 100% P0 tests pass pre-migration
- 100% P0 tests pass post-migration
- 0 regression bugs in Epic 1 functionality

---

## Test Execution Strategy

### Three-Phase Testing

**Phase 1: Pre-Migration Baseline**
```bash
bash scripts/testing/run-epic1-tests.sh baseline
# Creates: test-results/epic1-baseline-YYYYMMDD.json
```
- Run ALL tests before migration
- Record results (expect 100% pass)
- Store as baseline for comparison

**Phase 2: Post-Migration Verification**
```bash
bash scripts/testing/run-epic1-tests.sh verify
# Creates: test-results/epic1-verify-YYYYMMDD.json
# Compares: Against baseline results
```
- Run SAME tests after migration
- Compare results against baseline
- Flag any new failures as regressions

**Phase 3: Integration Testing**
```bash
bash scripts/testing/run-epic1-tests.sh integration
# Creates: test-results/epic1-integration-YYYYMMDD.json
```
- Test Epic 1 ↔ Epic 2 interoperability
- Verify new features don't break old features
- Validate data flow across epics

---

## Category 1: Authentication (P0 - CRITICAL)

### Test 1.1: User Signup Creates Database Row

**Purpose:** Verify Clerk webhook syncs new users to `users` table

**Test Steps:**
1. Create new user via Clerk API
2. Trigger webhook: POST /api/webhooks/clerk (event: user.created)
3. Query database: `SELECT * FROM users WHERE clerk_id = '{new_user_id}'`

**Expected Result:**
- User row exists in database
- `clerk_id` matches
- `created_at` timestamp recent (<1 min)

**Test File:** `apps/web/tests/integration/auth/user-sync.test.ts`

**Manual Verification:**
```bash
# Create test user
curl -X POST https://api.clerk.dev/v1/users \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -d '{"email_address": ["test@meetsolis.com"]}'

# Check database
psql $DATABASE_URL -c "SELECT * FROM users WHERE clerk_id = 'user_xxx'"
```

---

### Test 1.2: Auth Middleware Blocks Unauthenticated Requests

**Purpose:** Verify protected API routes require valid JWT

**Test Steps:**
1. Call protected route WITHOUT auth header: GET /api/meetings
2. Call protected route WITH invalid token: GET /api/meetings (Authorization: Bearer invalid)
3. Call protected route WITH valid token: GET /api/meetings (Authorization: Bearer {valid_jwt})

**Expected Results:**
- No auth: HTTP 401 Unauthorized
- Invalid token: HTTP 401 Unauthorized
- Valid token: HTTP 200 OK

**Test File:** `apps/web/tests/integration/auth/middleware.test.ts`

---

### Test 1.3: User Deletion Cascades to Child Records

**Purpose:** Verify CASCADE delete prevents orphaned records

**Test Steps:**
1. Create test user
2. Create child records (ai_usage_tracking entries)
3. Delete user via Clerk
4. Query for child records

**Expected Result:**
- User deleted from `users` table
- All child records deleted (CASCADE)
- No orphaned records in ai_usage_tracking

**Test File:** `apps/web/tests/integration/auth/user-deletion.test.ts`

---

### Test 1.4: JWT Validation Rejects Expired Tokens

**Purpose:** Verify token expiration enforced

**Test Steps:**
1. Generate expired JWT (exp claim in past)
2. Call protected route with expired token
3. Verify rejection

**Expected Result:**
- HTTP 401 Unauthorized
- Error message: "Token expired"

**Test File:** `apps/web/tests/integration/auth/jwt-expiration.test.ts`

---

## Category 2: Database & RLS (P0 - CRITICAL)

### Test 2.1: RLS Prevents Cross-User Data Access

**Purpose:** Verify Row Level Security enforced on all tables

**Test Steps:**
1. Create 2 test users (User A, User B)
2. User A creates ai_usage_tracking entry
3. User B queries ai_usage_tracking with their JWT
4. Verify User B cannot see User A's data

**Expected Result:**
- User B query returns 0 rows (or only their own data)
- No cross-user access

**Test File:** `apps/web/tests/integration/database/rls-enforcement.test.ts`

**Manual Verification:**
```sql
-- As User A (clerk_id = 'user_aaa')
INSERT INTO ai_usage_tracking (user_id, feature, tokens_used)
VALUES ((SELECT id FROM users WHERE clerk_id = 'user_aaa'), 'test', 100);

-- As User B (clerk_id = 'user_bbb'), try to query
SET request.jwt.claims TO '{"sub": "user_bbb"}';
SELECT * FROM ai_usage_tracking;
-- Expected: 0 rows (or only User B's rows)
```

---

### Test 2.2: Users Can Read/Write Own Data

**Purpose:** Verify RLS allows users to access their own data

**Test Steps:**
1. User A creates ai_usage_tracking entry
2. User A queries ai_usage_tracking
3. Verify their own data returned

**Expected Result:**
- User A sees their own rows
- Read and write operations succeed

**Test File:** `apps/web/tests/integration/database/rls-own-data.test.ts`

---

### Test 2.3: Service Role Bypasses RLS

**Purpose:** Verify service role can access all data (for migrations, admin)

**Test Steps:**
1. Query users table with service role credentials
2. Verify all rows returned (not just one user)

**Expected Result:**
- Service role sees ALL users
- RLS bypassed for service role

**Test File:** `apps/web/tests/integration/database/rls-service-role.test.ts`

---

### Test 2.4: Transaction Isolation Works

**Purpose:** Verify concurrent transactions don't interfere

**Test Steps:**
1. Start transaction A: BEGIN
2. Start transaction B: BEGIN
3. Transaction A updates row
4. Transaction B queries same row (should see old value)
5. Transaction A commits
6. Transaction B queries again (should see new value)

**Expected Result:**
- Transactions isolated until commit
- No dirty reads

**Test File:** `apps/web/tests/integration/database/transaction-isolation.test.ts`

---

### Test 2.5: Foreign Key Constraints Enforced

**Purpose:** Verify FK constraints prevent orphaned records

**Test Steps:**
1. Attempt to create ai_usage_tracking entry with invalid user_id
2. Verify constraint violation error

**Expected Result:**
- INSERT fails with FK constraint error
- Database integrity maintained

**Test File:** `apps/web/tests/integration/database/fk-constraints.test.ts`

---

## Category 3: Realtime Subscriptions (P1 - HIGH)

### Test 3.1: Realtime Updates Received on Meetings Table

**Purpose:** Verify Supabase Realtime publishes changes

**Test Steps:**
1. Subscribe to `meetings` table changes
2. Insert new row in meetings table
3. Verify INSERT event received

**Expected Result:**
- Event type: INSERT
- Payload contains new row data
- Latency <500ms

**Test File:** `apps/web/tests/integration/realtime/meetings-subscription.test.ts`

---

### Test 3.2: Participant Changes Broadcast

**Purpose:** Verify real-time participant updates

**Test Steps:**
1. Subscribe to `participants` table
2. Add participant to meeting
3. Verify event received

**Expected Result:**
- Event type: INSERT
- Contains participant data

**Test File:** `apps/web/tests/integration/realtime/participants-subscription.test.ts`

---

### Test 3.3: Graceful Connection Error Handling

**Purpose:** Verify app handles realtime connection loss

**Test Steps:**
1. Establish realtime connection
2. Simulate network error (disconnect)
3. Verify app handles gracefully (no crash)
4. Verify reconnection attempt

**Expected Result:**
- No unhandled errors
- Reconnection after 5 seconds
- User notified of connection status

**Test File:** `apps/web/tests/integration/realtime/error-handling.test.ts`

---

## Category 4: Rate Limiting (P1 - HIGH)

### Test 4.1: 10 Requests/Minute Limit Enforced

**Purpose:** Verify Upstash Redis rate limiting works

**Test Steps:**
1. Make 10 requests to /api/meetings within 1 minute
2. Make 11th request
3. Verify 11th request rejected

**Expected Result:**
- Requests 1-10: HTTP 200 OK
- Request 11: HTTP 429 Too Many Requests

**Test File:** `apps/web/tests/integration/rate-limiting/limit-enforcement.test.ts`

**Manual Verification:**
```bash
for i in {1..15}; do
  curl -w "\n%{http_code}\n" https://meetsolis.com/api/meetings \
    -H "Authorization: Bearer $TOKEN"
done
# Expected: First 10 = 200, Next 5 = 429
```

---

### Test 4.2: Rate Limit Headers Present

**Purpose:** Verify rate limit headers in responses

**Test Steps:**
1. Make request to rate-limited endpoint
2. Check response headers

**Expected Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1704643200
```

**Test File:** `apps/web/tests/integration/rate-limiting/headers.test.ts`

---

### Test 4.3: Redis Connection Health

**Purpose:** Verify Redis connection functional

**Test Steps:**
1. Call Redis health check endpoint
2. Verify connection success

**Expected Result:**
- Redis ping succeeds
- Response time <100ms

**Test File:** `apps/web/tests/integration/rate-limiting/redis-health.test.ts`

---

## Category 5: Security (P0 - CRITICAL)

### Test 5.1: XSS Sanitization Works

**Purpose:** Verify user inputs sanitized to prevent XSS

**Test Steps:**
1. Submit form with malicious script: `<script>alert('xss')</script>`
2. Verify script tags removed/escaped
3. Verify stored data is safe

**Expected Result:**
- Script tags escaped: `&lt;script&gt;alert('xss')&lt;/script&gt;`
- No script execution

**Test File:** `apps/web/tests/integration/security/xss-prevention.test.ts`

---

### Test 5.2: Security Headers Present

**Purpose:** Verify security headers on all responses

**Test Steps:**
1. Make request to any endpoint
2. Check response headers

**Expected Headers:**
```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
```

**Test File:** `apps/web/tests/integration/security/headers.test.ts`

**Manual Verification:**
```bash
curl -I https://meetsolis.com/api/health
```

---

### Test 5.3: Input Validation Enforced (Zod)

**Purpose:** Verify Zod schemas validate API inputs

**Test Steps:**
1. Call API with invalid data (e.g., missing required field)
2. Call API with wrong data type (string instead of number)
3. Verify validation errors returned

**Expected Result:**
- HTTP 400 Bad Request
- Error details: "Field 'email' is required"

**Test File:** `apps/web/tests/integration/security/input-validation.test.ts`

---

### Test 5.4: HTTPS-Only Cookies

**Purpose:** Verify auth cookies have secure flags

**Test Steps:**
1. Log in via Clerk
2. Check Set-Cookie headers

**Expected Flags:**
```
Set-Cookie: __session=xxx; Secure; HttpOnly; SameSite=Lax
```

**Test File:** `apps/web/tests/integration/security/cookie-security.test.ts`

---

## Integration Tests (Epic 1 ↔ Epic 2)

### Test 6.1: New User Can Create Client

**Purpose:** Verify Epic 1 auth works with Epic 2 client creation

**Test Steps:**
1. Create new user via Clerk (Epic 1)
2. User creates client via /api/clients (Epic 2)
3. Verify client created with correct user_id

**Expected Result:**
- Client created successfully
- `client.user_id` matches user.id
- RLS allows user to query their own client

**Test File:** `apps/web/tests/integration/epic1-epic2/auth-client-creation.test.ts`

---

### Test 6.2: RLS Prevents Cross-User Client Access

**Purpose:** Verify Epic 1 RLS extends to Epic 2 tables

**Test Steps:**
1. User A creates client
2. User B queries /api/clients
3. Verify User B cannot see User A's client

**Expected Result:**
- User B query returns 0 clients (or only their own)

**Test File:** `apps/web/tests/integration/epic1-epic2/rls-client-access.test.ts`

---

### Test 6.3: AI Usage Tracked for Epic 2 Features

**Purpose:** Verify Epic 2 AI features write to Epic 1 tracking table

**Test Steps:**
1. User generates AI summary (Epic 2)
2. Query ai_usage_tracking table (Epic 1)
3. Verify entry created

**Expected Result:**
- Row in ai_usage_tracking
- `feature` = 'ai_summary'
- `tokens_used` > 0

**Test File:** `apps/web/tests/integration/epic1-epic2/ai-tracking.test.ts`

---

## Test Execution Commands

### Run All Epic 1 Tests

```bash
# Unit tests only
npm run test:unit -- apps/web/tests/integration/

# Integration tests (requires running database)
npm run test:integration

# E2E tests (requires running app)
npm run test:e2e -- --spec apps/web/tests/e2e/epic1/
```

### Run Specific Category

```bash
# Authentication tests only
npm run test:integration -- auth/

# Database/RLS tests only
npm run test:integration -- database/

# Rate limiting tests only
npm run test:integration -- rate-limiting/
```

### Generate Test Report

```bash
# Run all tests, output JSON
npm run test:integration -- --json --outputFile=test-results/epic1-results.json

# Compare with baseline
node scripts/testing/compare-results.js \
  test-results/epic1-baseline.json \
  test-results/epic1-results.json
```

---

## Success Criteria (Go/No-Go)

### Pre-Migration (Must Pass 100%)

- [ ] All P0 tests pass (15/15)
- [ ] All P1 tests pass (8/8)
- [ ] No flaky tests (3 consecutive runs, all pass)
- [ ] Baseline results saved to `test-results/epic1-baseline.json`

**If any test fails:** Fix test or Epic 1 code before migration

---

### Post-Migration (Must Pass 100%)

- [ ] All P0 tests pass (15/15) - same as baseline
- [ ] All P1 tests pass (8/8) - same as baseline
- [ ] Integration tests pass (3/3)
- [ ] No new regressions detected

**If any test fails:** ROLLBACK migration immediately

---

### Regression Detection

**A regression is defined as:**
- Any test that passed in baseline but fails post-migration
- Any new error/warning in logs during test execution
- Any performance degradation >20% (e.g., p95 latency)

**On regression detected:**
1. Document failing test in `test-results/regressions-YYYYMMDD.md`
2. Disable v2.0 feature flags (immediate mitigation)
3. Investigate root cause
4. Fix issue OR rollback database
5. Re-run tests to verify fix

---

## Test Data Management

### Test User Accounts

**Create before testing:**

```sql
-- Test User A
INSERT INTO users (clerk_id, email, full_name, created_at)
VALUES ('user_test_a', 'test-a@meetsolis.com', 'Test User A', NOW());

-- Test User B
INSERT INTO users (clerk_id, email, full_name, created_at)
VALUES ('user_test_b', 'test-b@meetsolis.com', 'Test User B', NOW());
```

**Cleanup after testing:**

```sql
DELETE FROM users WHERE clerk_id LIKE 'user_test_%';
```

---

### Test Data Fixtures

**Location:** `apps/web/tests/fixtures/epic1/`

**Files:**
- `users.json` - Test user accounts
- `ai-usage.json` - Sample AI usage records
- `jwt-tokens.json` - Valid/invalid/expired JWTs

**Load fixtures:**
```bash
node scripts/testing/load-fixtures.js epic1
```

---

## Known Test Failures (To Fix Before Migration)

### Failure 1: Mock Initialization Error

**File:** `apps/web/src/app/api/meetings/[id]/messages/__tests__/route.test.ts`

**Error:**
```
ReferenceError: Cannot access 'supabase' before initialization
```

**Root Cause:** `jest.mock()` called after imports

**Fix:** Move `jest.mock()` to top of file (before imports)

**Status:** Documented in `docs/testing/test-failure-fixes.md`

---

### Failure 2: Request.json() Not a Function

**File:** `apps/web/src/app/api/meetings/__tests__/meetings.test.ts`

**Error:**
```
TypeError: request.json is not a function
```

**Root Cause:** Mock Request missing `json()` method

**Fix:** Add `json: jest.fn().mockResolvedValue({...})` to mock

**Status:** Documented in `docs/testing/test-failure-fixes.md`

---

### Failure 3: Invalid URL Error

**File:** `apps/web/src/app/api/meetings/__tests__/meetings.test.ts`

**Error:**
```
TypeError: Failed to parse URL from /api/meetings
```

**Root Cause:** NextRequest requires full URL, not relative path

**Fix:** Use `new NextRequest('http://localhost:3000/api/meetings')`

**Status:** Documented in `docs/testing/test-failure-fixes.md`

---

## Test Maintenance

### When to Update Tests

**After any Epic 1 changes:**
- Database schema changes
- API route modifications
- Auth flow updates
- RLS policy changes

**Quarterly:**
- Review all tests for flakiness
- Update test data fixtures
- Verify test execution time <5 min

---

## Appendix: Test File Structure

```
apps/web/tests/
├── integration/
│   ├── auth/
│   │   ├── user-sync.test.ts
│   │   ├── middleware.test.ts
│   │   ├── user-deletion.test.ts
│   │   └── jwt-expiration.test.ts
│   ├── database/
│   │   ├── rls-enforcement.test.ts
│   │   ├── rls-own-data.test.ts
│   │   ├── rls-service-role.test.ts
│   │   ├── transaction-isolation.test.ts
│   │   └── fk-constraints.test.ts
│   ├── realtime/
│   │   ├── meetings-subscription.test.ts
│   │   ├── participants-subscription.test.ts
│   │   └── error-handling.test.ts
│   ├── rate-limiting/
│   │   ├── limit-enforcement.test.ts
│   │   ├── headers.test.ts
│   │   └── redis-health.test.ts
│   ├── security/
│   │   ├── xss-prevention.test.ts
│   │   ├── headers.test.ts
│   │   ├── input-validation.test.ts
│   │   └── cookie-security.test.ts
│   └── epic1-epic2/
│       ├── auth-client-creation.test.ts
│       ├── rls-client-access.test.ts
│       └── ai-tracking.test.ts
├── fixtures/
│   └── epic1/
│       ├── users.json
│       ├── ai-usage.json
│       └── jwt-tokens.json
└── e2e/
    └── epic1/
        ├── login-flow.spec.ts
        ├── meeting-creation.spec.ts
        └── ai-usage.spec.ts
```

---

**Document Owner:** QA Team
**Last Updated:** January 7, 2026
**Next Review:** After migration complete
