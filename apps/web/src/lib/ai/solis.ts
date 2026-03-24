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
