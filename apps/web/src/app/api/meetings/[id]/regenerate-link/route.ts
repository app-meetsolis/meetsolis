/**
 * Regenerate Meeting Link API Route
 * POST /api/meetings/[id]/regenerate-link - Regenerate invite link (host only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto';
import { config } from '@/lib/config/env';
import { getUserByClerkId } from '@/lib/helpers/user';

const RegenerateLinkSchema = z.object({
  expiresIn: z.enum(['never', '24h', '7d', '30d']).optional().default('never'),
});

// Helper function to calculate expiration timestamp (Story 2.5 AC 10)
function calculateExpiration(
  expiresIn: '24h' | '7d' | '30d' | 'never'
): string | null {
  if (expiresIn === 'never') return null;

  const now = Date.now();
  let expirationMs: number;

  switch (expiresIn) {
    case '24h':
      expirationMs = 24 * 60 * 60 * 1000; // 24 hours
      break;
    case '7d':
      expirationMs = 7 * 24 * 60 * 60 * 1000; // 7 days
      break;
    case '30d':
      expirationMs = 30 * 24 * 60 * 60 * 1000; // 30 days
      break;
    default:
      return null;
  }

  return new Date(now + expirationMs).toISOString();
}

/**
 * POST /api/meetings/[id]/regenerate-link - Regenerate invite link
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );

    // Get user's database ID
    const user = await getUserByClerkId(supabase, userId);

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validation = RegenerateLinkSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: validation.error.errors[0].message,
          },
        },
        { status: 400 }
      );
    }

    // Check if meeting exists
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('meeting_code', params.id)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Meeting not found' } },
        { status: 404 }
      );
    }

    // Check if user is host (authorization)
    if (meeting.host_id !== user.id) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Only the host can regenerate invite links',
          },
        },
        { status: 403 }
      );
    }

    // Generate new secure invite token and calculate expiration
    const newInviteToken = crypto.randomUUID();
    const newExpiresAt = calculateExpiration(validation.data.expiresIn);

    // Update meeting with new invite token and expiration
    const { data: updatedMeeting, error: updateError } = await supabase
      .from('meetings')
      .update({
        invite_token: newInviteToken,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', meeting.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(
      {
        invite_token: newInviteToken,
        expires_at: newExpiresAt,
        invite_url: `${config.app.url}/meeting/join/${newInviteToken}`,
        message: 'Invite link regenerated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[regenerate-link/route] API Error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
