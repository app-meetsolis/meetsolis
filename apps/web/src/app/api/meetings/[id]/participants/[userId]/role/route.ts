/**
 * Participant Role Management API
 * PUT /api/meetings/[id]/participants/[userId]/role
 *
 * Changes a participant's role (promote/demote).
 * Only the host can change roles.
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
const RoleRequestSchema = z.object({
  role: z.enum(['host', 'co-host', 'participant']),
});

/**
 * PUT /api/meetings/[id]/participants/[userId]/role
 * Change participant's role
 */
export async function PUT(
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
      console.warn('[Role API] Rate limit exceeded:', clerkUserId);
      return rateLimitResult.response!;
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = RoleRequestSchema.safeParse(body);

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

    const { role: newRole } = validation.data;

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
      console.error('[Role API] Meeting lookup error:', meetingError);
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
      console.error('[Role API] User lookup error:', userError);
      return NextResponse.json(
        { error: 'User not found', message: 'Failed to find user' },
        { status: 404 }
      );
    }

    // Check if current user is the host
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
        '[Role API] Current participant lookup error:',
        currentParticipantError
      );
      return NextResponse.json(
        { error: 'Not a participant', message: 'You are not in this meeting' },
        { status: 403 }
      );
    }

    // Authorization: Only host can change roles
    if (currentParticipant.role !== 'host') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only the host can change participant roles',
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
      console.error('[Role API] Target participant lookup error:', targetError);
      return NextResponse.json(
        {
          error: 'Participant not found',
          message: 'Target participant not found in meeting',
        },
        { status: 404 }
      );
    }

    // Prevent demoting the last host
    if (targetParticipant.role === 'host' && newRole !== 'host') {
      // Count remaining hosts
      const { count, error: countError } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('meeting_id', meetingId)
        .eq('role', 'host')
        .is('leave_time', null); // Correct column name

      if (countError) {
        console.error('[Role API] Host count error:', countError);
        return NextResponse.json(
          {
            error: 'Server error',
            message: 'Failed to verify host count',
          },
          { status: 500 }
        );
      }

      if (count && count <= 1) {
        return NextResponse.json(
          {
            error: 'Invalid operation',
            message:
              'Cannot demote the last host. Promote another participant first.',
          },
          { status: 400 }
        );
      }
    }

    // Update participant role
    const { error: updateError } = await supabase
      .from('participants')
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetParticipantId);

    if (updateError) {
      console.error('[Role API] Update error:', updateError);
      return NextResponse.json(
        {
          error: 'Update failed',
          message: 'Failed to update participant role',
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    // Broadcast realtime event to all participants
    const channel = supabase.channel(`meeting:${meetingId}`);
    await channel.send({
      type: 'broadcast',
      event: 'participant_role_changed',
      payload: {
        meeting_id: meetingId,
        user_id: targetParticipant.user_id,
        new_role: newRole,
        changed_by_user_id: currentUser.id,
      },
    });

    // Audit log the action (promotion or demotion)
    const oldRole = targetParticipant.role;
    const isPromotion =
      (oldRole === 'participant' && newRole === 'co-host') ||
      (oldRole === 'participant' && newRole === 'host') ||
      (oldRole === 'co-host' && newRole === 'host');

    await logAudit({
      supabase,
      userId: currentUser.id,
      meetingId,
      action: isPromotion ? 'participant_promoted' : 'participant_demoted',
      targetUserId: targetParticipant.user_id,
      metadata: {
        old_role: oldRole,
        new_role: newRole,
        participant_id: targetParticipantId,
      },
      request,
    });

    console.log('[Role API] Role updated:', {
      meetingId,
      targetParticipantId,
      newRole,
      changed_by: currentUser.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          participant_id: targetParticipantId,
          new_role: newRole,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Role API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
