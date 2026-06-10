/**
 * Story 7.7 — PATCH /api/sessions/[id]/tags
 *
 * Update session classification tags (up to 2 from closed enum).
 * Coach edits override AI classification; tags column is replaced wholesale
 * with the validated set.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { SessionTagsPatchSchema } from '@meetsolis/shared';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';

export const runtime = 'nodejs';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function err(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    if (!UUID_REGEX.test(sessionId)) {
      return err('INVALID_ID', 'Invalid session ID', 400);
    }

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return err('UNAUTHORIZED', 'Authentication required', 401);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return err('VALIDATION_ERROR', 'Invalid JSON body', 400);
    }

    const parsed = SessionTagsPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid tags payload',
            details: parsed.error.errors,
          },
        },
        { status: 400 }
      );
    }

    // Dedupe defensively (Zod schema already validates enum + max length).
    const tags = Array.from(new Set(parsed.data.tags));

    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) return err('USER_NOT_FOUND', 'User not found', 404);

    const { data: updated, error: updateErr } = await supabase
      .from('sessions')
      .update({ tags })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select('id, tags')
      .maybeSingle();

    if (updateErr) {
      console.error('[SessionTags] Update error:', updateErr);
      return err('INTERNAL_ERROR', 'Failed to update tags', 500);
    }
    if (!updated) {
      return err(
        'SESSION_NOT_FOUND',
        'Session not found or access denied',
        404
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[SessionTags] PATCH error:', error);
    return err('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
