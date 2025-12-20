/**
 * Hand Raise API
 * Story 2.4 - Hand raise functionality
 *
 * PUT /api/meetings/[id]/participants/[userId]/hand-raise - Raise/lower hand
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Zod schema for hand raise
const handRaiseSchema = z.object({
  hand_raised: z.boolean(),
});

/**
 * PUT /api/meetings/[id]/participants/[userId]/hand-raise
 * Raise or lower hand
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meetingId = params.id;
    const targetUserId = params.userId;

    console.log('[hand-raise] Request received:', {
      meetingId,
      targetUserId,
      clerkUserId,
    });

    // Parse and validate request body
    const body = await req.json();
    const validation = handRaiseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { hand_raised } = validation.data;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user from Clerk ID
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !currentUser) {
      console.error('[hand-raise] Current user not found:', {
        clerkUserId,
        error: userError,
      });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if meetingId is UUID or meeting_code
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        meetingId
      );

    // Look up meeting by id or meeting_code
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, host_id')
      .eq(isUUID ? 'id' : 'meeting_code', meetingId)
      .single();

    if (meetingError || !meeting) {
      console.error('[hand-raise] Meeting not found:', {
        meetingId,
        error: meetingError,
      });
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const isHost = meeting.host_id === currentUser.id;
    const isSelf = targetUserId === clerkUserId; // Compare Clerk IDs

    // Users can raise their own hand, hosts can lower any hand
    if (!isSelf && !isHost) {
      return NextResponse.json(
        { error: 'Only host can lower other participants hands' },
        { status: 403 }
      );
    }

    // If raising hand, must be self
    if (hand_raised && !isSelf) {
      return NextResponse.json(
        { error: 'Can only raise your own hand' },
        { status: 403 }
      );
    }

    // Get target user's database ID from Clerk ID
    const { data: targetUser, error: targetUserError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', targetUserId)
      .single();

    if (targetUserError || !targetUser) {
      console.error('[hand-raise] Target user not found:', {
        targetUserId,
        error: targetUserError,
      });
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }

    // Update participant hand_raised status
    const updateData: any = {
      hand_raised,
    };

    if (hand_raised) {
      updateData.hand_raised_at = new Date().toISOString();
    } else {
      updateData.hand_raised_at = null;
    }

    const { data: participant, error: updateError } = await supabase
      .from('participants')
      .update(updateData)
      .eq('meeting_id', meeting.id) // Use database meeting UUID
      .eq('user_id', targetUser.id) // Use database user ID
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update hand raise:', updateError);
      return NextResponse.json(
        { error: 'Failed to update hand raise' },
        { status: 500 }
      );
    }

    return NextResponse.json({ participant });
  } catch (error) {
    console.error(
      'Error in PUT /api/meetings/[id]/participants/[userId]/hand-raise:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
