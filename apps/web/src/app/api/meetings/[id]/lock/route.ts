/**
 * Meeting Lock API
 * PUT /api/meetings/[id]/lock
 *
 * Locks or unlocks a meeting.
 * When locked, new participants cannot join.
 * Only host or co-host can lock/unlock meetings.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { config } from '@/lib/config/env';
import { logAudit } from '@/lib/audit/logger';
import { rateLimit } from '@/lib/rateLimit/middleware';

/**
 * Request body schema
 */
const LockRequestSchema = z.object({
  locked: z.boolean(),
});

/**
 * PUT /api/meetings/[id]/lock
 * Lock or unlock meeting
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id;

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
      console.warn('[Lock API] Rate limit exceeded:', clerkUserId);
      return rateLimitResult.response!;
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = LockRequestSchema.safeParse(body);

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

    const { locked } = validation.data;

    // Initialize Supabase client
    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );

    // Get current user's Supabase user ID
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !currentUser) {
      console.error('[Lock API] User lookup error:', userError);
      return NextResponse.json(
        { error: 'User not found', message: 'Failed to find user' },
        { status: 404 }
      );
    }

    // Check if user is a participant in this meeting
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, role')
      .eq('meeting_id', meetingId)
      .eq('user_id', currentUser.id)
      .is('leave_time', null)
      .single();

    if (participantError || !participant) {
      console.error('[Lock API] Participant lookup error:', participantError);
      return NextResponse.json(
        { error: 'Not a participant', message: 'You are not in this meeting' },
        { status: 403 }
      );
    }

    // Authorization: Only host or co-host can lock/unlock
    if (participant.role !== 'host' && participant.role !== 'co-host') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only host or co-host can lock/unlock the meeting',
        },
        { status: 403 }
      );
    }

    // Update meeting lock status
    const { error: updateError } = await supabase
      .from('meetings')
      .update({
        locked: locked,
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId);

    if (updateError) {
      console.error('[Lock API] Update error:', updateError);
      return NextResponse.json(
        {
          error: 'Update failed',
          message: 'Failed to update meeting lock status',
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    // Broadcast realtime event to all participants
    const channel = supabase.channel(`meeting:${meetingId}`);
    await channel.send({
      type: 'broadcast',
      event: 'meeting_locked',
      payload: {
        meeting_id: meetingId,
        locked,
        changed_by_user_id: currentUser.id,
      },
    });

    // Audit log the action
    await logAudit({
      supabase,
      userId: currentUser.id,
      meetingId,
      action: locked ? 'meeting_locked' : 'meeting_unlocked',
      metadata: { locked },
      request,
    });

    console.log('[Lock API] Meeting lock status updated:', {
      meetingId,
      locked,
      changed_by: currentUser.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          meeting_id: meetingId,
          locked,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Lock API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
