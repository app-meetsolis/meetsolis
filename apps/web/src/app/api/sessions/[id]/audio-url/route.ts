/**
 * GET /api/sessions/[id]/audio-url
 * Returns a fresh, playable recording URL for a session (Story 6.2c).
 * Recall signed S3 URLs expire — this re-fetches from Recall on every call
 * rather than caching, so the browser always gets a non-expired URL.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';
import { getRecallRecordingMediaUrl } from '@/lib/services/recall/recall-client';

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

    const { data: session } = await supabase
      .from('sessions')
      .select('recall_session_id, transcript_audio_url')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    }

    // Bot sessions: re-fetch a fresh signed URL via the Recall recording id.
    if (session.recall_session_id) {
      const { data: recall } = await supabase
        .from('recall_sessions')
        .select('recording_id')
        .eq('id', session.recall_session_id)
        .single();

      if (recall?.recording_id) {
        try {
          const url = await getRecallRecordingMediaUrl(recall.recording_id);
          if (url) {
            return NextResponse.json({ audio_url: url }, { status: 200 });
          }
        } catch (err) {
          console.error(
            '[audio-url] Recall recording fetch failed:',
            err instanceof Error ? err.message : String(err)
          );
        }
      }
    }

    // Fallback: a stored URL (may be expired, but better than nothing).
    if (session.transcript_audio_url) {
      return NextResponse.json(
        { audio_url: session.transcript_audio_url },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'NO_RECORDING',
          message: 'No recording available for this session',
        },
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('[audio-url] GET error:', error);
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
