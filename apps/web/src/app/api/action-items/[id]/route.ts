/**
 * Action Item Detail API Route
 * Story 2.6: Client Detail View (Enhanced) - Task 13
 *
 * GET /api/action-items/[id] - Get single action item
 * PUT /api/action-items/[id] - Update action item
 * DELETE /api/action-items/[id] - Delete action item
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { actionItemUpdateSchema } from '@/lib/validations/actionItems';

/**
 * GET /api/action-items/[id]
 * Get a single action item
 *
 * Response: 200 { action_item: ClientActionItem } | 401 | 404 | 500
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const actionItemId = params.id;

    // Create Supabase client
    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );

    // Get internal user_id from clerk_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !user) {
      console.error('[Action Items API] User not found:', userError);
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const userId = user.id;

    // Fetch action item (RLS will enforce user_id match)
    const { data: actionItem, error: fetchError } = await supabase
      .from('action_items')
      .select('*')
      .eq('id', actionItemId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !actionItem) {
      return NextResponse.json(
        {
          error: {
            code: 'ACTION_ITEM_NOT_FOUND',
            message: 'Action item not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      action_item: actionItem,
    });
  } catch (error) {
    console.error('[Action Items API] Unexpected error:', error);
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
 * PUT /api/action-items/[id]
 * Update an action item
 *
 * Request body: { description?, due_date?, completed? }
 * Response: 200 { action_item: ClientActionItem } | 400 | 401 | 404 | 500
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const actionItemId = params.id;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = actionItemUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid action item data',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Create Supabase client
    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );

    // Get internal user_id from clerk_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !user) {
      console.error('[Action Items API] User not found:', userError);
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const userId = user.id;

    // Verify action item exists and belongs to user
    const { data: existingItem, error: checkError } = await supabase
      .from('action_items')
      .select('id')
      .eq('id', actionItemId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingItem) {
      return NextResponse.json(
        {
          error: {
            code: 'ACTION_ITEM_NOT_FOUND',
            message: 'Action item not found',
          },
        },
        { status: 404 }
      );
    }

    // Update action item
    const { data: actionItem, error: updateError } = await supabase
      .from('action_items')
      .update(updateData)
      .eq('id', actionItemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error(
        '[Action Items API] Failed to update action item:',
        updateError
      );
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

    return NextResponse.json({
      action_item: actionItem,
    });
  } catch (error) {
    console.error('[Action Items API] Unexpected error:', error);
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
 * Delete an action item
 *
 * Response: 200 { message: "Action item deleted successfully" } | 401 | 404 | 500
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const actionItemId = params.id;

    // Create Supabase client
    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );

    // Get internal user_id from clerk_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !user) {
      console.error('[Action Items API] User not found:', userError);
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const userId = user.id;

    // Verify action item exists and belongs to user
    const { data: existingItem, error: checkError } = await supabase
      .from('action_items')
      .select('id')
      .eq('id', actionItemId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingItem) {
      return NextResponse.json(
        {
          error: {
            code: 'ACTION_ITEM_NOT_FOUND',
            message: 'Action item not found',
          },
        },
        { status: 404 }
      );
    }

    // Delete action item
    const { error: deleteError } = await supabase
      .from('action_items')
      .delete()
      .eq('id', actionItemId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error(
        '[Action Items API] Failed to delete action item:',
        deleteError
      );
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

    return NextResponse.json({
      message: 'Action item deleted successfully',
    });
  } catch (error) {
    console.error('[Action Items API] Unexpected error:', error);
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
