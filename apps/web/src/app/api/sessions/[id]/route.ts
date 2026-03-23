/**
 * Sessions [id] API
 * Story 3.1: Session DB Schema & API
 *
 * GET    /api/sessions/[id]  — get session detail
 * PUT    /api/sessions/[id]  — update session
 * DELETE /api/sessions/[id]  — delete session
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { SessionUpdateSchema } from '@meetsolis/shared';
import { getInternalUserId } from '@/lib/helpers/user';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/sessions/[id]
 */
export async function GET(
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

    const userId = await getInternalUserId(getSupabase(), clerkUserId);
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const supabase = getSupabase();

    const { data: session, error: queryError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (queryError || !session) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    console.error('[Sessions API] GET unexpected error:', error);
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
 * PUT /api/sessions/[id]
 */
export async function PUT(
  request: NextRequest,
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

    const body = await request.json();
    const validation = SessionUpdateSchema.safeParse(body);

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

    const { data: updatedSession, error: updateError } = await supabase
      .from('sessions')
      .update({ ...validation.data, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError || !updatedSession) {
      console.error('[Sessions API] PUT update error:', updateError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update session',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ session: updatedSession }, { status: 200 });
  } catch (error) {
    console.error('[Sessions API] PUT unexpected error:', error);
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
 * DELETE /api/sessions/[id]
 */
export async function DELETE(
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

    const { error: deleteError } = await supabase
      .from('sessions')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('[Sessions API] DELETE error:', deleteError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to delete session',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Sessions API] DELETE unexpected error:', error);
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
