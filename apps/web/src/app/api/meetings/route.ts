/**
 * Meetings API Routes
 * GET /api/meetings - Fetch user's meetings
 * POST /api/meetings - Create a new meeting
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { nanoid } from 'nanoid';

// Request validation schema
const CreateMeetingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  scheduled_start: z.string().optional(),
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

// Helper function to generate unique invite link
function generateInviteLink(): string {
  const meetingId = nanoid(10);
  return `${process.env.NEXT_PUBLIC_APP_URL}/meeting/${meetingId}`;
}

// Default meeting settings
const defaultMeetingSettings = {
  allow_screen_share: true,
  allow_whiteboard: true,
  allow_file_upload: true,
  auto_record: false,
  enable_reactions: true,
  enable_polls: true,
  background_blur_default: false,
};

/**
 * GET /api/meetings - Get user's meetings
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's database ID from clerk_id
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build query
    let query = supabase
      .from('meetings')
      .select('*')
      .or(`host_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data: meetings, error } = await query;

    if (error) throw error;

    return NextResponse.json(meetings);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/meetings - Create new meeting
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateMeetingSchema.safeParse(body);
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
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's database ID from clerk_id
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Merge default settings with provided settings
    const settings = {
      ...defaultMeetingSettings,
      ...(validation.data.settings || {}),
    };

    // Insert meeting record
    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        host_id: user.id,
        title: validation.data.title,
        description: validation.data.description,
        status: validation.data.scheduled_start ? 'scheduled' : 'active',
        scheduled_start: validation.data.scheduled_start,
        invite_link: generateInviteLink(),
        settings,
        waiting_room_enabled: false,
        locked: false,
        max_participants: 100,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
