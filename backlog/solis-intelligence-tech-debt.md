# Solis Intelligence — Technical Debt

**Source:** Story 4.3 post-implementation + manual QA (2026-03-28)
**Priority:** Medium — address before Epic 5 hardening
**Related backlog:** `solis-intelligence-qa-and-ui.md`

---

## TECH-SOLIS-001: Zero-Vector Embeddings (Semantic Search Disabled)

**Severity:** High (functional gap)

`ClaudeAIService.generateEmbedding()` returns an all-zero 1536-vector (placeholder for story 5.x Voyage AI integration). As a result, the hybrid session search RPC is never called — Solis falls back to recency-only session retrieval for all queries.

**Impact:** Answers rely on the 3 most recent sessions only, not semantic relevance. A question about a specific topic (e.g. "leadership") won't surface the most relevant session if it's not recent.

**Fix:** Wire Voyage AI (or OpenAI `text-embedding-3-small`) into `ClaudeAIService.generateEmbedding()`. Already stubbed — ticket for Epic 5.

---

## TECH-SOLIS-002: Prompt Testing Coverage

**Severity:** Medium

No automated tests verify end-to-end prompt quality or LLM response correctness. Unit tests mock the AI service, so prompt regressions are invisible until manual QA.

**Required:** Scenario-based integration tests (against real LLM or recorded responses) covering:
- Global roster questions (client count, last session, pending actions)
- Client-scoped questions (goal, commitments, progress)
- Cross-session synthesis ("what themes appear?")
- Edge cases: 0 sessions, 10+ action items, very long client goals

**Fix:** Add `tests/integration/solis/` suite. Use recorded LLM responses (`nock` or similar) to avoid flaky AI calls.

---

## TECH-SOLIS-003: Action Items Capped at 10

**Severity:** Low

`fetchClientProfile` limits pending action items to 10. Coaches with more than 10 outstanding items will get an incomplete picture.

**Fix:** Sort by `due_date ASC` (most urgent first) before applying the limit, so the most pressing items are always included.

---

## TECH-SOLIS-004: Session Count Missing from Global Roster

**Severity:** Low

The global client roster injected into the LLM shows `last_session_at` and pending action count but not total session count. Queries like "which client has the most sessions?" can't be answered accurately.

**Fix:** Add a `session_count` subquery in `fetchGlobalClientRoster`. Check query perf before adding — may need an index on `sessions(user_id, client_id)`.

---

## TECH-SOLIS-005: No Streaming — Single JSON Blob Response

**Severity:** Low (UX)

Solis returns the full answer as one JSON payload. For longer answers (multi-paragraph synthesis), the user sees a spinner for several seconds then a wall of text.

**Fix:** Implement streaming via `ReadableStream` in the route handler, emit answer tokens progressively. Defer to Epic 5.

---

## TECH-SOLIS-006: Solis UI Polish (see backlog)

**Severity:** Low (UX)

See `solis-intelligence-qa-and-ui.md` § UI Improvements for the full list. Key items:
- "New question" reset button
- Answer feedback (👍/👎) stored in `solis_queries`
- Query history panel
- Copy answer button
- Responsive Dialog overflow on mobile
