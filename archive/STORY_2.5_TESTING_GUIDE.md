# Story 2.5: Meeting Security and Access Controls - Testing Guide

**Story Version:** 2.0
**Test Date:** 2025-12-21
**Tester:** [Your Name]
**Environment:** [Development/Staging/Production]

---

## Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Database Migration Verification](#database-migration-verification)
3. [Secure Meeting URLs (AC 10)](#secure-meeting-urls-ac-10)
4. [Role-Based Permissions (AC 3)](#role-based-permissions-ac-3)
5. [Waiting Room Enhancements (AC 2)](#waiting-room-enhancements-ac-2)
6. [Screen Sharing Permissions (AC 6)](#screen-sharing-permissions-ac-6)
7. [Chat Message Deletion (AC 7)](#chat-message-deletion-ac-7)
8. [Automated Tests](#automated-tests)
9. [Security & Performance Testing](#security--performance-testing)
10. [Test Summary](#test-summary)

---

## Pre-Testing Setup

### Database Migration

**Run migration 013:**
```bash
# Ensure Supabase CLI is configured
supabase db push

# Or apply migration manually via Supabase dashboard
# Upload: apps/web/migrations/013_add_security_features.sql
```

**Verify migration:**
```sql
-- Check new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'meetings'
AND column_name IN ('invite_token', 'expires_at', 'waiting_room_whitelist', 'allow_participant_screenshare');

-- Check participants role constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'participants_role_check';

-- Expected: CHECK (role IN ('host', 'participant'))
```

### Test User Accounts

**Create test accounts:**
- **Host:** host@test.com (has meeting creation privileges)
- **Participant 1:** participant1@test.com
- **Participant 2:** participant2@test.com
- **Whitelisted User:** trusted@test.com (will be added to whitelist)

---

## Database Migration Verification

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T1.1** Run migration 013 | Migration completes successfully | ☐ Pass ☐ Fail | |
| **T1.2** Verify invite_token column | UUID column exists with UNIQUE constraint | ☐ Pass ☐ Fail | |
| **T1.3** Verify expires_at column | TIMESTAMP column exists | ☐ Pass ☐ Fail | |
| **T1.4** Verify waiting_room_whitelist | JSONB column with default '[]' | ☐ Pass ☐ Fail | |
| **T1.5** Verify allow_participant_screenshare | BOOLEAN column with default false | ☐ Pass ☐ Fail | |
| **T1.6** Verify role constraint update | Only 'host' and 'participant' allowed | ☐ Pass ☐ Fail | |
| **T1.7** Verify indexes created | Indexes on invite_token and expires_at exist | ☐ Pass ☐ Fail | |
| **T1.8** Verify email column in waiting_room_participants | TEXT column exists | ☐ Pass ☐ Fail | |

---

## Secure Meeting URLs (AC 10)

### Test 2.1: Meeting Creation with Expiration

**Test Steps:**
1. Sign in as host@test.com
2. Navigate to Dashboard
3. Click "Start Meeting" button
4. Fill meeting details:
   - Title: "Test Meeting - Link Expiration"
   - Description: "Testing link expiration feature"
   - Link Expiration: Select "24 hours"
5. Click "Start Meeting"

**Verification:**
```bash
# Via API test
curl -X POST http://localhost:3000/api/meetings \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Meeting",
    "expiresIn": "24h"
  }'
```

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T2.1.1** Create meeting with "never" expiration | expires_at is NULL, invite_token generated | ☐ Pass ☐ Fail | |
| **T2.1.2** Create meeting with "24h" expiration | expires_at = now + 24 hours | ☐ Pass ☐ Fail | |
| **T2.1.3** Create meeting with "7d" expiration | expires_at = now + 7 days | ☐ Pass ☐ Fail | |
| **T2.1.4** Create meeting with "30d" expiration | expires_at = now + 30 days | ☐ Pass ☐ Fail | |
| **T2.1.5** Verify invite_token format | Valid UUID v4 format | ☐ Pass ☐ Fail | |
| **T2.1.6** Verify invite URL includes token | URL: /meeting/join/{invite_token} | ☐ Pass ☐ Fail | |

### Test 2.2: Join Meeting with Valid Link

**Test Steps:**
1. Copy meeting invite link
2. Open incognito browser
3. Sign in as participant1@test.com
4. Navigate to invite link
5. Attempt to join meeting

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T2.2.1** Join with non-expired link | Successfully join/enter waiting room | ☐ Pass ☐ Fail | |
| **T2.2.2** Join with never-expiring link | Successfully join/enter waiting room | ☐ Pass ☐ Fail | |

### Test 2.3: Join Meeting with Expired Link

**Test Steps:**
1. Manually set expires_at in database to past date:
   ```sql
   UPDATE meetings
   SET expires_at = NOW() - INTERVAL '1 hour'
   WHERE meeting_code = 'YOUR_MEETING_CODE';
   ```
2. Attempt to join via invite link

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T2.3.1** Join with expired link | Error: "Meeting link has expired" (403) | ☐ Pass ☐ Fail | |
| **T2.3.2** Error message displayed | User-friendly error shown on UI | ☐ Pass ☐ Fail | |

### Test 2.4: Regenerate Invite Link

**Test Steps:**
1. Sign in as host@test.com
2. Navigate to meeting settings/details
3. Click "Regenerate Invite Link"
4. Select new expiration (e.g., "7d")
5. Confirm regeneration

**API Test:**
```bash
curl -X POST http://localhost:3000/api/meetings/{meeting_code}/regenerate-link \
  -H "Authorization: Bearer HOST_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "expiresIn": "7d"
  }'
```

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T2.4.1** Host regenerates link | New invite_token generated | ☐ Pass ☐ Fail | |
| **T2.4.2** Old link invalidated | Old invite_token no longer works | ☐ Pass ☐ Fail | |
| **T2.4.3** New expiration applied | expires_at updated correctly | ☐ Pass ☐ Fail | |
| **T2.4.4** Participant cannot regenerate | 403 Forbidden error | ☐ Pass ☐ Fail | |
| **T2.4.5** New link works | Can join with new invite_token | ☐ Pass ☐ Fail | |

---

## Role-Based Permissions (AC 3)

### Test 3.1: Permission Utility Functions

**Run unit tests:**
```bash
cd apps/web
npm test -- --testPathPattern="permissions.test.ts"
```

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T3.1.1** All 16 permission tests pass | 100% pass rate | ☐ Pass ☐ Fail | |
| **T3.1.2** Host permissions correct | Host can perform all actions | ☐ Pass ☐ Fail | |
| **T3.1.3** Participant permissions correct | Limited to appropriate actions | ☐ Pass ☐ Fail | |
| **T3.1.4** Screen share permission logic | canScreenShare works correctly | ☐ Pass ☐ Fail | |

### Test 3.2: Role Constraint Validation

**Test Steps:**
1. Attempt to create participant with "co-host" role via SQL:
   ```sql
   INSERT INTO participants (meeting_id, user_id, role)
   VALUES ('meeting-uuid', 'user-uuid', 'co-host');
   ```

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T3.2.1** Create participant with invalid role | Constraint violation error | ☐ Pass ☐ Fail | |
| **T3.2.2** Create participant with 'host' | Success | ☐ Pass ☐ Fail | |
| **T3.2.3** Create participant with 'participant' | Success | ☐ Pass ☐ Fail | |
| **T3.2.4** Join API accepts only valid roles | 'co-host' rejected with 400 | ☐ Pass ☐ Fail | |

### Test 3.3: Host-Only API Endpoints

**Test as participant1@test.com:**
```bash
# Try to regenerate link (host-only)
curl -X POST http://localhost:3000/api/meetings/{meeting_code}/regenerate-link \
  -H "Authorization: Bearer PARTICIPANT_TOKEN"

# Try to add to whitelist (host-only)
curl -X POST http://localhost:3000/api/meetings/{meeting_code}/whitelist \
  -H "Authorization: Bearer PARTICIPANT_TOKEN" \
  -d '{"email": "test@example.com"}'
```

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T3.3.1** Participant regenerates link | 403 Forbidden | ☐ Pass ☐ Fail | |
| **T3.3.2** Participant manages whitelist | 403 Forbidden | ☐ Pass ☐ Fail | |
| **T3.3.3** Participant views whitelist | 403 Forbidden | ☐ Pass ☐ Fail | |
| **T3.3.4** Participant updates screen share settings | 403 Forbidden | ☐ Pass ☐ Fail | |
| **T3.3.5** Host performs same actions | All succeed (200) | ☐ Pass ☐ Fail | |

---

## Waiting Room Enhancements (AC 2)

### Test 4.1: Whitelist Management

**Test Steps:**
1. Sign in as host@test.com
2. Create a meeting
3. Access meeting settings/whitelist panel

**API Test - Add to whitelist:**
```bash
curl -X POST http://localhost:3000/api/meetings/{meeting_code}/whitelist \
  -H "Authorization: Bearer HOST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trusted@test.com"
  }'
```

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T4.1.1** Add valid email to whitelist | Email added successfully (200) | ☐ Pass ☐ Fail | |
| **T4.1.2** Add duplicate email | Error: "Already exists" (400) | ☐ Pass ☐ Fail | |
| **T4.1.3** Add invalid email format | Zod validation error (400) | ☐ Pass ☐ Fail | |
| **T4.1.4** Email stored lowercase | "User@Test.com" → "user@test.com" | ☐ Pass ☐ Fail | |
| **T4.1.5** Get whitelist | Returns array of emails (200) | ☐ Pass ☐ Fail | |

**API Test - Remove from whitelist:**
```bash
curl -X DELETE http://localhost:3000/api/meetings/{meeting_code}/whitelist/trusted@test.com \
  -H "Authorization: Bearer HOST_TOKEN"
```

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T4.1.6** Remove existing email | Email removed successfully (200) | ☐ Pass ☐ Fail | |
| **T4.1.7** Remove non-existent email | Error: "Not found" (404) | ☐ Pass ☐ Fail | |

### Test 4.2: Whitelist Auto-Admit

**Test Steps:**
1. Add trusted@test.com to whitelist
2. Sign in as trusted@test.com (in incognito)
3. Navigate to meeting invite link
4. Observe join behavior

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T4.2.1** Whitelisted user joins | Bypasses waiting room, auto-admitted | ☐ Pass ☐ Fail | |
| **T4.2.2** Non-whitelisted user joins | Sent to waiting room | ☐ Pass ☐ Fail | |
| **T4.2.3** Empty whitelist | All participants go to waiting room | ☐ Pass ☐ Fail | |
| **T4.2.4** Case-insensitive matching | "Trusted@Test.Com" matches whitelist | ☐ Pass ☐ Fail | |

### Test 4.3: Waiting Room Panel - Email Display

**Test Steps:**
1. Sign in as host@test.com and start meeting
2. Have participant2@test.com join (non-whitelisted)
3. Open Waiting Room Panel as host
4. Observe participant information

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T4.3.1** Display name shown | Participant's display name visible | ☐ Pass ☐ Fail | |
| **T4.3.2** Email shown | participant2@test.com displayed | ☐ Pass ☐ Fail | |
| **T4.3.3** Waiting time shown | "Joined X seconds/minutes ago" | ☐ Pass ☐ Fail | |
| **T4.3.4** Waiting time updates | Time increments in real-time | ☐ Pass ☐ Fail | |

### Test 4.4: Auto-Reject After 10 Minutes

**Test Steps:**
1. Have participant join waiting room
2. Wait 10+ minutes OR manually update joined_at:
   ```sql
   UPDATE waiting_room_participants
   SET joined_at = NOW() - INTERVAL '11 minutes'
   WHERE user_id = 'participant-uuid';
   ```
3. Refresh waiting room panel as host

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T4.4.1** Participant waiting < 10 min | Still in waiting room | ☐ Pass ☐ Fail | |
| **T4.4.2** Participant waiting > 10 min | Auto-rejected (status = 'rejected') | ☐ Pass ☐ Fail | |
| **T4.4.3** Removed from host's panel | No longer visible in waiting list | ☐ Pass ☐ Fail | |
| **T4.4.4** Participant notified | Receives rejection message/redirect | ☐ Pass ☐ Fail | |

---

## Screen Sharing Permissions (AC 6)

### Test 5.1: Screen Share Settings Toggle

**Test Steps:**
1. Sign in as host@test.com
2. Start/join a meeting
3. Open Meeting Settings Panel
4. Locate "Participant Screen Share" toggle

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T5.1.1** Toggle exists in settings | Visible in Meeting Settings Panel | ☐ Pass ☐ Fail | |
| **T5.1.2** Default state is OFF | allow_participant_screenshare = false | ☐ Pass ☐ Fail | |
| **T5.1.3** Toggle ON | Setting updates to true | ☐ Pass ☐ Fail | |
| **T5.1.4** Toggle OFF | Setting updates to false | ☐ Pass ☐ Fail | |
| **T5.1.5** Changes persist | Refresh page, setting remains | ☐ Pass ☐ Fail | |

### Test 5.2: Host Screen Sharing

**Test Steps:**
1. As host, attempt to share screen
2. Test with toggle ON and OFF

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T5.2.1** Host shares screen (toggle OFF) | Screen share succeeds | ☐ Pass ☐ Fail | |
| **T5.2.2** Host shares screen (toggle ON) | Screen share succeeds | ☐ Pass ☐ Fail | |
| **T5.2.3** Host always can share | Regardless of toggle state | ☐ Pass ☐ Fail | |

### Test 5.3: Participant Screen Sharing

**Test Steps:**
1. Join as participant1@test.com
2. Attempt to share screen with toggle OFF
3. Host toggles setting to ON
4. Attempt to share screen again

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T5.3.1** Participant shares (toggle OFF) | Error: "Only host can share" | ☐ Pass ☐ Fail | |
| **T5.3.2** Screen share button disabled | UI indicates not allowed | ☐ Pass ☐ Fail | |
| **T5.3.3** Participant shares (toggle ON) | Screen share succeeds | ☐ Pass ☐ Fail | |
| **T5.3.4** Screen share button enabled | UI indicates allowed | ☐ Pass ☐ Fail | |
| **T5.3.5** Real-time permission update | Toggle changes apply immediately | ☐ Pass ☐ Fail | |

### Test 5.4: API Endpoint

**API Test:**
```bash
curl -X PUT http://localhost:3000/api/meetings/{meeting_code}/screen-share-settings \
  -H "Authorization: Bearer HOST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "allowAll": true
  }'
```

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T5.4.1** Host updates setting | 200 OK, setting updated | ☐ Pass ☐ Fail | |
| **T5.4.2** Participant updates setting | 403 Forbidden | ☐ Pass ☐ Fail | |
| **T5.4.3** Invalid value | 400 Bad Request (Zod validation) | ☐ Pass ☐ Fail | |

### Test 5.5: Meeting Creation Form

**Test Steps:**
1. Navigate to Dashboard
2. Click "Start Meeting"
3. Observe meeting creation form

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T5.5.1** Link expiration selector exists | Dropdown with 4 options visible | ☐ Pass ☐ Fail | |
| **T5.5.2** Default selection | "Never expires" selected | ☐ Pass ☐ Fail | |
| **T5.5.3** Select "24 hours" | Option can be selected | ☐ Pass ☐ Fail | |
| **T5.5.4** Create with selection | Meeting created with correct expiration | ☐ Pass ☐ Fail | |
| **T5.5.5** Help text shown | Description of expiration feature | ☐ Pass ☐ Fail | |

---

## Chat Message Deletion (AC 7)

### Test 6.1: Verify Existing Functionality

**Test Steps:**
1. Start meeting as host
2. Have participant join
3. Send messages from both users
4. Test deletion permissions

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T6.1.1** Host deletes own message | Message soft-deleted (is_deleted = true) | ☐ Pass ☐ Fail | |
| **T6.1.2** Host deletes participant message | Message soft-deleted | ☐ Pass ☐ Fail | |
| **T6.1.3** Participant deletes own message | Message soft-deleted | ☐ Pass ☐ Fail | |
| **T6.1.4** Participant deletes host message | 403 Forbidden error | ☐ Pass ☐ Fail | |
| **T6.1.5** Participant deletes other participant's message | 403 Forbidden error | ☐ Pass ☐ Fail | |
| **T6.1.6** Deleted message UI | Shows "[Message deleted]" placeholder | ☐ Pass ☐ Fail | |

---

## Automated Tests

### Test 7.1: Unit Tests

**Run all tests:**
```bash
cd apps/web
npm test
```

| Test Suite | Expected Result | Status | Notes |
|------------|-----------------|--------|-------|
| **T7.1.1** permissions.test.ts | 16/16 tests pass | ☐ Pass ☐ Fail | |
| **T7.1.2** security-features.test.ts | 26/26 tests pass | ☐ Pass ☐ Fail | |
| **T7.1.3** Total test count | 42 tests pass | ☐ Pass ☐ Fail | |
| **T7.1.4** Test coverage | All core functionality covered | ☐ Pass ☐ Fail | |

### Test 7.2: TypeScript Compilation

**Run type checking:**
```bash
cd apps/web
npx tsc --noEmit
```

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T7.2.1** TypeScript compiles | No type errors | ☐ Pass ☐ Fail | |
| **T7.2.2** All imports resolve | No module resolution errors | ☐ Pass ☐ Fail | |

### Test 7.3: Linting

**Run ESLint:**
```bash
cd apps/web
npm run lint
```

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T7.3.1** ESLint passes | No new errors or warnings | ☐ Pass ☐ Fail | |

---

## Security & Performance Testing

### Test 8.1: Security Validation

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T8.1.1** SQL injection attempts | All inputs properly sanitized | ☐ Pass ☐ Fail | |
| **T8.1.2** XSS attempts in email field | Sanitized and rejected | ☐ Pass ☐ Fail | |
| **T8.1.3** JWT token validation | Invalid tokens rejected (401) | ☐ Pass ☐ Fail | |
| **T8.1.4** Authorization bypass attempts | Proper 403 errors returned | ☐ Pass ☐ Fail | |
| **T8.1.5** Invite token brute force | Rate limiting (if implemented) | ☐ Pass ☐ Fail | |
| **T8.1.6** CORS policy | Proper CORS headers set | ☐ Pass ☐ Fail | |

### Test 8.2: Performance Testing

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T8.2.1** Meeting creation API | < 500ms response time | ☐ Pass ☐ Fail | |
| **T8.2.2** Whitelist API (GET) | < 200ms response time | ☐ Pass ☐ Fail | |
| **T8.2.3** Link validation on join | < 100ms check time | ☐ Pass ☐ Fail | |
| **T8.2.4** Waiting room polling | 5-second interval, low overhead | ☐ Pass ☐ Fail | |
| **T8.2.5** Auto-reject query | Efficient DB query, no N+1 | ☐ Pass ☐ Fail | |

### Test 8.3: Edge Cases

| Test Case | Expected Result | Status | Notes |
|-----------|-----------------|--------|-------|
| **T8.3.1** Empty whitelist array | Handled correctly, no errors | ☐ Pass ☐ Fail | |
| **T8.3.2** Null expires_at | Never-expiring link works | ☐ Pass ☐ Fail | |
| **T8.3.3** Future expires_at | Link works until expiration | ☐ Pass ☐ Fail | |
| **T8.3.4** Large whitelist (100+ emails) | JSONB handles efficiently | ☐ Pass ☐ Fail | |
| **T8.3.5** Special characters in email | Properly encoded/decoded | ☐ Pass ☐ Fail | |
| **T8.3.6** Concurrent whitelist updates | No race conditions | ☐ Pass ☐ Fail | |

---

## Test Summary

### Test Results Overview

| Category | Total Tests | Passed | Failed | Pass Rate |
|----------|------------|--------|--------|-----------|
| Database Migration | 8 | | | % |
| Secure URLs | 17 | | | % |
| Role Permissions | 14 | | | % |
| Waiting Room | 17 | | | % |
| Screen Sharing | 15 | | | % |
| Chat Deletion | 6 | | | % |
| Automated Tests | 5 | | | % |
| Security & Performance | 19 | | | % |
| **TOTAL** | **101** | | | **%** |

### Critical Issues Found

| Issue ID | Severity | Description | Status | Resolution |
|----------|----------|-------------|--------|------------|
| | | | ☐ Open ☐ Fixed | |

### Known Limitations

1. **Whitelist UI Management:** Admin panel for whitelist management not implemented (backend API complete)
2. **Auto-reject Notification:** Participant notification for auto-reject deferred
3. **Rate Limiting:** Not implemented in MVP (planned for post-launch)

### Test Sign-Off

**Tested By:** _________________________
**Date:** _________________________
**Approved:** ☐ Yes ☐ No (pending fixes)

**Notes:**
```
[Add any additional testing notes, observations, or recommendations here]
```

---

## Appendix A: API Endpoint Reference

### Secure URLs
- `POST /api/meetings` - Create meeting with expiration
- `POST /api/meetings/[id]/regenerate-link` - Regenerate invite link

### Whitelist Management
- `GET /api/meetings/[id]/whitelist` - Get whitelist
- `POST /api/meetings/[id]/whitelist` - Add email
- `DELETE /api/meetings/[id]/whitelist/[email]` - Remove email

### Screen Sharing
- `PUT /api/meetings/[id]/screen-share-settings` - Update setting

### Waiting Room
- `GET /api/meetings/[id]/waiting-room` - List participants (includes auto-reject)

---

## Appendix B: Database Queries for Testing

**Check invite token:**
```sql
SELECT meeting_code, invite_token, expires_at
FROM meetings
WHERE meeting_code = 'YOUR_CODE';
```

**Check whitelist:**
```sql
SELECT meeting_code, waiting_room_whitelist
FROM meetings
WHERE meeting_code = 'YOUR_CODE';
```

**Check screen share setting:**
```sql
SELECT meeting_code, allow_participant_screenshare
FROM meetings
WHERE meeting_code = 'YOUR_CODE';
```

**Waiting room participants:**
```sql
SELECT id, display_name, email, joined_at, status
FROM waiting_room_participants
WHERE meeting_id = (
  SELECT id FROM meetings WHERE meeting_code = 'YOUR_CODE'
);
```

**Check participant roles:**
```sql
SELECT u.email, p.role
FROM participants p
JOIN users u ON p.user_id = u.id
WHERE p.meeting_id = (
  SELECT id FROM meetings WHERE meeting_code = 'YOUR_CODE'
);
```

---

**END OF TESTING GUIDE**
