/**
 * Waiting Room Whitelist API Routes
 * GET /api/meetings/[id]/whitelist - Get whitelist (host only)
 * POST /api/meetings/[id]/whitelist - Add email to whitelist (host only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { config } from '@/lib/config/env';
import { getUserByClerkId } from '@/lib/helpers/user';

const AddToWhitelistSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * GET /api/meetings/[id]/whitelist - Get waiting room whitelist
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );

    // Get user's database ID
    const user = await getUserByClerkId(supabase, userId);

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Check if meeting exists
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('meeting_code', params.id)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Meeting not found' } },
        { status: 404 }
      );
    }

    // Check if user is host (authorization)
    if (meeting.host_id !== user.id) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Only the host can view the whitelist',
          },
        },
        { status: 403 }
      );
    }

    const whitelist = meeting.waiting_room_whitelist || [];

    return NextResponse.json({ whitelist }, { status: 200 });
  } catch (error) {
    console.error('[whitelist/route] API Error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/meetings/[id]/whitelist - Add email to whitelist
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );

    // Get user's database ID
    const user = await getUserByClerkId(supabase, userId);

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = AddToWhitelistSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: validation.error.errors[0].message,
          },
        },
        { status: 400 }
      );
    }

    // Check if meeting exists
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('meeting_code', params.id)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Meeting not found' } },
        { status: 404 }
      );
    }

    // Check if user is host (authorization)
    if (meeting.host_id !== user.id) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Only the host can manage the whitelist',
          },
        },
        { status: 403 }
      );
    }

    const currentWhitelist = meeting.waiting_room_whitelist || [];
    const emailToAdd = validation.data.email.toLowerCase();

    // Check if email is already in whitelist
    if (currentWhitelist.includes(emailToAdd)) {
      return NextResponse.json(
        {
          error: {
            code: 'ALREADY_EXISTS',
            message: 'Email is already in whitelist',
          },
        },
        { status: 400 }
      );
    }

    // Add email to whitelist
    const updatedWhitelist = [...currentWhitelist, emailToAdd];

    const { data: updatedMeeting, error: updateError } = await supabase
      .from('meetings')
      .update({
        waiting_room_whitelist: updatedWhitelist,
        updated_at: new Date().toISOString(),
      })
      .eq('id', meeting.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(
      {
        whitelist: updatedWhitelist,
        message: 'Email added to whitelist',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[whitelist/route] API Error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
