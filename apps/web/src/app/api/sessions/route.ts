/**
 * Sessions API
 * GET /api/sessions?client_id=... — list sessions for a client
 * POST /api/sessions — create session (with transcript text/file URL)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { SessionCreateSchema } from '@meetsolis/shared';
import { checkTranscriptLimit } from '@/lib/billing/checkUsage';

function supabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const clientId = request.nextUrl.searchParams.get('client_id');
    if (!clientId) {
      return NextResponse.json(
        { error: { code: 'MISSING_PARAM', message: 'client_id required' } },
        { status: 400 }
      );
    }

    const db = supabase();

    // Verify client belongs to user
    const { data: user } = await db
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();
    if (!user)
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );

    const { data: client } = await db
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!client)
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Client not found' } },
        { status: 404 }
      );

    const { data: sessions, error } = await db
      .from('sessions')
      .select(
        'id, client_id, title, session_date, summary, key_topics, status, created_at'
      )
      .eq('client_id', clientId)
      .eq('user_id', clerkUserId)
      .order('session_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ sessions: sessions || [] });
  } catch (error) {
    console.error('[Sessions API] GET error:', error);
    return NextResponse.json(
      {
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch sessions' },
      },
      { status: 500 }
    );
  }
}

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

    const data = validation.data;
    const db = supabase();

    // Verify client ownership
    const { data: user } = await db
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();
    if (!user)
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );

    const { data: client } = await db
      .from('clients')
      .select('id')
      .eq('id', data.client_id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!client)
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found or access denied',
          },
        },
        { status: 404 }
      );

    // Check transcript limit (only if transcript provided — limits apply when AI is run)
    if (data.transcript_text) {
      const usage = await checkTranscriptLimit(clerkUserId);
      if (!usage.allowed) {
        return NextResponse.json(
          { error: { code: 'USAGE_LIMIT_EXCEEDED', message: usage.reason } },
          { status: 403 }
        );
      }
    }

    const { data: session, error } = await db
      .from('sessions')
      .insert({
        client_id: data.client_id,
        user_id: clerkUserId,
        title: data.title || null,
        session_date: data.session_date,
        transcript_text: data.transcript_text || null,
        transcript_file_url: data.transcript_file_url || null,
        transcript_audio_url: data.transcript_audio_url || null,
        status: data.transcript_text ? 'pending' : 'pending',
      })
      .select()
      .single();

    if (error || !session) throw error;

    // Update client's last_meeting_at
    await db
      .from('clients')
      .update({ last_meeting_at: new Date().toISOString() })
      .eq('id', data.client_id);

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('[Sessions API] POST error:', error);
    return NextResponse.json(
      {
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create session' },
      },
      { status: 500 }
    );
  }
}
