# Epic 4: Solis Intelligence

**Version:** 3.0
**Status:** Not Started
**Priority:** P0 (Critical — MVP Differentiator)
**Target Timeline:** Week 3 (March 15–21, 2026)
**Dependencies:** Epic 3 (Session Memory complete — sessions with summaries and embeddings)
**Last Updated:** March 8, 2026

---

## Epic Overview

Build Solis Intelligence: the AI Q&A system that lets coaches ask questions about any client's history across all sessions, powered by hybrid RAG (semantic search + recency).

**The core promise:** "What did Sarah say her biggest fear was?" → Solis finds the answer, cites the session, in under 5 seconds.

**This is MeetSolis's main differentiator.** Generic transcription tools transcribe individual meetings. Solis provides *longitudinal intelligence* across all sessions for all clients.

---

## Hybrid RAG Architecture

### Why Hybrid (not pure vector search)?

Pure vector search misses recent context. Pure recency misses relevant older sessions. The hybrid approach solves both:

1. **Semantic search (pgvector):** Finds the 3 most *relevant* sessions to the query, regardless of date.
2. **Recency (always-include):** Always includes the 3 *most recent* sessions, ensuring fresh context.
3. **Deduplication:** If a session appears in both lists, count it once. Max 6 sessions in context.

This gives Solis both topical depth (semantic) and temporal awareness (recency), with a bounded, predictable cost.

### Query Flow

```
User question (text)
  → Embed question (AI provider)
  → pgvector similarity search → top 3 semantically relevant sessions
  → Fetch 3 most recent sessions for this client (or cross-client if global query)
  → Deduplicate → max 6 sessions
  → Build context: client profile + session summaries + key topics
  → AI provider generates answer with citation references
  → Return: { answer, citations: [{session_id, session_date, title}] }
  → Store in solis_queries table
  → Increment usage_tracking.query_count
```

### Rollout Plan (2-day implementation)

- **Day 1:** Ship with context-only (last 5 sessions, no pgvector). Fast to ship, validates product.
- **Day 2:** Add pgvector layer. Hybrid approach improves answers for coaches with many sessions.

---

## Stories

### Story 4.1: Embeddings & Vector Index

**Status:** Not Started
**Priority:** P0
**Effort:** 0.5 days
**Dependencies:** Story 3.4 (AI summary generation — embedding generated during summarization)

**As a developer, I need session embeddings stored in pgvector so Solis can perform semantic search across a coach's session history.**

#### Acceptance Criteria

- [ ] `CREATE EXTENSION IF NOT EXISTS vector;` run in Supabase
- [ ] `sessions.embedding vector(1536)` column exists (in migration 015)
- [ ] `CREATE INDEX USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)` created
- [ ] `apps/web/src/lib/ai/embeddings.ts` implements `generateEmbedding(text: string): Promise<number[]>`
- [ ] Embedding auto-generated from `sessions.summary` text after AI summarization (Story 3.4)
- [ ] Embedding stored in `sessions.embedding` on session record
- [ ] Provider-agnostic: uses same `AI_PROVIDER` env var (Claude and OpenAI both support embeddings; placeholder returns zero vector)

#### Technical Notes

```typescript
// apps/web/src/lib/ai/embeddings.ts
export async function generateEmbedding(text: string): Promise<number[]> {
  const provider = getAIProvider()
  return provider.generateEmbedding(text)
}

// Claude: Use text-embedding-3-small via Anthropic (or voyageai)
// OpenAI: Use text-embedding-3-small ($0.02/1M tokens)
// Placeholder: return Array(1536).fill(0)
```

---

### Story 4.2: Solis Q&A API — Hybrid RAG

**Status:** Not Started
**Priority:** P0
**Effort:** 1.5 days
**Dependencies:** Story 4.1 (embeddings exist)

**As a coach, I want to ask questions about my client's history and get accurate, cited answers, so I can prepare for sessions in minutes instead of hours.**

#### API Specification

```
POST /api/intelligence/query
Authorization: Clerk JWT

Request body:
{
  query: string,         // "What are Sarah's biggest leadership challenges?"
  client_id?: string     // Optional — scopes to one client; null = cross-client
}

Response:
{
  answer: string,
  citations: [
    {
      session_id: string,
      session_date: string,    // "2026-02-15"
      title: string            // "Session 5 — Leadership Transition"
    }
  ]
}
```

#### Implementation

File: `apps/web/src/lib/ai/solis.ts`

```typescript
// Context builder
export async function buildSolisContext(
  query: string,
  userId: string,
  clientId?: string
): Promise<SessionContext[]>

// Hybrid approach:
// 1. Embed query
// 2. pgvector similarity search → top 3
// 3. Fetch 3 most recent sessions
// 4. Deduplicate, max 6 total
// 5. Return formatted context

// Response parser
export function parseSolisResponse(raw: string): SolisResponse
// Extracts: { answer, citations }
```

File: `apps/web/src/lib/ai/prompts.ts`

System prompt for Solis:
- "You are Solis, an AI assistant for executive coaches. Answer questions about coaching sessions accurately and concisely."
- "Only use information from the provided session context. If the answer isn't in the context, say 'I don't have enough session history to answer that.'"
- "Always cite which session(s) your answer comes from."
- "Use coaching vocabulary. Avoid clinical/therapeutic language."

#### Acceptance Criteria

- [ ] `POST /api/intelligence/query` works with and without `client_id`
- [ ] Hybrid RAG: pgvector top-3 + 3 most recent, deduplicated, max 6 sessions
- [ ] Response includes `answer` text and `citations` array
- [ ] Query and response stored in `solis_queries` table
- [ ] `usage_tracking.query_count` incremented on each query
- [ ] Free tier: 50 lifetime queries enforced (403 with upgrade prompt)
- [ ] Pro tier: 2,000/month queries enforced (403 with upgrade prompt)
- [ ] Response time: <5 seconds target
- [ ] Placeholder provider returns mock answer instantly (dev mode)
- [ ] "I don't know" response when context is insufficient (no hallucination)

---

### Story 4.3: Solis UI

**Status:** Not Started
**Priority:** P0
**Effort:** 1 day
**Dependencies:** Story 4.2

**As a coach, I want a simple interface to ask Solis questions about my clients, so I can get answers without navigating complex menus.**

#### Components

**`apps/web/src/components/solis/SolisPanel.tsx`**

Props:
- `clientId?: string` — if provided, scopes queries to this client
- `clientName?: string` — used in placeholder text

Features:
- Question input (text area, submit on Enter or button click)
- Suggested questions (chips/buttons):
  - "What are [name]'s biggest challenges?"
  - "What commitments did [name] make?"
  - "What progress has [name] made toward their goal?"
  - "What themes keep coming up for [name]?"
- Answer display (markdown rendered)
- Citations section: "Sources: [Session date — Title]" (each clickable, opens session)
- Loading state: "Solis is thinking..." with spinner
- Usage counter: "X of 50 lifetime queries used" (free) or "X of 2,000 monthly" (pro)
- Upgrade CTA when limit hit

**`apps/web/src/app/(dashboard)/intelligence/page.tsx`**

- Global Solis page (cross-client queries)
- Title: "Solis Intelligence"
- SolisPanel without clientId
- Suggested questions: "What client has the most open action items?", "Which clients haven't had a session in 30+ days?"

#### Acceptance Criteria

- [ ] SolisPanel renders on Client Detail page (client-scoped mode)
- [ ] Intelligence page renders SolisPanel (global mode)
- [ ] Suggested questions populate the input on click
- [ ] Answer displays with formatted text
- [ ] Citations shown with session date and title
- [ ] Usage counter displays correctly for free and pro tiers
- [ ] Upgrade modal shown when limit exceeded
- [ ] Loading state shown during query
- [ ] Mobile responsive

---

### Story 4.4: Usage Enforcement

**Status:** Not Started
**Priority:** P0
**Effort:** 0.5 days
**Dependencies:** Story 4.2 (Solis API), Story 3.4 (AI summarization)

**As the system, I need to enforce usage limits per tier so free users don't exceed their allocation and pro users get their monthly entitlement.**

#### Implementation

File: `apps/web/src/lib/billing/checkUsage.ts`

```typescript
export async function checkClientLimit(userId: string): Promise<void>
// Throws UpgradeRequiredError if free user has 1+ client already

export async function checkTranscriptLimit(userId: string): Promise<void>
// Free: throws if transcript_count >= 3 (no reset — lifetime)
// Pro: throws if transcript_count >= 25 since last transcript_reset_at

export async function checkQueryLimit(userId: string): Promise<void>
// Free: throws if query_count >= 50 (no reset — lifetime)
// Pro: throws if query_count >= 2000 since last query_reset_at

export async function incrementTranscriptCount(userId: string): Promise<void>
// Increments usage_tracking.transcript_count
// Pro: resets counter if transcript_reset_at is >30 days ago

export async function incrementQueryCount(userId: string): Promise<void>
// Increments usage_tracking.query_count
// Pro: resets counter if query_reset_at is >30 days ago
```

#### Usage Tracking Table (already in migration 015)

```sql
CREATE TABLE usage_tracking (
  user_id TEXT NOT NULL UNIQUE,

  transcript_count INT DEFAULT 0,
  transcript_reset_at TIMESTAMPTZ,  -- NULL = lifetime (free); set = last monthly reset (pro)

  query_count INT DEFAULT 0,
  query_reset_at TIMESTAMPTZ,       -- NULL = lifetime (free); set = last monthly reset (pro)

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Upgrade Modal Component

`apps/web/src/components/billing/UpgradeModal.tsx`

Shows when any limit is hit:
- Title: "You've reached your [free/limit] limit"
- Context: "Upgrade to Pro for unlimited clients, 25 AI sessions/month, and 2,000 Solis queries/month."
- CTA: "Upgrade to Pro — $99/month" → Stripe Checkout
- Secondary: "Learn more about Pro"

#### Acceptance Criteria

- [ ] Free user blocked at 1 client (upgrade modal on attempt)
- [ ] Free user blocked at 3 lifetime AI sessions (upgrade modal on attempt)
- [ ] Free user blocked at 50 lifetime Solis queries (upgrade modal on attempt)
- [ ] Pro user limited to 25 AI sessions/month (resets monthly)
- [ ] Pro user limited to 2,000 Solis queries/month (resets monthly)
- [ ] `usage_tracking` record auto-created on first action if not exists
- [ ] Pro monthly reset logic correct (30 days from last reset timestamp)
- [ ] Upgrade modal displays correctly with correct limit context

---

## Epic Success Criteria

- [ ] Solis answers questions accurately using session history
- [ ] Response time <5 seconds for typical query (6 sessions in context)
- [ ] Citations correctly identify source sessions
- [ ] Hybrid RAG: both semantic search and recency correctly applied
- [ ] Free/Pro limits enforced at API level
- [ ] Upgrade prompts display correctly
- [ ] No hallucination: Solis says "I don't know" when answer isn't in context
- [ ] Placeholder provider works for local development (zero API cost)

---

## Environment Variables

```
AI_PROVIDER=placeholder      # 'placeholder' | 'claude' | 'openai'
ANTHROPIC_API_KEY=           # Required if AI_PROVIDER=claude
OPENAI_API_KEY=              # Required if AI_PROVIDER=openai

BILLING_PROVIDER=placeholder # 'placeholder' | 'stripe'
STRIPE_SECRET_KEY=           # Required if BILLING_PROVIDER=stripe
```
