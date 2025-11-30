import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';

// Validation schema
const MuteAllSchema = z.object({
  exclude_host: z.boolean().optional().default(true),
});

// Initialize Supabase client
const supabase = createClient(
  config.supabase.url!,
  config.supabase.serviceRoleKey!
);

/**
 * PUT /api/meetings/[id]/participants/mute-all
 * Host mutes all participants in the meeting
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId: requesterId } = auth();
    if (!requesterId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: meetingId } = params;

    // Parse and validate request body
    const body = await request.json();
    const validation = MuteAllSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error },
        { status: 400 }
      );
    }

    const { exclude_host } = validation.data;

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
        { error: 'Only hosts and co-hosts can mute all participants' },
        { status: 403 }
      );
    }

    // Build update query (use meeting.id UUID, not meeting_code)
    let query = supabase
      .from('participants')
      .update({ is_muted: true })
      .eq('meeting_id', meeting.id);

    // Exclude host if specified
    if (exclude_host) {
      query = query.not('role', 'eq', 'host');
    }

    // Update all participants
    const { data: participants, error: updateError } = await query.select();

    if (updateError) {
      console.error('Failed to mute all participants:', updateError);
      return NextResponse.json(
        { error: 'Failed to mute participants' },
        { status: 500 }
      );
    }

    // Log host action for audit (use meeting.id UUID, not meeting_code)
    await supabase.from('meeting_audit_log').insert({
      meeting_id: meeting.id,
      user_id: requesterId,
      action: 'mute_all_participants',
      metadata: { exclude_host, participant_count: participants?.length || 0 },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      muted_count: participants?.length || 0,
      participants,
    });
  } catch (error) {
    console.error('Error in mute-all endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
