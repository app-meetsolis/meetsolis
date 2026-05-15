/**
 * DB state transitions for Recall.ai bot lifecycle (Story 6.2)
 * Called by the webhook handler — keeps all DB writes in one place.
 */

import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { RecallBotStatus } from '@meetsolis/shared';

type SupabaseClient = ReturnType<typeof getSupabaseServerClient>;

interface BotUpdate {
  status: RecallBotStatus;
  joined_at?: string;
  ended_at?: string;
  raw_recording_url?: string;
  recording_id?: string;
  error_reason?: string;
}

export async function updateRecallSession(
  recallBotId: string,
  update: BotUpdate,
  supabase: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabase
    .from('recall_sessions')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('recall_bot_id', recallBotId)
    .select('calendar_event_id, user_id')
    .single();

  if (error || !data) return null;

  // Mirror status to calendar_events for dashboard display
  await supabase
    .from('calendar_events')
    .update({ bot_status: update.status })
    .eq('id', data.calendar_event_id);

  return data.user_id as string;
}

export async function getRecallSessionByBotId(
  recallBotId: string,
  supabase: SupabaseClient
) {
  const { data } = await supabase
    .from('recall_sessions')
    .select('*')
    .eq('recall_bot_id', recallBotId)
    .maybeSingle();
  return data;
}
