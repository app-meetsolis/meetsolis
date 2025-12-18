/**
 * Remove Participant API
 * DELETE /api/meetings/[id]/participants/[userId]/remove
 *
 * Removes a participant from the meeting.
 * Host/co-host can remove participants (but cannot remove host).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { config } from '@/lib/config/env';
import { logAudit } from '@/lib/audit/logger';
import { rateLimit } from '@/lib/rateLimit/middleware';

/**
 * DELETE /api/meetings/[id]/participants/[userId]/remove
 * Remove participant from meeting
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const meetingCode = params.id;
    const targetParticipantId = params.userId;

    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Apply rate limiting (100 req/min per user)
    const rateLimitResult = await rateLimit(request, clerkUserId);
    if (!rateLimitResult.success) {
      console.warn('[Remove API] Rate limit exceeded:', clerkUserId);
      return rateLimitResult.response!;
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
      console.error('[Remove API] Meeting lookup error:', meetingError);
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
      console.error('[Remove API] User lookup error:', userError);
      return NextResponse.json(
        { error: 'User not found', message: 'Failed to find user' },
        { status: 404 }
      );
    }

    // Check if current user is host or co-host
    const { data: currentParticipant, error: currentParticipantError } =
      await supabase
        .from('participants')
        .select('id, role')
        .eq('meeting_id', meetingId)
        .eq('user_id', currentUser.id)
        .is('leave_time', null) // Correct column name
        .single();

    if (currentParticipantError || !currentParticipant) {
      console.error(
        '[Remove API] Current participant lookup error:',
        currentParticipantError
      );
      return NextResponse.json(
        { error: 'Not a participant', message: 'You are not in this meeting' },
        { status: 403 }
      );
    }

    // Authorization: Only host or co-host can remove participants
    if (
      currentParticipant.role !== 'host' &&
      currentParticipant.role !== 'co-host'
    ) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only host or co-host can remove participants',
        },
        { status: 403 }
      );
    }

    // Get target participant
    const { data: targetParticipant, error: targetError } = await supabase
      .from('participants')
      .select('id, role, user_id')
      .eq('id', targetParticipantId)
      .eq('meeting_id', meetingId)
      .is('leave_time', null) // Correct column name
      .single();

    if (targetError || !targetParticipant) {
      console.error(
        '[Remove API] Target participant lookup error:',
        targetError
      );
      return NextResponse.json(
        {
          error: 'Participant not found',
          message: 'Target participant not found in meeting',
        },
        { status: 404 }
      );
    }

    // Prevent removing the host
    if (targetParticipant.role === 'host') {
      return NextResponse.json(
        {
          error: 'Invalid operation',
          message: 'Cannot remove the host from the meeting',
        },
        { status: 400 }
      );
    }

    // Remove participant by setting leave_time timestamp
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('participants')
      .update({
        leave_time: now, // Correct column name
        updated_at: now,
      })
      .eq('id', targetParticipantId);

    if (updateError) {
      console.error('[Remove API] Update error:', updateError);
      return NextResponse.json(
        {
          error: 'Update failed',
          message: 'Failed to remove participant',
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    // Broadcast realtime event to all participants (including the removed one)
    const channel = supabase.channel(`meeting:${meetingId}`);
    await channel.send({
      type: 'broadcast',
      event: 'participant_removed',
      payload: {
        meeting_id: meetingId,
        user_id: targetParticipant.user_id,
        removed_by_user_id: currentUser.id,
        removed_at: now,
      },
    });

    // Audit log the action
    await logAudit({
      supabase,
      userId: currentUser.id,
      meetingId,
      action: 'participant_removed',
      targetUserId: targetParticipant.user_id,
      metadata: {
        participant_id: targetParticipantId,
        target_role: targetParticipant.role,
        removed_at: now,
      },
      request,
    });

    console.log('[Remove API] Participant removed:', {
      meetingId,
      targetParticipantId,
      removed_by: currentUser.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          participant_id: targetParticipantId,
          removed_at: now,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Remove API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
