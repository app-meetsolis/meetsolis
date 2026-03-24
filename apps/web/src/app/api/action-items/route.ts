/**
 * Action Items API
 * Story 2.6: Client Detail View
 *
 * GET  /api/action-items?client_id=[id]&status=pending  — list action items
 * POST /api/action-items                                 — create action item
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { ActionItemCreateSchema } from '@meetsolis/shared';
import { getInternalUserId } from '@/lib/helpers/user';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

/**
 * GET /api/action-items?client_id=[id]&status=pending
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');
    const sessionId = searchParams.get('session_id');

    if (!clientId) {
      return NextResponse.json(
        {
          error: { code: 'VALIDATION_ERROR', message: 'client_id is required' },
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

    // Verify client belongs to user
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('user_id', userId)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Client not found' } },
        { status: 404 }
      );
    }

    let query = supabase
      .from('action_items')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: actionItems, error: queryError } = await query;

    if (queryError) {
      console.error('[ActionItems API] GET error:', queryError);
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

    return NextResponse.json(
      { actionItems: actionItems || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ActionItems API] GET unexpected error:', error);
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
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = ActionItemCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid action item data',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { client_id, description, assignee, status, session_id } =
      validation.data;

    const userId = await getInternalUserId(getSupabase(), clerkUserId);
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const supabase = getSupabase();

    // Verify client ownership
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', client_id)
      .eq('user_id', userId)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Client not found' } },
        { status: 404 }
      );
    }

    const { data: newItem, error: insertError } = await supabase
      .from('action_items')
      .insert({
        client_id,
        user_id: userId,
        description,
        assignee: assignee || null,
        status: status || 'pending',
        completed: false,
        session_id: session_id || null,
      })
      .select()
      .single();

    if (insertError || !newItem) {
      console.error('[ActionItems API] POST insert error:', insertError);
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

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('[ActionItems API] POST unexpected error:', error);
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
