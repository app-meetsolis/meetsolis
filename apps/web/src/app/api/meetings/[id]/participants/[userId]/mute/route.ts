import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';

// Validation schema
const MuteParticipantSchema = z.object({
  is_muted: z.boolean(),
});

// Initialize Supabase client
const supabase = createClient(
  config.supabase.url!,
  config.supabase.serviceRoleKey!
);

/**
 * PUT /api/meetings/[id]/participants/[userId]/mute
 * Host or co-host mutes a specific participant
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    // Authenticate user
    const { userId: requesterId } = auth();
    if (!requesterId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: meetingId, userId: participantId } = params;

    // Parse and validate request body
    const body = await request.json();
    const validation = MuteParticipantSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error },
        { status: 400 }
      );
    }

    const { is_muted } = validation.data;

    // First, look up the meeting by meeting_code to get the UUID
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('meeting_code', meetingId)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Verify requester is host or co-host (use meeting.id UUID, not meeting_code)
    const { data: requester, error: requesterError } = await supabase
      .from('participants')
      .select('role')
      .eq('meeting_id', meeting.id)
      .eq('user_id', requesterId)
      .single();

    if (requesterError || !requester) {
      return NextResponse.json(
        { error: 'You are not a participant of this meeting' },
        { status: 403 }
      );
    }

    if (requester.role !== 'host' && requester.role !== 'co-host') {
      return NextResponse.json(
        { error: 'Only hosts and co-hosts can mute participants' },
        { status: 403 }
      );
    }

    // Update participant mute state (use meeting.id UUID, not meeting_code)
    const { data: participant, error: updateError } = await supabase
      .from('participants')
      .update({ is_muted })
      .eq('meeting_id', meeting.id)
      .eq('user_id', participantId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update participant:', updateError);
      return NextResponse.json(
        { error: 'Failed to update participant state' },
        { status: 500 }
      );
    }

    // Log host action for audit (use meeting.id UUID, not meeting_code)
    await supabase.from('meeting_audit_log').insert({
      meeting_id: meeting.id,
      user_id: requesterId,
      action: is_muted ? 'mute_participant' : 'unmute_participant',
      target_user_id: participantId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      participant,
    });
  } catch (error) {
    console.error('Error in mute participant endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
