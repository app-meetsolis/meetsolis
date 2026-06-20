# Technical Debt Registry

**Last Updated:** June 20, 2026
**Project:** MeetSolis — AI Session Intelligence for Executive Coaches (v3)

> Items 1–4 from the original registry (TURN server, React.memo, WebRTC test mocks, in-memory rate limiting) were v1/v2 video conferencing tech debt and have been archived with the v2 pivot. See `docs/archive/` for historical context.

---

## Overview

| Item | Priority | Introduced | Target Resolution |
|------|----------|-----------|-------------------|
| [In-Memory Rate Limiting](#1-in-memory-rate-limiting) | 🟡 MEDIUM | Story 1.9 | Before multi-instance deploy |
| [Test Suite Coverage Gaps](#2-test-suite-coverage-gaps) | 🟢 LOW | Story 2.1+ | Continuous improvement |
| [Stale Client Route Tests](#4-stale-client-route-tests) | 🟢 LOW | Story 4.4 | Before Epic 5 |
| [4.4 Manual QA — Tests 2–6 Pending](#5-44-manual-qa-tests-26-pending) | 🟡 MEDIUM | Story 4.4 | After Story 5.1 (Stripe) |
| [7.6 Code-Only Verification Pending](#6-76-code-only-verification-pending) | 🟢 LOW | Story 7.6 | At QA gate / next engineer session |

---

## 1. In-Memory Rate Limiting

**Priority:** 🟡 MEDIUM
**Introduced:** Story 1.9
**Target Resolution:** Before enabling Vercel auto-scaling

### What Is It?

API routes use in-memory rate limiting (Node.js `Map`). Works on single instance; breaks on multi-instance deployment.

### Why Deferred

- Vercel free tier = single instance
- Low traffic in beta phase
- Acceptable trade-off for MVP speed

### When to Address

- Enabling Vercel Pro (auto-scaling)
- Traffic exceeds 1,000 requests/hour
- Planning production launch at scale

### How to Fix

**Option 1: Upstash Redis** (recommended — 300k commands/month free)
```bash
npm install @upstash/redis
```
Replace `Map`-based rate limiter in `apps/web/src/lib/rate-limit.ts` with Redis-backed counter using `INCR` + `EXPIRE`.

**Option 2: Vercel KV** — native integration, 30k commands/month free.

**Estimated effort:** 2–3 hours

---

## 2. Test Suite Coverage Gaps

**Priority:** 🟢 LOW
**Introduced:** Epic 2+ stories
**Target Resolution:** 5–10 tests fixed per story

### What Is It?

New v3 features (session upload, Deepgram integration, Solis RAG, Stripe webhooks) need unit and integration tests. Current coverage is manual-test-only for several critical paths.

### Priority Areas

- Deepgram transcription API route — mock Deepgram client
- Solis Q&A API — mock Claude API + pgvector queries
- Stripe webhook handler — mock Stripe events
- Usage enforcement middleware — unit tests

### Approach

Add mocks in `apps/web/jest.setup.js` for:
- `@anthropic-ai/sdk` (Claude client)
- `deepgram-sdk` (Deepgram client)
- `stripe` (Stripe client)

**Estimated effort:** 1–2 hours per integration area

---

## 3. Action Items API — Shared Auth Helpers

**Priority:** 🟢 LOW
**Introduced:** Story 2.6
**Target Resolution:** When a third action-items route is needed

### What Is It?

`getSupabase()` and `getInternalUserId()` are duplicated verbatim in:
- `apps/web/src/app/api/action-items/route.ts`
- `apps/web/src/app/api/action-items/[id]/route.ts`

The same pattern also exists in `apps/web/src/app/api/clients/route.ts` and its `[id]` route.

### How to Fix

Extract to `apps/web/src/lib/helpers/apiHelpers.ts`:
```ts
export function getSupabase() { ... }
export async function getInternalUserId(clerkUserId: string) { ... }
```

**Estimated effort:** 30 minutes

---

## 4. Stale Client Route Tests

**Priority:** 🟢 LOW
**Introduced:** Story 4.4 (March 26, 2026)
**Target Resolution:** Before Epic 5

### What Is It?

2 tests in `apps/web/src/app/api/clients/__tests__/route.test.ts` fail with 400 (validation):
- `should return 409 for duplicate email`
- `should create client successfully`

Both send `email` field which is rejected by `ClientCreateSchema` (`.strict()` mode). These tests predate the v3 pivot that removed email from clients.

### How to Fix

Remove `email` from both test request bodies. Update the `409` test to test a real duplicate scenario (e.g. duplicate name) or delete it if duplicate detection was removed.

**Estimated effort:** 20 min

---

## 5. 4.4 Manual QA — Tests 2–6 Pending

**Priority:** 🟡 MEDIUM
**Introduced:** Story 4.4 (March 26, 2026)
**Target Resolution:** After Story 5.1 (Stripe) or when testing usage limits

### What Is It?

Story 4.4 was manually tested (Test 1 — client limit — ✅ passed). The remaining manual tests require Supabase row manipulation or features not yet built:

| # | Test | Blocker |
|---|------|---------|
| 2 | `usage_tracking` auto-created on first `/api/usage` call | Needs Supabase access |
| 3 | `GET /api/usage` returns correct JSON shape | Needs Supabase access |
| 4 | Transcript limit blocks at 5 (set `transcript_count = 5` in Supabase) | Needs Supabase access |
| 5 | `incrementTranscriptCount` fires after successful AI summary | Needs Supabase access |
| 6 | UpgradeModal CTAs work (pricing link + 404 expected for Stripe) | Story 5.1 not built |

### How to Test (when ready)

1. Open Supabase Studio → `usage_tracking` table
2. Find your `user_id` UUID from `users` table
3. For test 4: set `transcript_count = 5`, trigger summarize → expect 403
4. For test 5: reset to 0, trigger summarize → verify count becomes 1
5. For test 6: trigger any limit → verify modal renders with correct copy + CTA URLs

**Pro tier tests** (monthly reset, 25/month limit) — blocked until Story 5.1 sets a `pro` subscription row.

---

## 6. 7.6 Code-Only Verification Pending

**Priority:** 🟢 LOW
**Introduced:** Story 7.6 (June 20, 2026)
**Target Resolution:** During the 7.6 QA gate, or the next engineer/agent session with DB access

### What Is It?

Story 7.6 UI/UX was manually verified by the (non-coder) product owner and passed — Client Card client/coach split, completed accordion, dashboard summary card, navigation, and the session-detail carry-forward all render and behave correctly. The remaining checks need DB console or code-level access and are **not** doable from the UI, so they are parked here. None block the UI; they are confidence checks for the new infra.

Automated coverage already exists for the lib (`get-open-items.test.ts`), the parser (`summarize.test.ts`), the complete route (`route.test.ts`), and the carry-forward zero-state (`OpenCommitmentsSection.test.tsx`) — so the logic is unit-tested; what's pending is live-DB confirmation.

| # | Check | Blocker | How |
|---|-------|---------|-----|
| 1 | `action_items_assignee_check` allows `'unknown'`, rejects bogus values | Supabase SQL access | In Supabase Studio SQL editor: `INSERT ... assignee='unknown'` (ok) and `assignee='manager'` (must error). |
| 2 | `get_open_session_count(<uuid>)` returns ≥1 for an open carried item, `0` for a completed one | Supabase SQL access | `SELECT get_open_session_count('<action_item_id>');` against a real open item with later sessions. |
| 3 | **PROMPT GATE** — assignee `unknown` rate <30% across ≥10 real coach transcripts | No real Pro-coach transcripts yet | Same gate posture as 7.7 PROMPT-GATE-001. The coach/client split was confirmed working in the UI, so extraction populates; only the formal accuracy/unknown-rate sniff is deferred to first Pro-coach onboarding. |
| 4 | RLS/ownership — `PATCH /api/action-items/<id>/complete` for another user's item → 404; unauthenticated → 401 | Needs two accounts / API client | Covered conceptually by the route's ownership check + unit test; live cross-account confirmation deferred. |

### How to Address

Fold checks 1, 2, 4 into the BMad `@qa` gate for 7.6 (QA has code + DB access). Check 3 stays deferred to the first real Pro-coach onboarding (tracked identically to 7.7's prompt gate).

**Estimated effort:** 20 min (1–2 + 4 during QA); check 3 is event-triggered, not effort-bound.

### 6b. Manual UI re-test after DATA-001 fix (NON-CODER — you can do this)

**Why this exists:** During QA review a bug was found and fixed (the open-items query was malformed and returned nothing). The code fix + a regression test are merged, but a human should still click through once to confirm real items now appear. **Deferred by product owner 2026-06-20 — do after the current story push.** No code needed; just click around the running app.

**Steps (5 min):**
1. Pick a client who has **several past sessions** with **unchecked** action items.
2. Open one of that client's sessions → at the **top of the session page** look for the box **"Open Commitments from Past Sessions"**.
   - ✅ PASS = it lists unfinished items from the client's *other* sessions (not empty).
3. Go to that client's **Client Card** → the **"Open Action Items"** area.
   - ✅ PASS = items appear under **"Client's commitments"** and/or **"My commitments"** (not "None open" everywhere when you know items exist).
4. Tick a checkbox on an item → it fades out and stays gone after refresh.

**If anything shows empty when you KNOW open items exist** → note it and ping dev; the fix may need another look.
**If items appear** → 7.6 is fully confirmed; this item can be marked ✅ RESOLVED.

---

## Maintenance Guidelines

### When to Review
- Before each story planning
- Before production deploy (validate MEDIUM items)
- After user-reported bugs

### Adding New Debt

Use this template:

```markdown
## N. [Item Name]

**Priority:** [CRITICAL/HIGH/MEDIUM/LOW]
**Introduced:** Story X.Y (date)
**Target Resolution:** [Timeline/Trigger]

### What Is It?
### Why Deferred
### When to Address
### How to Fix
```

### Resolving Items

1. Update status to ✅ RESOLVED
2. Document approach, files changed, results
3. Move to `docs/archive/resolved-technical-debt.md`

---

**Next Review:** Before Story 3.1 planning
**Maintained By:** Development Team
