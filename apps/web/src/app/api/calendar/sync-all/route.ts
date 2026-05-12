/**
 * POST /api/calendar/sync-all — cron-triggered iterator.
 * Validates CRON_SECRET bearer token, syncs all connected users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { syncUserEvents } from '@/lib/services/calendar/sync-user-events';
import { config } from '@/lib/config';

export const runtime = 'nodejs';
export const maxDuration = 60; // seconds — gives headroom for many users

export async function POST(req: NextRequest) {
  const expected = config.security.cronSecret;
  if (!expected) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    );
  }
  const authHeader = req.headers.get('authorization') ?? '';
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();

  // Pull all users with a non-broken calendar connection
  const { data: rows, error } = await supabase
    .from('user_calendar_tokens')
    .select('user_id')
    .eq('connection_broken', false);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to enumerate users' },
      { status: 500 }
    );
  }

  let succeeded = 0;
  let failed = 0;
  const failures: Array<{ user_id: string; reason: string }> = [];

  for (const row of rows ?? []) {
    try {
      await syncUserEvents(supabase, row.user_id as string);
      succeeded++;
    } catch (err) {
      failed++;
      failures.push({
        user_id: row.user_id as string,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    processed: (rows ?? []).length,
    succeeded,
    failed,
    failures: failures.slice(0, 20), // cap response size
  });
}
