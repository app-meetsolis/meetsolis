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

  // Step 1: simple query on calendar_events (no nested joins — avoids FK issues)
  const { data: events, error } = await supabase
    .from('calendar_events')
    .select('id, user_id, client_id, meet_link, start_time')
    .gte('start_time', now.toISOString())
    .lte('start_time', windowEnd.toISOString())
    .not('client_id', 'is', null)
    .not('meet_link', 'is', null)
    .eq('bot_skipped', false)
    .is('bot_status', null);

  if (error) {
    console.error('[recall:dispatch] query error', error.message);
    return result;
  }

  console.log(
    `[recall:dispatch] window=${now.toISOString()}..${windowEnd.toISOString()} eligible_by_time=${events?.length ?? 0}`
  );

  if (!events || events.length === 0) return result;

  const userIds = Array.from(new Set(events.map(e => e.user_id as string)));

  // Step 2: Pro users only
  const { data: proSubs } = await supabase
    .from('subscriptions')
    .select('user_id')
    .in('user_id', userIds)
    .eq('plan', 'pro')
    .eq('status', 'active');
  const proUserIds = new Set((proSubs ?? []).map(s => s.user_id as string));

  // Step 3: auto_transcribe_enabled
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('user_id, auto_transcribe_enabled')
    .in('user_id', userIds);
  // Default to true if row missing
  const optedOutUserIds = new Set(
    (prefs ?? [])
      .filter(p => p.auto_transcribe_enabled === false)
      .map(p => p.user_id as string)
  );

  // Step 4: filter
  const eligible = events.filter(
    e =>
      proUserIds.has(e.user_id as string) &&
      !optedOutUserIds.has(e.user_id as string)
  );

  console.log(
    `[recall:dispatch] pro_users=${proUserIds.size} opted_out=${optedOutUserIds.size} eligible_after_filter=${eligible.length}`
  );

  if (eligible.length === 0) return result;

  // Idempotency guard — exclude events already in recall_sessions
  const eligibleIds = eligible.map(e => e.id);
  const { data: existing } = await supabase
    .from('recall_sessions')
    .select('calendar_event_id')
    .in('calendar_event_id', eligibleIds);
  const alreadyDispatched = new Set(
    (existing ?? []).map(r => r.calendar_event_id)
  );

  for (const evt of eligible) {
    if (alreadyDispatched.has(evt.id)) {
      result.skipped++;
      continue;
    }

    const userId = evt.user_id as string;

    const quota = await checkBotSessionLimit(userId);
    if (!quota.allowed) {
      await supabase
        .from('calendar_events')
        .update({ bot_status: 'quota_exceeded' })
        .eq('id', evt.id);
      result.quota_exceeded++;
      continue;
    }

    // Create recall_sessions row first (UNIQUE constraint prevents concurrent double-fire)
    const { error: insertError } = await supabase
      .from('recall_sessions')
      .insert({
        user_id: userId,
        client_id: evt.client_id as string,
        calendar_event_id: evt.id,
        status: 'pending',
      });

    if (insertError) {
      result.skipped++;
      continue;
    }

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
      console.log(`[recall:dispatch] dispatched event=${evt.id} bot=${bot.id}`);
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
