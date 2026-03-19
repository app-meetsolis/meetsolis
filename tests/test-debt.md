# Test Debt — Manual & Automated Tests Remaining

Tests that were identified but not yet executed or automated. Track here to avoid losing them.

---

## Story 3.3 — Auto-Transcription

### [MANUAL] Test 6 — Retry Smart Routing (error state)
**Priority:** Medium
**What to test:**
1. Manually set a session's `status='error'` in Supabase, ensure it has `transcript_audio_url` but no `transcript_text`
2. Click **Retry** on the card in the UI
3. Open browser Network tab — verify request hits `POST /api/sessions/[id]/transcribe` (not `/summarize`)
4. For a session that has `transcript_text` but no summary → Retry should hit `/api/sessions/[id]/summarize`

**Why deferred:** Requires manually corrupting DB state; low risk since logic is a simple conditional in `SessionTimeline.onRetry`

**File:** `apps/web/src/components/sessions/SessionTimeline.tsx` — `onRetry()`

---

### [AUTOMATED] Unit test — MockTranscriptionService
**Priority:** Low
**What to test:** `transcribe()` returns expected shape (`text`, `duration_seconds`, `confidence`) after ~100ms
**File to create:** `apps/web/tests/services/mock-transcription-service.test.ts`

---

### [AUTOMATED] Unit test — DeepgramTranscriptionService
**Priority:** Medium
**What to test:**
- Formats utterances as `Speaker A: text\nSpeaker B: text`
- Falls back to `.paragraphs.transcript` when no utterances
- Throws on non-ok response

**File to create:** `apps/web/tests/services/deepgram-transcription-service.test.ts`
**Note:** Mock `fetch` — no real API calls

---

### [AUTOMATED] Integration test — `runTranscribe()`
**Priority:** Medium
**What to test:**
- Returns `'skipped'` when `transcript_audio_url` is null
- Sets `status='processing'` before calling transcription service
- Updates `transcript_text` on success and chains `runSummarize()`
- Sets `status='error'` on transcription failure

**File to create:** `apps/web/tests/integration/sessions/transcribe-session.test.ts`

---

### [AUTOMATED] API route test — `POST /api/sessions/[id]/transcribe`
**Priority:** Medium
**What to test:**
- Returns 400 for invalid UUID
- Returns 401 when unauthenticated
- Returns 400 when session has no `transcript_audio_url`
- Returns 404 when session doesn't belong to user

**File to create:** `apps/web/tests/api/sessions/transcribe.test.ts`

---

### [AUTOMATED] API route test — `POST /api/sessions/upload-url`
**Priority:** Low
**What to test:**
- Returns 400 when `filename` or `contentType` missing
- Returns 401 when unauthenticated
- Returns `{ signedUrl, path, publicUrl }` on success

**File to create:** `apps/web/tests/api/sessions/upload-url.test.ts`

---

## General Backlog

### [MANUAL] Vercel timeout on long recordings
**Story:** 3.3
**Note:** `maxDuration=120` requires Vercel Pro. On free plan, transcription of >10s recordings will timeout. Test with a real Deepgram key + a 5-min recording on actual Vercel deployment to confirm.
**Blocked by:** Vercel Pro plan + `TRANSCRIPTION_PROVIDER=deepgram` + `DEEPGRAM_API_KEY`

---

*Last updated: 2026-03-19 — Story 3.3 implementation*
