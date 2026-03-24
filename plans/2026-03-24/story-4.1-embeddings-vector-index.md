# Story 4.1 Implementation Plan: Embeddings & Vector Index

## Context

Story 4.1 builds the search infrastructure that Story 4.2 (Solis Q&A) depends on.
~80% of the original AC was already completed in Story 3.4 (DB schema, provider implementations,
embedding stored after summarization). What remains is: a thin facade, one migration (keyword
index + hybrid RPC), a search function, and tests.

Hybrid RAG chosen over pure semantic: coaching queries are either intent-based ("prepare me for
next session") or exact-term ("what did John say about his CFO?"). Neither semantic nor keyword
alone covers both. Hybrid merges both via RRF at the SQL layer — no new services, no new cost.

---

## Files to Create

| # | File | Lines est. |
|---|------|------------|
| 1 | `apps/web/src/lib/ai/embeddings.ts` | ~5 |
| 2 | `apps/web/migrations/020_hybrid_search.sql` | ~65 |
| 3 | `apps/web/src/lib/ai/solis.ts` | ~50 |
| 4 | `apps/web/src/lib/ai/__tests__/embeddings.test.ts` | ~35 |
| 5 | `apps/web/src/lib/ai/__tests__/solis.test.ts` | ~120 |

No existing files modified.

---

## Implementation

### File 1 — `apps/web/src/lib/ai/embeddings.ts`

Thin facade. No logic, no validation. Callers already own the text.

```typescript
import { ServiceFactory } from '@/lib/service-factory';

export async function generateEmbedding(text: string): Promise<number[]> {
  return ServiceFactory.createAIService().generateEmbedding(text);
}
```

Pattern reference: `summarize-session.ts:49` — same `ServiceFactory.createAIService()` call.

---

### File 2 — `apps/web/migrations/020_hybrid_search.sql`

```sql
-- Migration 020: Hybrid search — keyword index + hybrid_session_search RPC
-- Adds fts tsvector column (auto-computed) and hybrid semantic+keyword search function.

-- 1. Keyword index (auto-generated from title + summary + key_topics)
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(summary, '') || ' ' ||
      coalesce(array_to_string(key_topics, ' '), '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_sessions_fts ON sessions USING GIN(fts);

-- 2. Hybrid search RPC (semantic cosine + keyword tsvector, merged via RRF)
--    Falls back to semantic-only when p_query_text is blank.
--    Only searches sessions with status = 'complete' (have summary + embedding).
CREATE OR REPLACE FUNCTION hybrid_session_search(
  p_user_id         uuid,
  p_client_id       uuid,
  p_query_text      text,
  p_query_embedding vector(1536),
  p_match_count     int DEFAULT 3
)
RETURNS TABLE (
  id             uuid,
  title          text,
  session_date   date,
  summary        text,
  key_topics     text[],
  semantic_rank  float,
  keyword_rank   float
)
LANGUAGE sql STABLE
AS $$
  WITH semantic AS (
    SELECT id,
      ROW_NUMBER() OVER (ORDER BY embedding <=> p_query_embedding) AS rank
    FROM sessions
    WHERE user_id = p_user_id
      AND client_id = p_client_id
      AND status = 'complete'
      AND embedding IS NOT NULL
    LIMIT 20
  ),
  keyword AS (
    -- Guard: p_query_text <> '' prevents websearch_to_tsquery('') error.
    -- When blank, this CTE returns 0 rows → FULL OUTER JOIN gives semantic-only.
    SELECT id,
      ROW_NUMBER() OVER (
        ORDER BY ts_rank(fts, websearch_to_tsquery('english', p_query_text)) DESC
      ) AS rank
    FROM sessions
    WHERE user_id = p_user_id
      AND client_id = p_client_id
      AND status = 'complete'
      AND p_query_text <> ''
      AND fts @@ websearch_to_tsquery('english', p_query_text)
    LIMIT 20
  ),
  rrf AS (
    SELECT
      COALESCE(s.id, k.id) AS id,
      COALESCE(1.0 / (60 + s.rank), 0) +
      COALESCE(1.0 / (60 + k.rank), 0) AS rrf_score
    FROM semantic s
    FULL OUTER JOIN keyword k ON s.id = k.id
    ORDER BY rrf_score DESC
    LIMIT p_match_count
  )
  SELECT
    sess.id, sess.title, sess.session_date, sess.summary, sess.key_topics,
    COALESCE(1.0 / (60 + sem.rank), 0) AS semantic_rank,
    COALESCE(1.0 / (60 + kw.rank), 0)  AS keyword_rank
  FROM rrf
  JOIN sessions sess ON sess.id = rrf.id
  LEFT JOIN semantic sem ON sem.id = rrf.id
  LEFT JOIN keyword  kw  ON kw.id  = rrf.id
  ORDER BY rrf.rrf_score DESC;
$$;

GRANT EXECUTE ON FUNCTION hybrid_session_search TO authenticated, service_role;
```

Security notes:
- `p_query_text` is a parameterized RPC param — Supabase JS never concatenates it into SQL
- `websearch_to_tsquery` sanitizes input natively (safe from tsquery injection)
- `p_user_id` scopes all results to the calling user — enforced at SQL level
- `LANGUAGE sql STABLE` not `SECURITY DEFINER` — runs as caller (service_role), not function owner

---

### File 3 — `apps/web/src/lib/ai/solis.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';

// Local type — move to @meetsolis/shared when Story 4.2 imports it
export type SessionSearchResult = {
  id: string;
  title: string;
  session_date: string; // ISO date string 'YYYY-MM-DD' from Postgres
  summary: string;
  key_topics: string[];
  semantic_rank: number;
  keyword_rank: number;
};

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

export async function searchSessions(
  queryEmbedding: number[],
  queryText: string,
  userId: string,
  clientId?: string,
  limit?: number
): Promise<SessionSearchResult[]> {
  // Validate embedding: must be exactly 1536 numbers
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 1536) {
    throw new Error('Invalid query embedding');
  }

  // Cap query text length — prevents oversized inputs
  if (queryText.length > 1000) {
    throw new Error('Query text too long');
  }

  // Clamp limit: min 1, max 10
  const safeLimit = Math.min(Math.max(limit ?? 3, 1), 10);

  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('hybrid_session_search', {
    p_user_id: userId,
    p_client_id: clientId ?? null,
    p_query_text: queryText,
    p_query_embedding: queryEmbedding,
    p_match_count: safeLimit,
  });

  if (error) {
    // Do not expose internal DB error details to callers
    throw new Error('Search failed');
  }

  return (data ?? []) as SessionSearchResult[];
}
```

Security decisions:
- `queryEmbedding` length validated — malformed vectors rejected before DB call
- `queryText` capped at 1000 chars — prevents oversized tsquery parsing
- `limit` clamped 1–10 — prevents unlimited result abuse
- Error from Supabase swallowed, generic message thrown — no internal detail leakage
- `clientId ?? null`: SQL `WHERE client_id = NULL` returns no rows (safe)
- Service role key used — server-side only, never exposed to client

Pattern reference: `summarize-session.ts:11-13` for `getSupabase()`.

---

### File 4 — `apps/web/src/lib/ai/__tests__/embeddings.test.ts`

Note: `tests/setup.ts` already sets `process.env` Supabase vars globally — no config mock needed.

```typescript
import { generateEmbedding } from '../embeddings';
import { ServiceFactory } from '@/lib/service-factory';

jest.mock('@/lib/service-factory');

const mockGenerateEmbedding = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (ServiceFactory.createAIService as jest.Mock).mockReturnValue({
    generateEmbedding: mockGenerateEmbedding,
  });
});

afterEach(() => {
  ServiceFactory.clearAllServices();
});

describe('generateEmbedding', () => {
  it('delegates to AIService.generateEmbedding', async () => {
    const fakeEmbedding = Array(1536).fill(0.1);
    mockGenerateEmbedding.mockResolvedValue(fakeEmbedding);

    const result = await generateEmbedding('test input');

    expect(ServiceFactory.createAIService).toHaveBeenCalledTimes(1);
    expect(mockGenerateEmbedding).toHaveBeenCalledWith('test input');
    expect(result).toEqual(fakeEmbedding);
  });

  it('propagates errors from AIService', async () => {
    mockGenerateEmbedding.mockRejectedValue(new Error('AI unavailable'));

    await expect(generateEmbedding('test')).rejects.toThrow('AI unavailable');
  });
});
```

---

### File 5 — `apps/web/src/lib/ai/__tests__/solis.test.ts`

Note: `tests/setup.ts` sets Supabase env vars — `config` works without mocking.
Only `@supabase/supabase-js` needs mocking to avoid real DB calls.

```typescript
import { createClient } from '@supabase/supabase-js';
import { searchSessions } from '../solis';

jest.mock('@supabase/supabase-js');

const mockRpc = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (createClient as jest.Mock).mockReturnValue({ rpc: mockRpc });
});

const validEmbedding = Array(1536).fill(0.1);

const fakeResults = [
  {
    id: 'sess-uuid-1',
    title: 'Goal Setting',
    session_date: '2026-01-10',
    summary: 'Client set Q1 goals.',
    key_topics: ['goals', 'Q1'],
    semantic_rank: 0.016,
    keyword_rank: 0,
  },
];

describe('searchSessions', () => {
  describe('happy path', () => {
    it('calls RPC with correct params', async () => {
      mockRpc.mockResolvedValue({ data: fakeResults, error: null });

      const result = await searchSessions(
        validEmbedding, 'Q1 goals', 'user-uuid', 'client-uuid', 3
      );

      expect(mockRpc).toHaveBeenCalledWith('hybrid_session_search', {
        p_user_id: 'user-uuid',
        p_client_id: 'client-uuid',
        p_query_text: 'Q1 goals',
        p_query_embedding: validEmbedding,
        p_match_count: 3,
      });
      expect(result).toEqual(fakeResults);
    });

    it('passes null p_client_id when clientId omitted', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });
      await searchSessions(validEmbedding, 'goals', 'user-uuid');
      expect(mockRpc).toHaveBeenCalledWith(
        'hybrid_session_search',
        expect.objectContaining({ p_client_id: null })
      );
    });

    it('uses default limit of 3', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });
      await searchSessions(validEmbedding, 'goals', 'user-uuid', 'client-uuid');
      expect(mockRpc).toHaveBeenCalledWith(
        'hybrid_session_search',
        expect.objectContaining({ p_match_count: 3 })
      );
    });

    it('returns [] when RPC returns null data', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });
      const result = await searchSessions(validEmbedding, '', 'user-uuid', 'client-uuid');
      expect(result).toEqual([]);
    });

    it('passes empty queryText through (semantic-only fallback)', async () => {
      mockRpc.mockResolvedValue({ data: fakeResults, error: null });
      await searchSessions(validEmbedding, '', 'user-uuid', 'client-uuid');
      expect(mockRpc).toHaveBeenCalledWith(
        'hybrid_session_search',
        expect.objectContaining({ p_query_text: '' })
      );
    });
  });

  describe('limit clamping', () => {
    it('caps limit at 10', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });
      await searchSessions(validEmbedding, 'goals', 'user-uuid', 'client-uuid', 99);
      expect(mockRpc).toHaveBeenCalledWith(
        'hybrid_session_search',
        expect.objectContaining({ p_match_count: 10 })
      );
    });

    it('enforces minimum limit of 1', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });
      await searchSessions(validEmbedding, 'goals', 'user-uuid', 'client-uuid', 0);
      expect(mockRpc).toHaveBeenCalledWith(
        'hybrid_session_search',
        expect.objectContaining({ p_match_count: 1 })
      );
    });
  });

  describe('security validations', () => {
    it('throws on wrong embedding dimensions — RPC never called', async () => {
      await expect(
        searchSessions(Array(512).fill(0.1), 'goals', 'user-uuid', 'client-uuid')
      ).rejects.toThrow('Invalid query embedding');
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it('throws on non-array embedding', async () => {
      await expect(
        searchSessions('not-array' as unknown as number[], 'goals', 'user-uuid')
      ).rejects.toThrow('Invalid query embedding');
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it('throws on queryText > 1000 chars — RPC never called', async () => {
      await expect(
        searchSessions(validEmbedding, 'a'.repeat(1001), 'user-uuid', 'client-uuid')
      ).rejects.toThrow('Query text too long');
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it('throws generic "Search failed" — no internal detail leaked', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: 'connection refused', code: '08006' },
      });
      await expect(
        searchSessions(validEmbedding, 'goals', 'user-uuid', 'client-uuid')
      ).rejects.toThrow('Search failed');
    });
  });
});
```

---

## Implementation Order

1. `020_hybrid_search.sql` — SQL only, no TS dependencies
2. `embeddings.ts` — 5 lines
3. `solis.ts` — depends on config + supabase only
4. `embeddings.test.ts`
5. `solis.test.ts`

---

## Critical Files (reference during implementation)

| File | Why |
|------|-----|
| `apps/web/src/lib/sessions/summarize-session.ts` | `getSupabase()` pattern to copy exactly |
| `apps/web/src/lib/ai/__tests__/summarize.test.ts` | Test structure/style to match |
| `apps/web/tests/setup.ts` | Confirms Supabase env vars set — no config mock needed in solis.test |
| `apps/web/src/lib/service-factory.ts` | Confirms `clearAllServices()` for test teardown |
| `apps/web/migrations/015_v3_schema.sql` | Confirms sessions schema the RPC depends on |

---

## Verification

```bash
# Run new tests only
cd apps/web && npm test -- --testPathPattern="src/lib/ai/__tests__"

# Full regression
cd apps/web && npm test

# Type check
cd apps/web && npm run type-check

# Build
cd apps/web && npm run build
```

Manual step after: run `020_hybrid_search.sql` in Supabase SQL Editor.
Verify: Table Editor → sessions → columns shows `fts tsvector`.
Verify: SQL Editor — `SELECT * FROM hybrid_session_search(...)` returns rows or empty array (not error).
