/**
 * Coach Brief cron logic (Story 6.4).
 * Called by POST /api/brief/generate-pending every 5 min.
 *
 * Eligibility:
 *  - calendar_events starting within the user's coach_brief_window_minutes
 *  - matched to a client (client_id NOT NULL)
 *  - user is Pro (subscriptions.plan = 'pro', status = 'active')
 *  - no existing coach_briefs row for the event (idempotent)
 */

import { getSupabaseServerClient } from '@/lib/supabase/server';
import { generateBrief } from './generate-brief';

export interface GeneratePendingResult {
  eligible: number;
  generated: number;
  skipped: number;
  errors: number;
}

/** DB CHECK caps coach_brief_window_minutes at 240 — the widest scan window. */
const MAX_WINDOW_MINUTES = 240;
const DEFAULT_WINDOW_MINUTES = 60;

export async function generatePendingBriefs(): Promise<GeneratePendingResult> {
  const supabase = getSupabaseServerClient();
  const result: GeneratePendingResult = {
    eligible: 0,
    generated: 0,
    skipped: 0,
    errors: 0,
  };

  const now = new Date();
  const windowEnd = new Date(now.getTime() + MAX_WINDOW_MINUTES * 60 * 1000);

  // Step 1: events starting within the max window, matched to a client
  const { data: events, error } = await supabase
    .from('calendar_events')
    .select('id, user_id, client_id, start_time')
    .gte('start_time', now.toISOString())
    .lte('start_time', windowEnd.toISOString())
    .not('client_id', 'is', null);

  if (error) {
    console.error('[brief:generate-pending] query error', error.message);
    return result;
  }
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

  // Step 3: per-user brief window
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('user_id, coach_brief_window_minutes')
    .in('user_id', userIds);
  const windowByUser = new Map<string, number>();
  for (const p of prefs ?? []) {
    windowByUser.set(
      p.user_id as string,
      (p.coach_brief_window_minutes as number) ?? DEFAULT_WINDOW_MINUTES
    );
  }

  // Step 4: filter — Pro + event within that user's window
  const eligible = events.filter(e => {
    if (!proUserIds.has(e.user_id as string)) return false;
    const windowMin =
      windowByUser.get(e.user_id as string) ?? DEFAULT_WINDOW_MINUTES;
    const minutesUntil =
      (new Date(e.start_time as string).getTime() - now.getTime()) / 60000;
    return minutesUntil <= windowMin;
  });
  result.eligible = eligible.length;

  console.log(
    `[brief:generate-pending] scanned=${events.length} pro_users=${proUserIds.size} eligible=${eligible.length}`
  );
  if (eligible.length === 0) return result;

  // Step 5: idempotency — exclude events that already have a brief
  const eligibleIds = eligible.map(e => e.id as string);
  const { data: existing } = await supabase
    .from('coach_briefs')
    .select('calendar_event_id')
    .in('calendar_event_id', eligibleIds);
  const alreadyGenerated = new Set(
    (existing ?? []).map(r => r.calendar_event_id as string)
  );

  for (const evt of eligible) {
    if (alreadyGenerated.has(evt.id as string)) {
      result.skipped++;
      continue;
    }
    try {
      await generateBrief({
        userId: evt.user_id as string,
        clientId: evt.client_id as string,
        calendarEventId: evt.id as string,
        startTime: evt.start_time as string,
      });
      result.generated++;
      console.log(`[brief:generate-pending] generated event=${evt.id}`);
    } catch (err) {
      console.error(
        `[brief:generate-pending] failed for event ${evt.id}:`,
        err instanceof Error ? err.message : String(err)
      );
      result.errors++;
    }
  }

  return result;
}
