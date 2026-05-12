/**
 * GET /api/calendar/events — list upcoming calendar events for current user.
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
  const limit = Math.min(Math.max(parseInt(limitParam ?? '3', 10) || 3, 1), 20);

  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('calendar_events')
    .select(
      'id, google_event_id, title, start_time, end_time, attendees, client_id, meet_link, bot_status, bot_skipped, synced_at, created_at, user_id, clients(name)'
    )
    .eq('user_id', userId)
    .gte('start_time', nowIso)
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
