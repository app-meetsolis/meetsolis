/**
 * GET /api/sessions/[id]/transcript-live
 * Live transcript chunks for a streaming session (Story 6.2b).
 * Polled by LiveTranscriptPanel every 3s until `complete` is true.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';
import { normalizeChunks } from '@/lib/services/recall/process-transcript-chunk';
import type { TranscriptChunk } from '@meetsolis/shared';

export const runtime = 'nodejs';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!UUID_REGEX.test(params.id)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid session ID' } },
        { status: 400 }
      );
    }

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

    // Ownership enforced by matching user_id alongside the session id.
    const { data: session, error } = await supabase
      .from('sessions')
      .select(
        'transcript_chunks, transcript_streaming_complete, transcript_streaming_started_at'
      )
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    }

    const chunks = normalizeChunks(
      (session.transcript_chunks ?? []) as TranscriptChunk[]
    );

    return NextResponse.json(
      {
        chunks,
        complete: session.transcript_streaming_complete ?? false,
        started_at: session.transcript_streaming_started_at ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[transcript-live] GET error:', error);
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
