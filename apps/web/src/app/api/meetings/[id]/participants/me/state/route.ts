import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { config } from '@/lib/config/env';

// Validation schema
const UpdateStateSchema = z.object({
  is_muted: z.boolean().optional(),
  is_video_off: z.boolean().optional(),
});

// Initialize Supabase client
const supabase = createClient(
  config.supabase.url!,
  config.supabase.serviceRoleKey!
);

/**
 * PUT /api/meetings/[id]/participants/me/state
 * Update current user's mute/video state in the meeting
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: meetingId } = params;

    // Parse and validate request body
    const body = await request.json();
    const validation = UpdateStateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error },
        { status: 400 }
      );
    }

    const { is_muted, is_video_off } = validation.data;

    // First, look up the meeting by meeting_code to get the UUID
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('meeting_code', meetingId)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Get the user's database UUID from their Clerk ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user is a participant in this meeting (use meeting.id UUID, not meeting_code)
    const { data: participant, error: findError } = await supabase
      .from('participants')
      .select('id, is_muted, is_video_off')
      .eq('meeting_id', meeting.id)
      .eq('user_id', user.id)
      .single();

    if (findError || !participant) {
      return NextResponse.json(
        { error: 'You are not a participant in this meeting' },
        { status: 403 }
      );
    }

    // Update only the fields that were provided
    const updateData: { is_muted?: boolean; is_video_off?: boolean } = {};
    if (is_muted !== undefined) updateData.is_muted = is_muted;
    if (is_video_off !== undefined) updateData.is_video_off = is_video_off;

    // Update participant state
    const { data: updated, error: updateError } = await supabase
      .from('participants')
      .update(updateData)
      .eq('id', participant.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update participant state:', updateError);
      return NextResponse.json(
        { error: 'Failed to update state' },
        { status: 500 }
      );
    }

    // Broadcast the change via Supabase Realtime (bypasses RLS authentication)
    try {
      const clientSupabase = getSupabaseClient();
      const channelName = `meeting:${meeting.id}:participants`;

      console.log('[API] Broadcasting participant state update:', {
        channel: channelName,
        user_id: updated.user_id.substring(0, 8) + '...',
        is_muted: updated.is_muted,
        is_video_off: updated.is_video_off,
        timestamp: new Date().toISOString(),
      });

      const broadcastResult = await clientSupabase.channel(channelName).send({
        type: 'broadcast',
        event: 'participant_update',
        payload: {
          user_id: updated.user_id,
          meeting_id: updated.meeting_id,
          is_muted: updated.is_muted,
          is_video_off: updated.is_video_off,
          connection_quality: updated.connection_quality,
          updated_at: updated.updated_at,
        },
      });

      console.log('[API] Broadcast result:', {
        status: broadcastResult ? 'success' : 'unknown',
        channel: channelName,
      });
    } catch (broadcastError) {
      console.error('[API] Failed to broadcast participant update:', {
        error: broadcastError,
        channel: `meeting:${meeting.id}:participants`,
        user_id: updated.user_id,
      });
      // Don't fail the request if broadcast fails - participants will sync on next poll
    }

    return NextResponse.json({
      success: true,
      participant: updated,
    });
  } catch (error) {
    console.error('Error in participant state update endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
