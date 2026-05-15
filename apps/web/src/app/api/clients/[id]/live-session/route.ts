/**
 * GET /api/clients/[id]/live-session
 * Returns the currently-live (or just-ended) streaming session for a client,
 * if any. Drives whether the client page renders LiveTranscriptPanel
 * (Story 6.2b). A session stays "live" while in_meeting, and for 30 min
 * after the call ends so the coach sees the wrap-up.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';

export const runtime = 'nodejs';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RECENT_MS = 30 * 60 * 1000;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!UUID_REGEX.test(params.id)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: recallSession } = await supabase
      .from('recall_sessions')
      .select('id, status, ended_at')
      .eq('client_id', params.id)
      .eq('user_id', userId)
      .in('status', ['in_meeting', 'done'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!recallSession) {
      return NextResponse.json({ session_id: null });
    }

    const endedRecently =
      !!recallSession.ended_at &&
      Date.now() - new Date(recallSession.ended_at).getTime() < RECENT_MS;
    if (recallSession.status !== 'in_meeting' && !endedRecently) {
      return NextResponse.json({ session_id: null });
    }

    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('recall_session_id', recallSession.id)
      .maybeSingle();

    return NextResponse.json({ session_id: session?.id ?? null });
  } catch (error) {
    console.error('[live-session] GET error:', error);
    // Soft-fail: panel simply won't render.
    return NextResponse.json({ session_id: null }, { status: 200 });
  }
}
