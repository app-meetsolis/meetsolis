/**
 * Sessions API
 * Story 3.1: Session DB Schema & API
 *
 * GET  /api/sessions?client_id=[id]  — list sessions (reverse-chronological)
 * POST /api/sessions                  — create session
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { SessionCreateSchema } from '@meetsolis/shared';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

async function getInternalUserId(clerkUserId: string) {
  const supabase = getSupabase();
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkUserId)
    .single();
  if (error || !user) return null;
  return user.id as string;
}

/**
 * GET /api/sessions?client_id=[id]
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

    if (!clientId) {
      return NextResponse.json(
        {
          error: { code: 'VALIDATION_ERROR', message: 'client_id is required' },
        },
        { status: 400 }
      );
    }

    const userId = await getInternalUserId(clerkUserId);
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

    const { data: sessions, error: queryError } = await supabase
      .from('sessions')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .order('session_date', { ascending: false });

    if (queryError) {
      console.error('[Sessions API] GET error:', queryError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch sessions',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions: sessions || [] }, { status: 200 });
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
 * POST /api/sessions
 * Create a new session
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
    const validation = SessionCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid session data',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const {
      client_id,
      title,
      session_date,
      transcript_text,
      transcript_file_url,
      transcript_audio_url,
      summary,
      key_topics,
    } = validation.data;

    const userId = await getInternalUserId(clerkUserId);
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

    const { data: newSession, error: insertError } = await supabase
      .from('sessions')
      .insert({
        client_id,
        user_id: userId,
        title,
        session_date,
        transcript_text: transcript_text || null,
        transcript_file_url: transcript_file_url || null,
        transcript_audio_url: transcript_audio_url || null,
        summary: summary || null,
        key_topics: key_topics || [],
        status: 'pending',
      })
      .select()
      .single();

    if (insertError || !newSession) {
      console.error('[Sessions API] POST insert error:', insertError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create session',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error('[Sessions API] POST unexpected error:', error);
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
