/**
 * POST /api/calendar/sync — manual per-user sync trigger.
 * Used by dashboard Upcoming Sessions "Refresh" button.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInternalUserId } from '@/lib/helpers/user';
import { syncUserEvents } from '@/lib/services/calendar/sync-user-events';

export const runtime = 'nodejs';

export async function POST() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const userId = await getInternalUserId(supabase, clerkUserId);
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const result = await syncUserEvents(supabase, userId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    // Surface reconnect-required state distinctly
    const status =
      message.includes('not connected') || message.includes('broken')
        ? 409
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
