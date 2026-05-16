/**
 * POST /api/sessions/[id]/action-items/generate
 * Manually generate action items for a completed session (Story 6.2c).
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';
import { runGenerateActionItems } from '@/lib/sessions/generate-action-items';

export const runtime = 'nodejs';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    const supabase = getSupabase();
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Ownership check
    const { data: existing } = await supabase
      .from('sessions')
      .select('user_id, transcript_text')
      .eq('id', params.id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    }

    if (!existing.transcript_text) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_READY',
            message: 'Session has no transcript yet',
          },
        },
        { status: 409 }
      );
    }

    const result = await runGenerateActionItems(params.id, userId);

    if (result.status === 'error') {
      return NextResponse.json(
        {
          error: {
            code: 'AI_ERROR',
            message: 'Failed to generate action items',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { action_items: result.action_items },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ActionItems Generate API] unexpected error:', error);
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
