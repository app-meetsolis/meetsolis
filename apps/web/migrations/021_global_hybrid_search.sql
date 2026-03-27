-- Migration 021: Make client_id optional in hybrid_session_search for global cross-client queries (Story 4.2)

CREATE OR REPLACE FUNCTION hybrid_session_search(
  p_user_id         uuid,
  p_client_id       uuid DEFAULT NULL,
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
      AND (p_client_id IS NULL OR client_id = p_client_id)
      AND status = 'complete'
      AND embedding IS NOT NULL
    LIMIT 20
  ),
  keyword AS (
    SELECT id,
      ROW_NUMBER() OVER (
        ORDER BY ts_rank(fts, websearch_to_tsquery('english', p_query_text)) DESC
      ) AS rank
    FROM sessions
    WHERE user_id = p_user_id
      AND (p_client_id IS NULL OR client_id = p_client_id)
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
