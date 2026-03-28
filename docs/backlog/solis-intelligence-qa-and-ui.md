# Solis Intelligence — Prompt QA & UI Improvements

**Source:** Post-implementation review (Story 4.3)
**Status:** Backlog — address before Epic 5 hardening
**Added:** 2026-03-28

---

## 1. Prompt Testing & Scenario QA

The Solis context pipeline now injects client roster (global) and client profile + action items (client-scoped) alongside session content. The following scenarios need real end-to-end verification with actual data:

### Global mode (`/intelligence`)
- [ ] "How many clients do I have?" → should return exact count from roster
- [ ] "Which client hasn't had a session in 30+ days?" → compare against `last_session_at`
- [ ] "What client has the most open action items?" → count from roster
- [ ] "What themes appear across all clients?" → requires sessions with summaries
- [ ] Query with no sessions at all → graceful answer from roster only, no citation hallucination
- [ ] Query that spans client + session data → e.g. "What is Sarah's goal and what did she work on last session?"

### Client-scoped mode (Dialog from `/clients/:id`)
- [ ] "What is [name]'s coaching goal?" → from client profile
- [ ] "What are [name]'s pending action items?" → from profile
- [ ] "What happened in the last session?" → from session context
- [ ] "What commitments did [name] make?" → requires session summaries
- [ ] "What progress has [name] made?" → cross-session synthesis
- [ ] Client with 0 sessions + 0 actions → should not hallucinate, answer from profile only

### Edge cases
- [ ] Very long client name or goal in profile — prompt injection safety
- [ ] Client with 10+ pending action items — only first 10 injected (by design), verify answer is still coherent
- [ ] Query limit at 74 (free) → query succeeds; at 75 → UpgradeModal opens
- [ ] Pro user with 2000 queries → no limit enforced

---

## 2. Technical Debt — Prompt & Context

- **Zero-vector embeddings:** `ClaudeAIService.generateEmbedding()` returns all-zero vector (story-5.x TODO). Semantic search is skipped entirely. When Voyage AI embeddings land, verify hybrid search actually improves answer quality over recency-only fallback.
- **Session count missing from roster:** Global roster shows last session date + pending actions but not total session count. Add `session_count` per client once we confirm query performance is acceptable.
- **Action items capped at 10:** `fetchClientProfile` limits to 10 pending items. If a client has more, Solis answers without the full picture. Consider smarter prioritisation (by due date).
- **No streaming:** Solis answers are returned as a single JSON blob. For longer answers, UX would benefit from streaming (`ReadableStream`). Defer to Epic 5.

---

## 3. UI Improvements Backlog

- [ ] **"New question" button** — after an answer renders, show a "Ask another question" button to clear result + chips and return to input state without closing/reopening Dialog
- [ ] **Answer feedback** (👍/👎) — thumbs up/down on each answer to collect quality signal, stored in `solis_queries`
- [ ] **Query history** — show last 3–5 queries in a collapsible section (from `solis_queries` table)
- [ ] **Copy answer button** — clipboard icon on the answer card
- [ ] **Citation date formatting** — currently ISO, could be more readable (e.g. "Jan 15, 2026 — Goal Setting Session")
- [ ] **Empty state illustration** — replace plain chips with a more inviting empty state (icon + prompt suggestions styled as cards)
- [ ] **Responsive Dialog height** — on mobile the Dialog can overflow; cap height + add scroll inside answer area
- [ ] **Keyboard shortcut** — `Cmd+K` or `Cmd+/` to open Solis from anywhere in the dashboard
