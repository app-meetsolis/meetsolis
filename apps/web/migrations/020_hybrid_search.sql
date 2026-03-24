-- Migration 020: Hybrid search — keyword index + hybrid_session_search RPC
-- Adds fts tsvector column (auto-computed) and hybrid semantic+keyword search function.

-- Helper: IMMUTABLE wrapper required because array_out (text[]::text) is only STABLE.
-- Declaring IMMUTABLE is safe for text[] — array_to_string on text[] is deterministic.
CREATE OR REPLACE FUNCTION immutable_arr_to_text(arr text[])
RETURNS text LANGUAGE sql IMMUTABLE STRICT AS $$
  SELECT array_to_string(arr, ' ')
$$;

-- 1. Keyword index (auto-generated from title + summary + key_topics)
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english'::regconfig,
      coalesce(title, '') || ' ' ||
      coalesce(summary, '') || ' ' ||
      coalesce(immutable_arr_to_text(key_topics), '')
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
