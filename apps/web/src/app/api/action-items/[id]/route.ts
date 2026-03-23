/**
 * Action Items [id] API
 * Story 2.6: Client Detail View
 *
 * PUT    /api/action-items/[id]  — update action item
 * DELETE /api/action-items/[id]  — delete action item
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { ActionItemUpdateSchema } from '@meetsolis/shared';
import { getInternalUserId } from '@/lib/helpers/user';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * PUT /api/action-items/[id]
 * Update an action item. Auto-sets completed_at and completed when status → 'completed'.
 */
export async function PUT(
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

    const body = await request.json();
    const validation = ActionItemUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid update data',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const userId = await getInternalUserId(getSupabase(), clerkUserId);
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const supabase = getSupabase();

    // Ownership check
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

    const updateData: Record<string, unknown> = { ...validation.data };

    // Auto-set completed fields when status → 'completed'
    if (validation.data.status === 'completed') {
      updateData.completed = true;
      updateData.completed_at = new Date().toISOString();
    } else if (validation.data.status) {
      updateData.completed = false;
      updateData.completed_at = null;
    }

    const { data: updatedItem, error: updateError } = await supabase
      .from('action_items')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError || !updatedItem) {
      console.error('[ActionItems API] PUT update error:', updateError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update action item',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error('[ActionItems API] PUT unexpected error:', error);
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

/**
 * DELETE /api/action-items/[id]
 * Delete an action item (ownership verified).
 */
export async function DELETE(
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

    const userId = await getInternalUserId(getSupabase(), clerkUserId);
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const supabase = getSupabase();

    // Ownership check
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

    const { error: deleteError } = await supabase
      .from('action_items')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('[ActionItems API] DELETE error:', deleteError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to delete action item',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[ActionItems API] DELETE unexpected error:', error);
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
