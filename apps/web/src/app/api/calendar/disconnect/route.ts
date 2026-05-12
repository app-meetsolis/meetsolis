/**
 * POST /api/calendar/disconnect — revokes Google token + deletes row.
 * Keeps calendar_events rows for history (locked decision — Story 6.1).
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInternalUserId } from '@/lib/helpers/user';
import { decryptToken } from '@/lib/services/calendar/token-encryption';
import { revokeToken } from '@/lib/services/calendar/google-calendar';

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

  const { data: row } = await supabase
    .from('user_calendar_tokens')
    .select('refresh_token_encrypted')
    .eq('user_id', userId)
    .single();

  if (row?.refresh_token_encrypted) {
    try {
      const refreshToken = decryptToken(row.refresh_token_encrypted);
      await revokeToken(refreshToken);
    } catch (err) {
      // Log but don't fail — we still want to delete the local row.
      console.error('[calendar/disconnect] revoke failed:', err);
    }
  }

  const { error } = await supabase
    .from('user_calendar_tokens')
    .delete()
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
