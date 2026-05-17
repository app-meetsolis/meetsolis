/**
 * Lazy-create the sessions row for a bot-recorded meeting (Story 6.2b).
 *
 * Called on the first transcript.data event OR bot.in_call_recording,
 * whichever fires first. Idempotent via ON CONFLICT (recall_session_id):
 * concurrent callers both upsert, both then read back the single row.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  isPlaceholderTitle,
  DEFAULT_SESSION_TITLE,
} from '@/lib/sessions/session-title';

interface CalEventLite {
  title?: string;
  start_time?: string;
}

export async function ensureSessionRow(
  recallSessionId: string,
  supabase: SupabaseClient
): Promise<string | null> {
  // Fast path — row already exists
  const { data: existing } = await supabase
    .from('sessions')
    .select('id')
    .eq('recall_session_id', recallSessionId)
    .maybeSingle();
  if (existing) return existing.id as string;

  // Load recall_session + linked calendar event (for title + date)
  const { data: rs, error } = await supabase
    .from('recall_sessions')
    .select('user_id, client_id, calendar_events ( title, start_time )')
    .eq('id', recallSessionId)
    .maybeSingle();

  if (error || !rs) {
    console.warn(
      `[recall:ensure-session] recall_session not found: ${recallSessionId}`
    );
    return null;
  }

  // Joined record is object or array depending on FK config
  const rawCal = (rs as { calendar_events?: unknown }).calendar_events;
  const cal: CalEventLite = Array.isArray(rawCal)
    ? ((rawCal[0] as CalEventLite) ?? {})
    : ((rawCal as CalEventLite | null) ?? {});

  const calTitle = cal.title?.trim();
  const title =
    calTitle && !isPlaceholderTitle(calTitle)
      ? calTitle
      : DEFAULT_SESSION_TITLE;
  const sessionDate = cal.start_time
    ? cal.start_time.split('T')[0]
    : new Date().toISOString().split('T')[0];

  await supabase.from('sessions').upsert(
    {
      user_id: rs.user_id,
      client_id: rs.client_id,
      recall_session_id: recallSessionId,
      title,
      session_date: sessionDate,
      status: 'pending',
      transcript_streaming_started_at: new Date().toISOString(),
    },
    { onConflict: 'recall_session_id', ignoreDuplicates: true }
  );

  const { data: created } = await supabase
    .from('sessions')
    .select('id')
    .eq('recall_session_id', recallSessionId)
    .maybeSingle();

  return (created?.id as string) ?? null;
}
