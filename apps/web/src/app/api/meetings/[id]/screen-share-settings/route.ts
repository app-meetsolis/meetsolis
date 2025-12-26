/**
 * Screen Share Settings API Route
 * PUT /api/meetings/[id]/screen-share-settings - Update screen share permissions (host only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { config } from '@/lib/config/env';
import { getUserByClerkId } from '@/lib/helpers/user';

const ScreenShareSettingsSchema = z.object({
  allowAll: z.boolean(),
});

/**
 * PUT /api/meetings/[id]/screen-share-settings - Update screen share permissions
 */
export async function PUT(
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
    const validation = ScreenShareSettingsSchema.safeParse(body);
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
            message: 'Only the host can update screen share settings',
          },
        },
        { status: 403 }
      );
    }

    // Update screen share permission setting
    const { data: updatedMeeting, error: updateError } = await supabase
      .from('meetings')
      .update({
        allow_participant_screenshare: validation.data.allowAll,
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
        allow_participant_screenshare: validation.data.allowAll,
        message: `Screen sharing ${validation.data.allowAll ? 'enabled' : 'disabled'} for all participants`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[screen-share-settings/route] API Error:', error);
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
