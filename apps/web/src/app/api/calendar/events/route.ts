/**
 * GET /api/calendar/events — list calendar events for current user.
 * Returns past (last 24h) + upcoming, ordered chronologically.
 * Joins with clients for display name. Supports ?limit param.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInternalUserId } from '@/lib/helpers/user';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const userId = await getInternalUserId(supabase, clerkUserId);
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const url = new URL(req.url);
  const limitParam = url.searchParams.get('limit');
  const limit = Math.min(Math.max(parseInt(limitParam ?? '5', 10) || 5, 1), 20);
  // Story 7.7 — optional filters for Client Card "Next session" lookup
  const clientIdParam = url.searchParams.get('client_id');
  const upcomingOnly = url.searchParams.get('upcoming') === 'true';

  const now = new Date();
  const past = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const since = upcomingOnly ? now.toISOString() : past;

  let query = supabase
    .from('calendar_events')
    .select(
      'id, google_event_id, title, start_time, end_time, attendees, client_id, meet_link, bot_status, bot_skipped, synced_at, created_at, user_id, clients(name)'
    )
    .eq('user_id', userId)
    .gte('start_time', since);

  if (clientIdParam) {
    query = query.eq('client_id', clientIdParam);
  }

  const { data, error } = await query
    .order('start_time', { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to load events' },
      { status: 500 }
    );
  }

  const events = (data ?? []).map(row => {
    const { clients, ...rest } = row as typeof row & {
      clients: { name: string } | null;
    };
    return {
      ...rest,
      client_name: clients?.name ?? null,
    };
  });

  return NextResponse.json({ events });
}
