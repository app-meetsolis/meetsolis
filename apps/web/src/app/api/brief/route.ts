/**
 * GET /api/brief — Coach Brief view payload (Story 6.4)
 *
 * Query: ?event_id=<uuid>  (calendar-event brief)
 *        ?client_id=<uuid> (manual / no-calendar brief)
 *
 * Response states:
 *  - ready            brief exists -> { brief, event, sibling_event_ids }
 *  - generating       Pro + matched, no brief yet -> screen triggers generation
 *  - unmatched        event has no client_id -> screen shows match prompt
 *  - upgrade_required free tier -> screen shows upgrade prompt
 *  - not_found        event not found / not owned
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { endOfDay } from 'date-fns';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';
import { getUserTier } from '@/lib/billing/checkUsage';
import type { CoachBriefContent } from '@meetsolis/shared';

export const runtime = 'nodejs';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

function err(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/**
 * Refreshes last-session action-item statuses from the live action_items
 * table so checkbox toggles survive without re-generating the brief.
 */
async function reconcileBrief(
  supabase: ReturnType<typeof getSupabase>,
  brief: { content: CoachBriefContent } & Record<string, unknown>
) {
  const items = brief.content?.last_session?.action_items;
  if (!items || items.length === 0) return brief;

  const { data: live } = await supabase
    .from('action_items')
    .select('id, status')
    .in(
      'id',
      items.map(i => i.id)
    );
  if (!live) return brief;

  const statusById = new Map(
    live.map(r => [r.id as string, r.status as string])
  );
  brief.content.last_session!.action_items = items.map(i => {
    const s = statusById.get(i.id);
    return s
      ? {
          ...i,
          status: s === 'completed' ? ('done' as const) : ('open' as const),
        }
      : i;
  });
  return brief;
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return err('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const clientId = searchParams.get('client_id');

    if (!eventId && !clientId) {
      return err('VALIDATION_ERROR', 'event_id or client_id required', 400);
    }
    if (eventId && !UUID_REGEX.test(eventId)) {
      return err('VALIDATION_ERROR', 'Invalid event_id', 400);
    }
    if (clientId && !UUID_REGEX.test(clientId)) {
      return err('VALIDATION_ERROR', 'Invalid client_id', 400);
    }

    const supabase = getSupabase();
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) return err('USER_NOT_FOUND', 'User not found', 404);

    const tier = await getUserTier(userId);

    // Dedicated brief screen is Pro-only (Free coaches use Solis chat)
    if (tier !== 'pro') {
      return NextResponse.json({ state: 'upgrade_required', tier });
    }

    // --- Manual brief lookup ---------------------------------------------
    if (clientId && !eventId) {
      const { data: brief } = await supabase
        .from('coach_briefs')
        .select('*')
        .eq('user_id', userId)
        .eq('client_id', clientId)
        .is('calendar_event_id', null)
        .maybeSingle();

      if (!brief) {
        return NextResponse.json({
          state: 'generating',
          tier,
          client_id: clientId,
        });
      }
      return NextResponse.json({
        state: 'ready',
        tier,
        brief: await reconcileBrief(supabase, brief as never),
        event: null,
        sibling_event_ids: [],
      });
    }

    // --- Event brief lookup ----------------------------------------------
    const { data: event } = await supabase
      .from('calendar_events')
      .select('id, title, start_time, client_id')
      .eq('id', eventId!)
      .eq('user_id', userId)
      .maybeSingle();

    if (!event) {
      return NextResponse.json({ state: 'not_found', tier }, { status: 404 });
    }

    const eventOut = {
      id: event.id,
      title: event.title,
      start_time: event.start_time,
    };

    if (!event.client_id) {
      return NextResponse.json({ state: 'unmatched', tier, event: eventOut });
    }

    const { data: brief } = await supabase
      .from('coach_briefs')
      .select('*')
      .eq('user_id', userId)
      .eq('calendar_event_id', eventId!)
      .maybeSingle();

    if (!brief) {
      return NextResponse.json({
        state: 'generating',
        tier,
        event: eventOut,
        client_id: event.client_id,
      });
    }

    // Sibling briefs scheduled later the same day (for "Next brief ->")
    const dayEnd = endOfDay(new Date(event.start_time)).toISOString();
    const { data: laterEvents } = await supabase
      .from('calendar_events')
      .select('id, start_time')
      .eq('user_id', userId)
      .gt('start_time', event.start_time)
      .lte('start_time', dayEnd)
      .not('client_id', 'is', null)
      .order('start_time', { ascending: true });

    let siblingEventIds: string[] = [];
    if (laterEvents && laterEvents.length > 0) {
      const ids = laterEvents.map(e => e.id as string);
      const { data: laterBriefs } = await supabase
        .from('coach_briefs')
        .select('calendar_event_id')
        .eq('user_id', userId)
        .in('calendar_event_id', ids)
        .eq('dismissed', false);
      const briefSet = new Set(
        (laterBriefs ?? []).map(b => b.calendar_event_id as string)
      );
      siblingEventIds = laterEvents
        .filter(e => briefSet.has(e.id as string))
        .map(e => e.id as string);
    }

    return NextResponse.json({
      state: 'ready',
      tier,
      brief: await reconcileBrief(supabase, brief as never),
      event: eventOut,
      sibling_event_ids: siblingEventIds,
    });
  } catch (e) {
    console.error('[GET /api/brief]', e);
    return err('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
