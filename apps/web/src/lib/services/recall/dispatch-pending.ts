/**
 * Recall.ai bot dispatch logic (Story 6.2)
 * Called by POST /api/recall/dispatch-pending (cron, every 2 min).
 *
 * Eligibility window: start_time BETWEEN now() AND now() + 5 min
 * Guards: Pro, auto_transcribe_enabled, meet_link present, not skipped, no existing session
 */

import { getSupabaseServerClient } from '@/lib/supabase/server';
import { createRecallBot } from './recall-client';
import { checkBotSessionLimit } from '@/lib/billing/checkUsage';
import { config } from '@/lib/config/env';

export interface DispatchResult {
  dispatched: number;
  quota_exceeded: number;
  skipped: number;
  errors: number;
}

export async function dispatchPendingBots(): Promise<DispatchResult> {
  const supabase = getSupabaseServerClient();
  const result: DispatchResult = {
    dispatched: 0,
    quota_exceeded: 0,
    skipped: 0,
    errors: 0,
  };

  const now = new Date();
  const windowEnd = new Date(now.getTime() + 5 * 60 * 1000);

  // Fetch eligible calendar events with user + preferences join
  const { data: events, error } = await supabase
    .from('calendar_events')
    .select(
      `
      id,
      user_id,
      client_id,
      meet_link,
      start_time,
      users!inner(id),
      subscriptions!inner(plan),
      user_preferences!inner(auto_transcribe_enabled)
    `
    )
    .gte('start_time', now.toISOString())
    .lte('start_time', windowEnd.toISOString())
    .not('client_id', 'is', null)
    .not('meet_link', 'is', null)
    .eq('bot_skipped', false)
    .is('bot_status', null)
    .eq('subscriptions.plan', 'pro')
    .eq('user_preferences.auto_transcribe_enabled', true);

  if (error) {
    console.error('[recall:dispatch] query error', error.message);
    return result;
  }

  if (!events || events.length === 0) return result;

  // Filter out events that already have a recall_session (idempotency guard)
  const eventIds = events.map(e => e.id);
  const { data: existing } = await supabase
    .from('recall_sessions')
    .select('calendar_event_id')
    .in('calendar_event_id', eventIds);

  const alreadyDispatched = new Set(
    (existing ?? []).map(r => r.calendar_event_id)
  );

  for (const evt of events) {
    if (alreadyDispatched.has(evt.id)) {
      result.skipped++;
      continue;
    }

    const userId = evt.user_id as string;

    // Quota check
    const quota = await checkBotSessionLimit(userId);
    if (!quota.allowed) {
      await supabase
        .from('calendar_events')
        .update({ bot_status: 'quota_exceeded' })
        .eq('id', evt.id);
      result.quota_exceeded++;
      continue;
    }

    // Create recall_sessions row first (prevents double-fire via UNIQUE constraint)
    const { error: insertError } = await supabase
      .from('recall_sessions')
      .insert({
        user_id: userId,
        client_id: evt.client_id as string,
        calendar_event_id: evt.id,
        status: 'pending',
      });

    // Unique constraint violation = already dispatched in a concurrent run
    if (insertError) {
      result.skipped++;
      continue;
    }

    // Call Recall.ai API
    try {
      const bot = await createRecallBot({
        meeting_url: evt.meet_link as string,
        bot_name: config.recall.botName,
        webhook_url: `${config.app.url}/api/recall/webhook`,
        recording_mode: 'speaker_view',
        real_time_transcription: { destination_url: null },
      });

      await supabase
        .from('recall_sessions')
        .update({ recall_bot_id: bot.id, updated_at: new Date().toISOString() })
        .eq('calendar_event_id', evt.id);

      await supabase
        .from('calendar_events')
        .update({ bot_status: 'pending' })
        .eq('id', evt.id);

      result.dispatched++;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.error(
        `[recall:dispatch] bot creation failed for event ${evt.id}:`,
        reason
      );

      await supabase
        .from('recall_sessions')
        .update({
          status: 'error',
          error_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('calendar_event_id', evt.id);

      await supabase
        .from('calendar_events')
        .update({ bot_status: 'error' })
        .eq('id', evt.id);

      result.errors++;
    }
  }

  return result;
}
