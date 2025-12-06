/**
 * Meeting Join API Route
 * POST /api/meetings/[id]/join - Join a meeting as a participant
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { config } from '@/lib/config/env';
import { getUserByClerkId } from '@/lib/helpers/user';

const JoinMeetingSchema = z.object({
  role: z
    .enum(['host', 'co-host', 'participant'])
    .optional()
    .default('participant'),
});

/**
 * POST /api/meetings/[id]/join - Join a meeting
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
    const body = await request.json().catch(() => ({}));
    const validation = JoinMeetingSchema.safeParse(body);
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

    // Check if meeting exists (query by meeting_code, not UUID id)
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

    // Check if meeting is locked
    if (meeting.locked) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Meeting is locked' } },
        { status: 403 }
      );
    }

    // Check if meeting has ended
    if (meeting.status === 'ended') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Meeting has ended' } },
        { status: 403 }
      );
    }

    // Check if participant already exists (use meeting.id UUID, not meeting_code)
    const { data: existingParticipant } = await supabase
      .from('participants')
      .select('*')
      .eq('meeting_id', meeting.id)
      .eq('user_id', user.id)
      .single();

    // If participant already exists and hasn't left, return existing record
    if (existingParticipant && !existingParticipant.leave_time) {
      return NextResponse.json(existingParticipant);
    }

    // Count current participants (use meeting.id UUID, not meeting_code)
    const { count: participantCount } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('meeting_id', meeting.id)
      .is('leave_time', null);

    // Check max participants limit
    if (
      participantCount !== null &&
      participantCount >= meeting.max_participants
    ) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Meeting is full' } },
        { status: 403 }
      );
    }

    // Create or update participant record
    let participant;
    if (existingParticipant) {
      // Update existing participant (re-joining)
      const { data, error } = await supabase
        .from('participants')
        .update({
          join_time: new Date().toISOString(),
          leave_time: null,
          role: validation.data.role,
          is_muted: true, // Auto-mute on join
          is_video_off: false,
          connection_quality: 'good',
        })
        .eq('id', existingParticipant.id)
        .select()
        .single();

      if (error) throw error;
      participant = data;
    } else {
      // Create new participant (use meeting.id UUID, not meeting_code)
      const { data, error } = await supabase
        .from('participants')
        .insert({
          meeting_id: meeting.id,
          user_id: user.id,
          role: validation.data.role,
          join_time: new Date().toISOString(),
          is_muted: true, // Auto-mute on join
          is_video_off: false,
          connection_quality: 'good',
          permissions: {
            can_share_screen: true,
            can_use_whiteboard: true,
            can_upload_files: true,
            can_send_messages: true,
            can_create_polls: true,
            can_use_reactions: true,
          },
        })
        .select()
        .single();

      if (error) throw error;
      participant = data;
    }

    // If this is the first participant joining, update meeting status to 'active'
    if (participantCount === 0 && meeting.status === 'scheduled') {
      await supabase
        .from('meetings')
        .update({
          status: 'active',
          actual_start: new Date().toISOString(),
        })
        .eq('id', meeting.id);
    }

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error('[join/route] API Error:', error);
    console.error(
      '[join/route] Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );
    console.error(
      '[join/route] Error message:',
      error instanceof Error ? error.message : String(error)
    );

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
