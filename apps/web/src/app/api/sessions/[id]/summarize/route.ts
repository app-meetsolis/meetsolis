/**
 * Sessions Summarize API
 * Story 3.4: Real AI summarization — GPT-4o-mini + text-embedding-3-small
 *
 * POST /api/sessions/[id]/summarize
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { runSummarize } from '@/lib/sessions/summarize-session';
import { getInternalUserId } from '@/lib/helpers/user';
import {
  checkTranscriptLimit,
  incrementTranscriptCount,
} from '@/lib/billing/checkUsage';
import { UpgradeRequiredError } from '@meetsolis/shared';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/sessions/[id]/summarize
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
    .select('user_id')
    .eq('id', params.id)
    .single();

  if (!existing || existing.user_id !== userId) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Session not found' } },
      { status: 404 }
    );
  }

  // Enforce transcript limit before AI processing
  try {
    await checkTranscriptLimit(userId);
  } catch (e) {
    if (e instanceof UpgradeRequiredError) {
      return NextResponse.json(
        {
          error: {
            code: 'LIMIT_EXCEEDED',
            message:
              'AI session limit reached. Upgrade to Pro for more sessions.',
            type: e.limitType,
          },
        },
        { status: 403 }
      );
    }
    throw e;
  }

  const result = await runSummarize(params.id, userId);

  if (result !== 'error') {
    await incrementTranscriptCount(userId);
  }

  if (result === 'error') {
    return NextResponse.json(
      { error: { code: 'AI_ERROR', message: 'AI summarization failed' } },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { sessionId: params.id, status: result },
    { status: 200 }
  );
}
