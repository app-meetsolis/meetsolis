/**
 * Gathers all DB context needed to generate a Coach Brief (Story 6.4).
 */

import { createClient } from '@supabase/supabase-js';
import { differenceInWeeks } from 'date-fns';
import { config } from '@/lib/config/env';
import { ServiceFactory } from '@/lib/service-factory';
import { searchSessions } from '@/lib/ai/solis';
import type { BriefBreakthrough } from '@meetsolis/shared';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

/** Action item open statuses (DB enum: pending|in_progress|completed|cancelled). */
const OPEN_STATUSES = ['pending', 'in_progress'];

export interface BriefSessionData {
  id: string;
  date: string; // session_date 'YYYY-MM-DD'
  summary: string;
  keyTopics: string[];
}

export interface BriefContext {
  client: {
    id: string;
    name: string;
    goal: string;
    notes: string;
    coachNotes: string;
  };
  lastSession: BriefSessionData | null;
  lastSessionWeeksAgo: number;
  /** All non-cancelled action items from the last session (drives checkboxes). */
  lastSessionActionItems: { id: string; text: string; status: string }[];
  /** Open action items across the whole client (AI prep-note context). */
  openActionItems: { id: string; text: string }[];
  /** Last 3 complete sessions, newest first. */
  recentSessions: BriefSessionData[];
  breakthroughs: BriefBreakthrough[];
  isFirstSession: boolean;
}

export async function fetchBriefContext(
  userId: string,
  clientId: string
): Promise<BriefContext> {
  const supabase = getSupabase();

  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('id, name, goal, notes, coach_notes')
    .eq('id', clientId)
    .eq('user_id', userId)
    .single();
  if (clientErr || !client) {
    throw new Error('Client not found');
  }

  // Last 3 complete sessions, verbatim
  const { data: sessionRows } = await supabase
    .from('sessions')
    .select('id, session_date, summary, key_topics, created_at')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .eq('status', 'complete')
    .order('created_at', { ascending: false })
    .limit(3);

  const recentSessions: BriefSessionData[] = (sessionRows ?? []).map(r => ({
    id: r.id,
    date: r.session_date,
    summary: r.summary ?? '',
    keyTopics: r.key_topics ?? [],
  }));

  const lastSession = recentSessions[0] ?? null;
  const isFirstSession = recentSessions.length === 0;

  // Last-session action items (all statuses except cancelled)
  let lastSessionActionItems: { id: string; text: string; status: string }[] =
    [];
  if (lastSession) {
    const { data: laItems } = await supabase
      .from('action_items')
      .select('id, description, status')
      .eq('session_id', lastSession.id)
      .neq('status', 'cancelled');
    lastSessionActionItems = (laItems ?? []).map(a => ({
      id: a.id as string,
      text: a.description as string,
      status: a.status as string,
    }));
  }

  // Open action items across the client (AI context)
  const { data: openItems } = await supabase
    .from('action_items')
    .select('id, description')
    .eq('client_id', clientId)
    .eq('user_id', userId)
    .in('status', OPEN_STATUSES);
  const openActionItems = (openItems ?? []).map(a => ({
    id: a.id as string,
    text: a.description as string,
  }));

  const lastSessionWeeksAgo = lastSession
    ? Math.max(0, differenceInWeeks(new Date(), new Date(lastSession.date)))
    : 0;

  // Top breakthroughs via hybrid retrieval — degrade gracefully on failure
  let breakthroughs: BriefBreakthrough[] = [];
  if (!isFirstSession) {
    try {
      const aiService = ServiceFactory.createAIService();
      const query = 'breakthrough insight realization';
      const embedding = await aiService.generateEmbedding(query);
      const results = await searchSessions(
        embedding,
        query,
        userId,
        clientId,
        3
      );
      breakthroughs = results
        .filter(s => s.summary)
        .map(s => ({
          session_id: s.id,
          date: s.session_date,
          summary: s.summary,
        }));
    } catch (err) {
      console.error('[brief:context] breakthrough search failed:', err);
      breakthroughs = [];
    }
  }

  return {
    client: {
      id: client.id as string,
      name: client.name as string,
      goal: (client.goal as string) ?? '',
      notes: (client.notes as string) ?? '',
      coachNotes: (client.coach_notes as string) ?? '',
    },
    lastSession,
    lastSessionWeeksAgo,
    lastSessionActionItems,
    openActionItems,
    recentSessions,
    breakthroughs,
    isFirstSession,
  };
}
