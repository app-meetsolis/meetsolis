import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import type { SolisCitation } from '@meetsolis/shared';
import { ServiceFactory } from '@/lib/service-factory';
import { buildSolisQueryPrompt } from './prompts';

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
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 1536) {
    throw new Error('Invalid query embedding');
  }

  if (queryText.length > 1000) {
    throw new Error('Query text too long');
  }

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
    throw new Error('Search failed');
  }

  return (data ?? []) as SessionSearchResult[];
}

// =============================================================================
// SOLIS Q&A FUNCTIONS (Story 4.2)
// =============================================================================

export async function fetchRecentSessions(
  userId: string,
  clientId?: string,
  limit = 3
): Promise<SessionSearchResult[]> {
  const supabase = getSupabase();
  let query = supabase
    .from('sessions')
    .select('id, title, session_date, summary, key_topics')
    .eq('user_id', userId)
    .eq('status', 'complete')
    .order('session_date', { ascending: false })
    .limit(limit);

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;
  if (error) throw new Error('Failed to fetch recent sessions');

  return (data ?? []).map(row => ({
    id: row.id,
    title: row.title,
    session_date: row.session_date,
    summary: row.summary ?? '',
    key_topics: row.key_topics ?? [],
    semantic_rank: 0,
    keyword_rank: 0,
  }));
}

export type SolisContext = {
  sessions: SessionSearchResult[];
  prompt: string;
};

export async function buildSolisContext(
  query: string,
  userId: string,
  clientId?: string
): Promise<SolisContext> {
  const aiService = ServiceFactory.createAIService();

  // Run embedding generation and recency fetch in parallel
  const [embedding, recentSessions] = await Promise.all([
    aiService.generateEmbedding(query),
    fetchRecentSessions(userId, clientId, 3),
  ]);

  const isZeroVector = embedding.every(v => v === 0);

  let semanticSessions: SessionSearchResult[] = [];
  if (!isZeroVector) {
    semanticSessions = await searchSessions(
      embedding,
      query,
      userId,
      clientId,
      3
    );
  }

  // Deduplicate by session ID, semantic results first, max 6
  const seen = new Set<string>();
  const merged: SessionSearchResult[] = [];
  for (const s of [...semanticSessions, ...recentSessions]) {
    if (!seen.has(s.id) && merged.length < 6) {
      seen.add(s.id);
      merged.push(s);
    }
  }

  return {
    sessions: merged,
    prompt: buildSolisQueryPrompt(query, merged),
  };
}

export type ParsedSolisResponse = {
  answer: string;
  citations: SolisCitation[];
};

export function parseSolisResponse(
  raw: string,
  sessions: SessionSearchResult[]
): ParsedSolisResponse {
  try {
    const parsed = JSON.parse(raw) as {
      answer?: string;
      cited_sessions?: string[];
    };
    const answer = parsed.answer ?? raw;
    const citedIds = Array.isArray(parsed.cited_sessions)
      ? parsed.cited_sessions
      : [];

    const sessionMap = new Map(sessions.map(s => [s.id, s]));
    const citations: SolisCitation[] = citedIds
      .filter(id => sessionMap.has(id))
      .map(id => {
        const s = sessionMap.get(id)!;
        return {
          session_id: s.id,
          session_date: s.session_date,
          title: s.title,
        };
      });

    return { answer, citations };
  } catch {
    return { answer: raw, citations: [] };
  }
}
