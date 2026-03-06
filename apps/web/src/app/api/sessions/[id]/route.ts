/**
 * Session Detail API
 * GET /api/sessions/[id]
 * PUT /api/sessions/[id]
 * DELETE /api/sessions/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { SessionUpdateSchema } from '@meetsolis/shared';

function supabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!UUID_RE.test(params.id)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid session ID' } },
        { status: 400 }
      );
    }

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );

    const db = supabase();
    const { data: session } = await db
      .from('sessions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', clerkUserId)
      .maybeSingle();

    if (!session)
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );

    return NextResponse.json(session);
  } catch (error) {
    console.error('[Sessions API] GET [id] error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!UUID_RE.test(params.id)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid session ID' } },
        { status: 400 }
      );
    }

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );

    const body = await request.json();
    const validation = SessionUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: { code: 'VALIDATION_ERROR', details: validation.error.errors },
        },
        { status: 400 }
      );
    }

    const db = supabase();
    const { data: session, error } = await db
      .from('sessions')
      .update(validation.data)
      .eq('id', params.id)
      .eq('user_id', clerkUserId)
      .select()
      .single();

    if (error || !session) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Session not found or access denied',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('[Sessions API] PUT [id] error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!UUID_RE.test(params.id)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid session ID' } },
        { status: 400 }
      );
    }

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );

    const db = supabase();
    const { error } = await db
      .from('sessions')
      .delete()
      .eq('id', params.id)
      .eq('user_id', clerkUserId);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[Sessions API] DELETE [id] error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
