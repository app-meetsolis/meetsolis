# Technical Debt Registry

**Last Updated:** March 10, 2026
**Project:** MeetSolis — AI Session Intelligence for Executive Coaches (v3)

> Items 1–4 from the original registry (TURN server, React.memo, WebRTC test mocks, in-memory rate limiting) were v1/v2 video conferencing tech debt and have been archived with the v2 pivot. See `docs/archive/` for historical context.

---

## Overview

| Item | Priority | Introduced | Target Resolution |
|------|----------|-----------|-------------------|
| [In-Memory Rate Limiting](#1-in-memory-rate-limiting) | 🟡 MEDIUM | Story 1.9 | Before multi-instance deploy |
| [Test Suite Coverage Gaps](#2-test-suite-coverage-gaps) | 🟢 LOW | Story 2.1+ | Continuous improvement |

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
