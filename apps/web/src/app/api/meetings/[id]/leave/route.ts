import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { config } from '@/lib/config/env';

// Initialize Supabase client with service role key
const supabase = createClient(
  config.supabase.url!,
  config.supabase.serviceRoleKey!
);

/**
 * POST /api/meetings/[id]/leave
 * Handle participant leaving meeting
 * - Updates participant leave_time
 * - Ends meeting if organizer leaves or last participant leaves
 * - Broadcasts meeting_ended event to remaining participants
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: meetingCode } = params;

    // 2. Get user's database ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Fetch meeting by meeting_code
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, host_id, status, meeting_code')
      .eq('meeting_code', meetingCode)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // 4. Fetch participant record
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, leave_time')
      .eq('meeting_id', meeting.id)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'You are not a participant in this meeting' },
        { status: 404 }
      );
    }

    // 5. Validate participant hasn't already left
    if (participant.leave_time !== null) {
      return NextResponse.json(
        { error: 'You have already left this meeting' },
        { status: 400 }
      );
    }

    // 6. Get current active participant count (before this participant leaves)
    const { count: participantCount } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('meeting_id', meeting.id)
      .is('leave_time', null);

    const activeParticipantCount = participantCount ?? 0;

    // 7. Update participant record
    const { error: updateParticipantError } = await supabase
      .from('participants')
      .update({
        leave_time: new Date().toISOString(),
        status: 'left',
      })
      .eq('id', participant.id);

    if (updateParticipantError) {
      console.error('Failed to update participant:', updateParticipantError);
      return NextResponse.json(
        { error: 'Failed to leave meeting' },
        { status: 500 }
      );
    }

    // 8. Check if this was the organizer or last participant
    const isOrganizer = user.id === meeting.host_id;
    const isLastParticipant = activeParticipantCount === 1;

    let meetingEnded = false;

    // 9. End meeting if organizer leaves or last participant leaves
    if ((isOrganizer || isLastParticipant) && meeting.status === 'active') {
      const { error: endMeetingError } = await supabase
        .from('meetings')
        .update({
          status: 'ended',
          actual_end: new Date().toISOString(),
        })
        .eq('id', meeting.id);

      if (endMeetingError) {
        console.error('Failed to end meeting:', endMeetingError);
        // Don't fail the request - participant left successfully
      } else {
        meetingEnded = true;

        // 10. Broadcast meeting_ended event to remaining participants
        try {
          const clientSupabase = getSupabaseClient();
          const channelName = `meeting:${meeting.id}:participants`;

          console.log('[API] Broadcasting meeting_ended event:', {
            channel: channelName,
            ended_by_host: isOrganizer,
            participant_count_before_leave: activeParticipantCount,
            timestamp: new Date().toISOString(),
          });

          const broadcastResult = await clientSupabase
            .channel(channelName)
            .send({
              type: 'broadcast',
              event: 'meeting_ended',
              payload: {
                meeting_id: meeting.id,
                ended_by_host: isOrganizer,
                ended_at: new Date().toISOString(),
                participant_count_before_leave: activeParticipantCount,
              },
            });

          console.log('[API] Meeting ended broadcast result:', {
            status: broadcastResult ? 'success' : 'unknown',
            channel: channelName,
          });
        } catch (broadcastError) {
          console.error('[API] Failed to broadcast meeting_ended:', {
            error: broadcastError,
            channel: `meeting:${meeting.id}:participants`,
            meeting_id: meeting.id,
          });
          // Don't fail the request if broadcast fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      meeting_ended: meetingEnded,
      message: meetingEnded
        ? 'Meeting ended successfully'
        : 'Left meeting successfully',
    });
  } catch (error) {
    console.error('Error in leave meeting endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
