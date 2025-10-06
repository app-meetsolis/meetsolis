/**
 * Single Meeting API Routes
 * GET /api/meetings/[id] - Get meeting by ID
 * PATCH /api/meetings/[id] - Update meeting
 * DELETE /api/meetings/[id] - Delete meeting
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { config } from '@/lib/config/env';
import { getUserByClerkId } from '@/lib/helpers/user';

const UpdateMeetingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['scheduled', 'active', 'ended']).optional(),
  locked: z.boolean().optional(),
  settings: z
    .object({
      allow_screen_share: z.boolean().optional(),
      allow_whiteboard: z.boolean().optional(),
      allow_file_upload: z.boolean().optional(),
      auto_record: z.boolean().optional(),
      enable_reactions: z.boolean().optional(),
      enable_polls: z.boolean().optional(),
      background_blur_default: z.boolean().optional(),
    })
    .optional(),
});

/**
 * GET /api/meetings/[id] - Get meeting by ID
 */
export async function GET(
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

    // Fetch meeting (RLS will ensure user has access)
    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !meeting) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Meeting not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/meetings/[id] - Update meeting
 */
export async function PATCH(
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

    const body = await request.json();
    const validation = UpdateMeetingSchema.safeParse(body);
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

    // Fetch existing meeting to verify ownership
    const { data: existingMeeting } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!existingMeeting) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Meeting not found' } },
        { status: 404 }
      );
    }

    if (existingMeeting.host_id !== user.id) {
      return NextResponse.json(
        {
          error: { code: 'FORBIDDEN', message: 'Only host can update meeting' },
        },
        { status: 403 }
      );
    }

    // Update meeting
    const updateData: any = { ...validation.data };

    // If settings are provided, merge with existing settings
    if (validation.data.settings) {
      updateData.settings = {
        ...existingMeeting.settings,
        ...validation.data.settings,
      };
    }

    const { data: meeting, error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/meetings/[id] - Delete meeting
 */
export async function DELETE(
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

    // Verify meeting exists and user is host
    const { data: meeting } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!meeting) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Meeting not found' } },
        { status: 404 }
      );
    }

    if (meeting.host_id !== user.id) {
      return NextResponse.json(
        {
          error: { code: 'FORBIDDEN', message: 'Only host can delete meeting' },
        },
        { status: 403 }
      );
    }

    // Delete meeting
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
