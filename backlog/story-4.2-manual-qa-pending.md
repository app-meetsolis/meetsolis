# Story 4.2 — Pending Manual QA

**Story:** 4.2 Solis Q&A API — Hybrid RAG
**Status:** All deferred — run before Epic 5
**Added:** 2026-03-28

## Tests

1. **Scoped query** — POST `/api/intelligence/query` with `{ "query": "What are this client's goals?", "client_id": "<valid_uuid>" }` → expect `{ answer, citations: [{ session_id, session_date, title }] }`

2. **Global query** — same endpoint without `client_id` → searches across all clients, returns answer + citations

3. **Limit enforcement** — set `query_count = 75` in `usage_tracking` for a free user, then POST → expect 403 `{ error: { code: "LIMIT_EXCEEDED", type: "query" } }`

4. **Empty sessions** — query for a client with no completed sessions → expect answer containing "I don't have enough information"

5. **Bad input** — POST `{ "query": "hi" }` (under 3 chars) → expect 400 validation error

6. **DB row** — after a successful query, check `solis_queries` table in Supabase → row exists with `user_id`, `client_id`, `query`, `response`, `citations`
