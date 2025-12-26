/**
 * Whitelist Email Management API Route
 * DELETE /api/meetings/[id]/whitelist/[email] - Remove email from whitelist (host only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { getUserByClerkId } from '@/lib/helpers/user';

/**
 * DELETE /api/meetings/[id]/whitelist/[email] - Remove email from whitelist
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; email: string } }
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

    // Decode email from URL
    const emailToRemove = decodeURIComponent(params.email).toLowerCase();

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

    // Check if email exists in whitelist
    if (!currentWhitelist.includes(emailToRemove)) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Email not found in whitelist',
          },
        },
        { status: 404 }
      );
    }

    // Remove email from whitelist
    const updatedWhitelist = currentWhitelist.filter(
      (email: string) => email !== emailToRemove
    );

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
        message: 'Email removed from whitelist',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[whitelist/email/route] API Error:', error);
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
