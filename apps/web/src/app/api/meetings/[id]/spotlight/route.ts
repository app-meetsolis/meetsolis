/**
 * Spotlight API Endpoint
 * PUT /api/meetings/[id]/spotlight
 *
 * Sets or clears the spotlighted participant for a meeting.
 * Only host or co-host can spotlight participants.
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
const SpotlightRequestSchema = z.object({
  spotlight_participant_id: z.string().nullable(),
});

/**
 * PUT /api/meetings/[id]/spotlight
 * Set or clear spotlight for a participant
 */
export async function PUT(
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

    // Apply rate limiting (100 req/min per user)
    const rateLimitResult = await rateLimit(request, clerkUserId);
    if (!rateLimitResult.success) {
      console.warn('[Spotlight API] Rate limit exceeded:', clerkUserId);
      return rateLimitResult.response!;
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = SpotlightRequestSchema.safeParse(body);

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

    const { spotlight_participant_id } = validation.data;

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
      console.error('[Spotlight API] Meeting lookup error:', meetingError);
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
      console.error('[Spotlight API] User lookup error:', userError);
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
      .is('leave_time', null) // Correct column name
      .single();

    if (participantError || !participant) {
      console.error(
        '[Spotlight API] Participant lookup error:',
        participantError
      );
      return NextResponse.json(
        { error: 'Not a participant', message: 'You are not in this meeting' },
        { status: 403 }
      );
    }

    // Authorization: Only host or co-host can spotlight
    if (participant.role !== 'host' && participant.role !== 'co-host') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only host or co-host can spotlight participants',
        },
        { status: 403 }
      );
    }

    // If spotlight_participant_id is provided, verify it's a valid participant
    if (spotlight_participant_id) {
      const { data: spotlightParticipant, error: spotlightError } =
        await supabase
          .from('participants')
          .select('id')
          .eq('id', spotlight_participant_id)
          .eq('meeting_id', meetingId)
          .is('leave_time', null) // Correct column name
          .single();

      if (spotlightError || !spotlightParticipant) {
        return NextResponse.json(
          {
            error: 'Invalid participant',
            message: 'Spotlight participant not found in meeting',
          },
          { status: 404 }
        );
      }
    }

    // Update meeting spotlight
    const { error: updateError } = await supabase
      .from('meetings')
      .update({
        spotlight_participant_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId);

    if (updateError) {
      console.error('[Spotlight API] Update error:', updateError);
      return NextResponse.json(
        {
          error: 'Update failed',
          message: 'Failed to update spotlight',
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    // Broadcast realtime event to all participants
    const channel = supabase.channel(`meeting:${meetingId}`);
    await channel.send({
      type: 'broadcast',
      event: 'spotlight_changed',
      payload: {
        meeting_id: meetingId,
        spotlight_participant_id,
        changed_by_user_id: currentUser.id,
      },
    });

    // Audit log the action
    await logAudit({
      supabase,
      userId: currentUser.id,
      meetingId,
      action: spotlight_participant_id ? 'spotlight_set' : 'spotlight_clear',
      targetUserId: spotlight_participant_id,
      metadata: { spotlight_participant_id },
      request,
    });

    console.log('[Spotlight API] Spotlight updated:', {
      meetingId,
      spotlight_participant_id,
      changed_by: currentUser.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          meeting_id: meetingId,
          spotlight_participant_id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Spotlight API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
