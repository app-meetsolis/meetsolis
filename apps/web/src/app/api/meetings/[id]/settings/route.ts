/**
 * Meeting Settings API
 * Story 2.4 - Update meeting settings (host only)
 *
 * PUT /api/meetings/[id]/settings - Update meeting settings
 * Broadcasts settings changes to all participants via Realtime
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Zod schema for meeting settings
const settingsSchema = z.object({
  settings: z.object({
    chat_enabled: z.boolean().optional(),
    private_chat_enabled: z.boolean().optional(),
    file_uploads_enabled: z.boolean().optional(),
  }),
});

/**
 * PUT /api/meetings/[id]/settings
 * Update meeting settings (host only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meetingIdOrCode = params.id;

    // Parse and validate request body
    const body = await req.json();
    const validation = settingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { settings: newSettings } = validation.data;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if meetingId is UUID or meeting_code
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        meetingIdOrCode
      );

    // Get current user from Clerk ID
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get meeting and verify user is host
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, host_id, settings')
      .eq(isUUID ? 'id' : 'meeting_code', meetingIdOrCode)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Only host can update settings
    if (meeting.host_id !== currentUser.id) {
      return NextResponse.json(
        { error: 'Only host can update meeting settings' },
        { status: 403 }
      );
    }

    // Merge new settings with existing settings
    const updatedSettings = {
      ...(meeting.settings || {}),
      ...newSettings,
    };

    // Update meeting settings
    const { data: updatedMeeting, error: updateError } = await supabase
      .from('meetings')
      .update({ settings: updatedSettings })
      .eq('id', meeting.id) // Use actual meeting UUID
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update meeting settings:', updateError);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    // Broadcast settings change to all participants via Realtime
    const channelName = `meeting:${meeting.id}:settings`;
    console.log('[Settings API] Broadcasting settings update:', {
      channelName,
      meetingId: meeting.id,
      newSettings,
    });

    try {
      await supabase.channel(channelName).send({
        type: 'broadcast',
        event: 'settings_updated',
        payload: {
          meeting_id: meeting.id,
          settings: updatedSettings,
          updated_at: new Date().toISOString(),
        },
      });
      console.log('[Settings API] ✅ Broadcast sent successfully');
    } catch (broadcastError) {
      console.error('[Settings API] Failed to broadcast:', broadcastError);
      // Don't fail the request if broadcast fails
    }

    return NextResponse.json({
      meeting: updatedMeeting,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Error in PUT /api/meetings/[id]/settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
