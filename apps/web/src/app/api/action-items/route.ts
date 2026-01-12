/**
 * Action Items API Route
 * Story 2.6: Client Detail View (Enhanced) - Task 13
 *
 * GET /api/action-items?client_id={id} - List action items for a client
 * POST /api/action-items - Create new action item
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { actionItemCreateSchema } from '@/lib/validations/actionItems';

/**
 * GET /api/action-items?client_id={id}
 * List all action items for a specific client
 *
 * Query params: client_id (required)
 * Response: 200 { action_items: ClientActionItem[] } | 400 | 401 | 500
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Get client_id from query params
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    if (!clientId) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'client_id query parameter is required',
          },
        },
        { status: 400 }
      );
    }

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

    // Verify client belongs to user (RLS will also enforce this)
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('user_id', userId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found' } },
        { status: 404 }
      );
    }

    // Fetch action items for the client
    const { data: actionItems, error: fetchError } = await supabase
      .from('action_items')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error(
        '[Action Items API] Failed to fetch action items:',
        fetchError
      );
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch action items',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      action_items: actionItems || [],
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
 * POST /api/action-items
 * Create a new action item
 *
 * Request body: { client_id, description, due_date?, completed? }
 * Response: 201 { action_item: ClientActionItem } | 400 | 401 | 404 | 500
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = actionItemCreateSchema.safeParse(body);

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

    const actionItemData = validationResult.data;

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

    // Verify client belongs to user
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', actionItemData.client_id)
      .eq('user_id', userId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found' } },
        { status: 404 }
      );
    }

    // Create action item
    const { data: actionItem, error: createError } = await supabase
      .from('action_items')
      .insert({
        client_id: actionItemData.client_id,
        user_id: userId,
        description: actionItemData.description,
        due_date: actionItemData.due_date || null,
        completed: actionItemData.completed || false,
      })
      .select()
      .single();

    if (createError) {
      console.error(
        '[Action Items API] Failed to create action item:',
        createError
      );
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create action item',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        action_item: actionItem,
      },
      { status: 201 }
    );
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
