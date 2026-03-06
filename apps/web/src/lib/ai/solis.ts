import type { SessionContext } from './provider';

/**
 * Build hybrid RAG context: pgvector top-k + most recent sessions, deduped.
 * Week 3 Day 1: ships with recent-only fallback.
 * Week 3 Day 2: adds pgvector semantic results.
 */
export function buildSessionContext(
  allSessions: SessionContext[],
  semanticResults: SessionContext[] = [],
  maxTotal = 6
): SessionContext[] {
  const seen = new Set<string>();
  const context: SessionContext[] = [];

  // Add semantic results first (most relevant)
  for (const s of semanticResults) {
    if (!seen.has(s.id) && context.length < maxTotal) {
      seen.add(s.id);
      context.push(s);
    }
  }

  // Fill remaining slots with most recent sessions
  const sorted = [...allSessions].sort(
    (a, b) =>
      new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
  );

  for (const s of sorted) {
    if (!seen.has(s.id) && context.length < maxTotal) {
      seen.add(s.id);
      context.push(s);
    }
  }

  return context;
}
