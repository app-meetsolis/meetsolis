/**
 * Sessions Summarize API
 * Story 3.1: Async stub — real AI call deferred to Story 3.4
 *
 * POST /api/sessions/[id]/summarize — queue summarization (202 placeholder)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getInternalUserId(clerkUserId: string) {
  const supabase = getSupabase();
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkUserId)
    .single();
  if (error || !user) return null;
  return user.id as string;
}

/**
 * POST /api/sessions/[id]/summarize
 * Async stub — returns 202. Actual AI summarization implemented in Story 3.4.
 */
export async function POST(
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

    const userId = await getInternalUserId(clerkUserId);
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const supabase = getSupabase();

    // Ownership check
    const { data: existing } = await supabase
      .from('sessions')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Summarization queued', sessionId: params.id },
      { status: 202 }
    );
  } catch (error) {
    console.error('[Sessions API] POST summarize unexpected error:', error);
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
