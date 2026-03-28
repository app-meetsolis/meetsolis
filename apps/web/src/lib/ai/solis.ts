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

// =============================================================================
// CLIENT CONTEXT HELPERS
// =============================================================================

async function fetchGlobalClientRoster(userId: string): Promise<string> {
  const supabase = getSupabase();

  const [{ data: clients }, { data: actionItems }] = await Promise.all([
    supabase
      .from('clients')
      .select('id, name, last_session_at')
      .eq('user_id', userId)
      .order('name'),
    supabase
      .from('action_items')
      .select('client_id')
      .eq('user_id', userId)
      .eq('status', 'pending'),
  ]);

  if (!clients?.length) return '';

  const pendingByClient = new Map<string, number>();
  for (const item of actionItems ?? []) {
    pendingByClient.set(
      item.client_id,
      (pendingByClient.get(item.client_id) ?? 0) + 1
    );
  }

  const lines = clients.map(c => {
    const last = c.last_session_at
      ? new Date(c.last_session_at).toISOString().split('T')[0]
      : 'no sessions yet';
    const pending = pendingByClient.get(c.id) ?? 0;
    return `- ${c.name} (last session: ${last}, ${pending} pending action${pending !== 1 ? 's' : ''})`;
  });

  return `CLIENT ROSTER (${clients.length} total):\n${lines.join('\n')}`;
}

async function fetchClientProfile(
  userId: string,
  clientId: string
): Promise<string> {
  const supabase = getSupabase();

  const [{ data: client }, { data: actions }] = await Promise.all([
    supabase
      .from('clients')
      .select('name, company, role, goal, start_date')
      .eq('id', clientId)
      .eq('user_id', userId)
      .single(),
    supabase
      .from('action_items')
      .select('description, due_date')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .limit(10),
  ]);

  if (!client) return '';

  const lines: string[] = ['CLIENT PROFILE:'];
  lines.push(`Name: ${client.name}`);
  if (client.company) lines.push(`Company: ${client.company}`);
  if (client.role) lines.push(`Role: ${client.role}`);
  if (client.goal) lines.push(`Coaching goal: ${client.goal}`);
  if (client.start_date) lines.push(`Coaching since: ${client.start_date}`);

  if (actions?.length) {
    lines.push(`Pending action items (${actions.length}):`);
    for (const a of actions) {
      const due = a.due_date ? ` (due: ${a.due_date})` : '';
      lines.push(`  - ${a.description}${due}`);
    }
  }

  return lines.join('\n');
}

export async function buildSolisContext(
  query: string,
  userId: string,
  clientId?: string
): Promise<SolisContext> {
  const aiService = ServiceFactory.createAIService();

  // Fetch embedding, recent sessions, and client context in parallel
  const [embedding, recentSessions, clientMeta] = await Promise.all([
    aiService.generateEmbedding(query),
    fetchRecentSessions(userId, clientId, 3),
    clientId
      ? fetchClientProfile(userId, clientId)
      : fetchGlobalClientRoster(userId),
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
    prompt: buildSolisQueryPrompt(query, merged, clientMeta),
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
