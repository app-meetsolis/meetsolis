/**
 * Waiting Room API
 * GET /api/meetings/[id]/waiting-room
 *
 * Lists all participants currently in the waiting room.
 * Only host or co-host can view the waiting room.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { config } from '@/lib/config/env';

/**
 * GET /api/meetings/[id]/waiting-room
 * List participants in waiting room
 */
export async function GET(
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
      console.error('[Waiting Room API] Meeting lookup error:', meetingError);
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
      console.error('[Waiting Room API] User lookup error:', userError);
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
      console.error(
        '[Waiting Room API] Participant lookup error:',
        participantError
      );
      return NextResponse.json(
        { error: 'Not a participant', message: 'You are not in this meeting' },
        { status: 403 }
      );
    }

    // Authorization: Only host or co-host can view waiting room
    if (participant.role !== 'host' && participant.role !== 'co-host') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only host or co-host can view the waiting room',
        },
        { status: 403 }
      );
    }

    // Get active participants (to filter them out from waiting room)
    const { data: activeParticipants } = await supabase
      .from('participants')
      .select('user_id')
      .eq('meeting_id', meetingId)
      .is('leave_time', null);

    const activeUserIds = new Set(
      activeParticipants?.map(p => p.user_id) || []
    );

    // Get waiting room participants
    const { data: waitingParticipants, error: waitingError } = await supabase
      .from('waiting_room_participants')
      .select('id, user_id, display_name, joined_at, status')
      .eq('meeting_id', meetingId)
      .eq('status', 'waiting')
      .order('joined_at', { ascending: true });

    if (waitingError) {
      console.error('[Waiting Room API] Query error:', waitingError);
      return NextResponse.json(
        {
          error: 'Query failed',
          message: 'Failed to fetch waiting room participants',
          details: waitingError.message,
        },
        { status: 500 }
      );
    }

    // Filter out users who are already active participants
    const filteredWaitingParticipants =
      waitingParticipants?.filter(p => !activeUserIds.has(p.user_id)) || [];

    console.log('[Waiting Room API] Fetched waiting participants:', {
      meetingId,
      total: waitingParticipants?.length || 0,
      filtered: filteredWaitingParticipants.length,
      activeParticipants: activeUserIds.size,
    });

    return NextResponse.json(
      {
        success: true,
        data: filteredWaitingParticipants,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Waiting Room API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
