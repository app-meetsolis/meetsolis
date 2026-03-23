/**
 * Sessions Transcribe API
 * Story 3.3: Auto-Transcription
 *
 * POST /api/sessions/[id]/transcribe
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { runTranscribe } from '@/lib/sessions/transcribe-session';
import { getInternalUserId } from '@/lib/helpers/user';

// Allow up to 120s for transcription (requires Vercel Pro)
export const maxDuration = 120;

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/sessions/[id]/transcribe
 * External HTTP endpoint — requires Clerk auth.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const userId = await getInternalUserId(getSupabase(), clerkUserId);
  if (!userId) {
    return NextResponse.json(
      { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
      { status: 404 }
    );
  }

  // Ownership check
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('sessions')
    .select('user_id, transcript_audio_url')
    .eq('id', params.id)
    .single();

  if (!existing || existing.user_id !== userId) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Session not found' } },
      { status: 404 }
    );
  }

  if (!existing.transcript_audio_url) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session has no audio URL to transcribe',
        },
      },
      { status: 400 }
    );
  }

  const result = await runTranscribe(params.id, userId);

  if (result === 'error') {
    return NextResponse.json(
      {
        error: { code: 'TRANSCRIPTION_ERROR', message: 'Transcription failed' },
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { sessionId: params.id, status: result },
    { status: 200 }
  );
}
