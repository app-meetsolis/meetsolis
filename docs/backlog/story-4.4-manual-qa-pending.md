# Story 4.4 — Pending Manual QA

**Story:** 4.4 Usage Enforcement
**Status:** Test 1 ✅ — Tests 2–6 deferred
**Added:** 2026-03-26
**See also:** `docs/TECHNICAL_DEBT.md#5-44-manual-qa-tests-26-pending`

---

## ✅ Completed

- **Test 1** — Client limit enforced (free tier blocks 4th client, UpgradeModal shown)

---

## ⏳ Pending

### Test 2 — `usage_tracking` auto-created
- Delete your row from `usage_tracking` in Supabase
- Call `GET /api/usage` while logged in
- **Expect:** row created with all counts = 0

### Test 3 — `GET /api/usage` response shape
- Call `GET /api/usage` while logged in
- **Expect JSON:**
  ```json
  {
    "tier": "free",
    "transcript_count": 0,
    "transcript_limit": 5,
    "query_count": 0,
    "query_limit": 75,
    "client_count": N,
    "client_limit": 3,
    "resets_at": null
  }
  ```

### Test 4 — Transcript limit blocks at 5
- In Supabase: set `usage_tracking.transcript_count = 5` for your user
- Trigger AI summary on any session
- **Expect:** 403 with `{ code: 'LIMIT_EXCEEDED', type: 'transcript' }` + UpgradeModal shown

### Test 5 — `incrementTranscriptCount` fires on success
- In Supabase: reset `transcript_count = 0`
- Trigger a successful AI summary
- **Expect:** `transcript_count = 1` in Supabase after

### Test 6 — UpgradeModal CTAs (requires Test 4 or 1 to trigger modal)
- "See all Pro features" → navigates to `/pricing`
- "Upgrade to Pro — $99/month" → navigates to `/api/stripe/checkout?plan=monthly` (404 until Story 5.1)

---

## Blocked (needs Story 5.1 — Stripe)

- Pro tier: 25 AI sessions/month enforced
- Pro tier: monthly reset when `transcript_reset_at` > 30 days ago
- Pro tier: 2,000 queries/month enforced
- UpgradeModal Stripe CTA returns 200 (not 404)
