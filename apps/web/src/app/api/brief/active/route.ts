/**
 * GET /api/brief/active — active Coach Briefs for the dashboard banner (Story 6.4)
 *
 * Returns undismissed briefs whose session is upcoming or ended <2h ago,
 * nearest first. Free coaches always get an empty list.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';
import { getUserTier } from '@/lib/billing/checkUsage';
import type { ActiveBriefSummary, CoachBriefContent } from '@meetsolis/shared';

export const runtime = 'nodejs';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const supabase = getSupabase();
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) {
      return NextResponse.json({ briefs: [] });
    }

    const tier = await getUserTier(userId);
    if (tier !== 'pro') {
      return NextResponse.json({ briefs: [] });
    }

    // Undismissed event briefs
    const { data: briefs } = await supabase
      .from('coach_briefs')
      .select('id, calendar_event_id, content')
      .eq('user_id', userId)
      .eq('dismissed', false)
      .not('calendar_event_id', 'is', null);

    if (!briefs || briefs.length === 0) {
      return NextResponse.json({ briefs: [] });
    }

    // Resolve event start times — keep those upcoming or ended <2h ago
    const eventIds = briefs.map(b => b.calendar_event_id as string);
    const { data: events } = await supabase
      .from('calendar_events')
      .select('id, start_time')
      .in('id', eventIds);

    const startById = new Map(
      (events ?? []).map(e => [e.id as string, e.start_time as string])
    );

    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;

    const active: ActiveBriefSummary[] = briefs
      .map(b => {
        const startTime = startById.get(b.calendar_event_id as string);
        if (!startTime) return null;
        if (new Date(startTime).getTime() < twoHoursAgo) return null;
        const content = b.content as CoachBriefContent;
        return {
          brief_id: b.id as string,
          calendar_event_id: b.calendar_event_id as string,
          client_name: content?.client_name ?? 'Client',
          start_time: startTime,
        };
      })
      .filter((b): b is ActiveBriefSummary => b !== null)
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );

    return NextResponse.json({ briefs: active });
  } catch (e) {
    console.error('[GET /api/brief/active]', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
