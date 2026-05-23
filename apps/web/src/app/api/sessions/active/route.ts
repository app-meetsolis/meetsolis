/**
 * GET /api/sessions/active
 * Returns sessions currently being streamed (recall_sessions.status='in_meeting')
 * for the authenticated user. Powers the dashboard live transcript panel
 * (Story 6.5).
 *
 * Response shape: ActiveSession[] — one entry per active recall_sessions row
 * with status='in_meeting' AND a paired sessions row (lazy-created on first
 * webhook event).
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

interface ActiveSessionRow {
  session_id: string;
  recall_session_id: string;
  client_id: string | null;
  client_name: string | null;
  speaker_map: Record<string, string> | null;
  status: string;
}

export async function GET(_req: NextRequest) {
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
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // recall_sessions with status='in_meeting' for this user, joined to
    // sessions to surface the session_id used by /transcript-live polling.
    const { data: recallRows, error } = await supabase
      .from('recall_sessions')
      .select('id, client_id, speaker_map, status, clients(name)')
      .eq('user_id', userId)
      .eq('status', 'in_meeting');

    if (error || !recallRows) {
      console.error('[sessions/active] recall_sessions query failed', error);
      return NextResponse.json({ sessions: [] satisfies ActiveSessionRow[] });
    }

    if (recallRows.length === 0) {
      return NextResponse.json({ sessions: [] satisfies ActiveSessionRow[] });
    }

    const recallIds = recallRows.map(r => r.id as string);
    const { data: sessionRows } = await supabase
      .from('sessions')
      .select('id, recall_session_id, transcript_streaming_complete')
      .in('recall_session_id', recallIds)
      .eq('user_id', userId);

    const sessionByRecall = new Map<
      string,
      { id: string; complete: boolean }
    >();
    for (const s of sessionRows ?? []) {
      sessionByRecall.set(s.recall_session_id as string, {
        id: s.id as string,
        complete: Boolean(s.transcript_streaming_complete),
      });
    }

    const sessions: ActiveSessionRow[] = recallRows
      .map((r): ActiveSessionRow | null => {
        const session = sessionByRecall.get(r.id as string);
        if (!session || session.complete) return null;
        const clients = r.clients as
          | { name: string }
          | { name: string }[]
          | null;
        const clientName = Array.isArray(clients)
          ? (clients[0]?.name ?? null)
          : (clients?.name ?? null);
        return {
          session_id: session.id,
          recall_session_id: r.id as string,
          client_id: (r.client_id as string | null) ?? null,
          client_name: clientName,
          speaker_map: (r.speaker_map as Record<string, string> | null) ?? null,
          status: r.status as string,
        };
      })
      .filter((s): s is ActiveSessionRow => s !== null);

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error('[sessions/active] error:', err);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
