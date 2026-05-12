/**
 * GET /api/calendar/status — returns calendar connection state for current user.
 * Used by Settings → Integrations section + dashboard Upcoming Sessions card.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInternalUserId } from '@/lib/helpers/user';
import type { CalendarConnectionStatus } from '@meetsolis/shared';

export const runtime = 'nodejs';

export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const userId = await getInternalUserId(supabase, clerkUserId);
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { data: row } = await supabase
    .from('user_calendar_tokens')
    .select('google_account_email, connection_broken')
    .eq('user_id', userId)
    .single();

  const body: CalendarConnectionStatus = row
    ? {
        connected: true,
        email: row.google_account_email,
        connection_broken: row.connection_broken,
      }
    : { connected: false };

  return NextResponse.json(body);
}
