/**
 * Waiting Room Reject API
 * DELETE /api/meetings/[id]/waiting-room/reject
 *
 * Rejects a participant from the waiting room.
 * Only host or co-host can reject participants.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { config } from '@/lib/config/env';

/**
 * Request body schema
 */
const RejectRequestSchema = z.object({
  user_id: z.string().uuid(),
});

/**
 * DELETE /api/meetings/[id]/waiting-room/reject
 * Reject participant from waiting room
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetingCode = params.id;

    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = RejectRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid request body',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { user_id: targetUserId } = validation.data;

    // Initialize Supabase client
    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );

    // Look up meeting by meeting_code to get UUID
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('meeting_code', meetingCode)
      .single();

    if (meetingError || !meeting) {
      console.error('[Reject API] Meeting lookup error:', meetingError);
      return NextResponse.json(
        { error: 'Meeting not found', message: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meetingId = meeting.id; // Use UUID for database queries

    // Get current user's Supabase user ID
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !currentUser) {
      console.error('[Reject API] User lookup error:', userError);
      return NextResponse.json(
        { error: 'User not found', message: 'Failed to find user' },
        { status: 404 }
      );
    }

    // Check if user is host or co-host
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, role')
      .eq('meeting_id', meetingId)
      .eq('user_id', currentUser.id)
      .is('leave_time', null)
      .single();

    if (participantError || !participant) {
      console.error('[Reject API] Participant lookup error:', participantError);
      return NextResponse.json(
        { error: 'Not a participant', message: 'You are not in this meeting' },
        { status: 403 }
      );
    }

    // Authorization: Only host or co-host can reject
    if (participant.role !== 'host' && participant.role !== 'co-host') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only host or co-host can reject participants',
        },
        { status: 403 }
      );
    }

    // Get waiting room participant
    const { data: waitingParticipant, error: waitingError } = await supabase
      .from('waiting_room_participants')
      .select('*')
      .eq('meeting_id', meetingId)
      .eq('user_id', targetUserId)
      .eq('status', 'waiting')
      .single();

    if (waitingError || !waitingParticipant) {
      console.error(
        '[Reject API] Waiting participant lookup error:',
        waitingError
      );
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Participant not found in waiting room',
        },
        { status: 404 }
      );
    }

    // Update waiting room status to rejected
    const { error: updateError } = await supabase
      .from('waiting_room_participants')
      .update({ status: 'rejected' })
      .eq('id', waitingParticipant.id);

    if (updateError) {
      console.error('[Reject API] Update error:', updateError);
      return NextResponse.json(
        {
          error: 'Update failed',
          message: 'Failed to reject participant',
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    // Broadcast realtime event to notify the rejected participant
    const channel = supabase.channel(`meeting:${meetingId}:participants`);
    await channel.send({
      type: 'broadcast',
      event: 'waiting_room_event',
      payload: {
        meeting_id: meetingId,
        user_id: targetUserId,
        status: 'rejected',
        action_by_user_id: currentUser.id,
      },
    });
    await channel.unsubscribe(); // Clean up channel after sending

    console.log('[Reject API] Participant rejected:', {
      meetingId,
      targetUserId,
      rejected_by: currentUser.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          user_id: targetUserId,
          status: 'rejected',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Reject API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
