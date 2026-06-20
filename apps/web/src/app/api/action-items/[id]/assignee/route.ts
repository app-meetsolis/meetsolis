/**
 * Story 7.6 — reassign an action item (cleanup of 'unknown' attributions).
 *
 * PATCH /api/action-items/[id]/assignee
 *   Body: { assignee: 'coach' | 'client' | 'unknown' | null }
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { ActionItemAssigneeSchema } from '@meetsolis/shared';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!UUID_REGEX.test(params.id)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid action item ID',
          },
        },
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

    const validation = ActionItemAssigneeSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid assignee',
            details: validation.error.errors,
          },
        },
        { status: 400 }
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

    const { data: existing } = await supabase
      .from('action_items')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Action item not found' } },
        { status: 404 }
      );
    }

    const { data: updated, error } = await supabase
      .from('action_items')
      .update({ assignee: validation.data.assignee })
      .eq('id', params.id)
      .select()
      .single();

    if (error || !updated) {
      console.error('[ActionItems/assignee API] update error:', error);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update assignee',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[ActionItems/assignee API] PATCH error:', error);
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
