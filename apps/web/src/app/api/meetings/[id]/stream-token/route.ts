/**
 * Stream Token Generation API Route
 * POST /api/meetings/[id]/stream-token - Generate Stream Video JWT token
 *
 * This endpoint generates authentication tokens for Stream Video SDK.
 * Tokens are required for clients to join video calls using Stream.
 *
 * Flow:
 * 1. Validate Clerk JWT authentication
 * 2. Verify participant exists in meeting
 * 3. Generate Stream JWT token (1-hour expiry)
 * 4. Return token + metadata for client initialization
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { getUserByClerkId } from '@/lib/helpers/user';
import { generateStreamUserToken, upsertStreamUser } from '@/lib/stream/client';

/**
 * POST /api/meetings/[id]/stream-token - Generate Stream token
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Validate Clerk JWT
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const meetingCode = params.id;
    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );

    // 2. Get user from database
    const user = await getUserByClerkId(supabase, clerkUserId);

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // 3. Query meeting by meeting_code
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, meeting_code, title, status')
      .eq('meeting_code', meetingCode)
      .single();

    if (meetingError || !meeting) {
      console.error(
        '[stream-token] Meeting not found:',
        meetingCode,
        meetingError
      );
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Meeting not found' } },
        { status: 404 }
      );
    }

    // 4. Verify participant exists and hasn't left
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, user_id, role, join_time, leave_time')
      .eq('meeting_id', meeting.id)
      .eq('user_id', user.id)
      .is('leave_time', null)
      .single();

    if (participantError || !participant) {
      console.error('[stream-token] Participant not found:', {
        meetingId: meeting.id,
        userId: user.id,
        error: participantError,
      });
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'You must join the meeting before requesting a token',
          },
        },
        { status: 403 }
      );
    }

    // 5. Upsert Stream user (create or update)
    try {
      await upsertStreamUser(clerkUserId, user.name || 'Anonymous');
    } catch (streamError) {
      console.error(
        '[stream-token] Failed to upsert Stream user:',
        streamError
      );
      // Continue anyway - user might already exist
    }

    // 6. Generate Stream JWT token (1-hour expiry)
    let token: string;
    try {
      token = generateStreamUserToken(clerkUserId, 3600);
    } catch (tokenError) {
      console.error('[stream-token] Failed to generate token:', tokenError);
      return NextResponse.json(
        {
          error: {
            code: 'TOKEN_GENERATION_FAILED',
            message: 'Failed to generate Stream token',
          },
        },
        { status: 500 }
      );
    }

    // 7. Return token + metadata
    const response = {
      token,
      user_id: clerkUserId,
      user_name: user.name || 'Anonymous',
      call_id: meetingCode,
      api_key: process.env.NEXT_PUBLIC_STREAM_API_KEY,
      participant: {
        id: participant.id,
        role: participant.role,
        join_time: participant.join_time,
      },
      meeting: {
        id: meeting.id,
        code: meeting.meeting_code,
        title: meeting.title,
        status: meeting.status,
      },
    };

    console.log('[stream-token] Token generated successfully:', {
      userId: clerkUserId,
      meetingCode,
      callId: meetingCode,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[stream-token] Unexpected error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate Stream token',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/meetings/[id]/stream-token - Not allowed
 */
export async function GET() {
  return NextResponse.json(
    {
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Use POST to generate Stream tokens',
      },
    },
    { status: 405 }
  );
}
