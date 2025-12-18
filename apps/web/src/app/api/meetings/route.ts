/**
 * Meetings API Routes
 * GET /api/meetings - Fetch user's meetings
 * POST /api/meetings - Create a new meeting
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { config } from '@/lib/config/env';
import { getUserByClerkId } from '@/lib/helpers/user';
import { createUserProfile } from '@/services/auth';

// Request validation schema
const CreateMeetingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().nullish(), // Allow null, undefined, or string
  scheduled_start: z.string().nullish(),
  waiting_room_enabled: z.boolean().optional().default(true), // Enable by default
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

// Helper function to generate unique meeting code and invite link
function generateMeetingCodeAndLink(): { code: string; link: string } {
  const meetingCode = nanoid(10);
  return {
    code: meetingCode,
    link: `${config.app.url}/meeting/${meetingCode}`,
  };
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
 * Get user from Supabase, or create if doesn't exist
 * This is a fallback for when webhooks aren't configured
 */
async function getOrCreateUser(supabase: any, userId: string) {
  // Try to get existing user
  const user = await getUserByClerkId(supabase, userId);

  // If user doesn't exist, create them from Clerk data
  if (!user) {
    console.log(`User ${userId} not found in Supabase, creating from Clerk...`);

    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error('Unable to fetch user from Clerk');
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? '';
    const firstName = clerkUser.firstName ?? '';
    const lastName = clerkUser.lastName ?? '';

    // Create user in Supabase
    const newUser = await createUserProfile(userId, email, firstName, lastName);

    return { id: newUser.id };
  }

  return user;
}

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
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );

    // Get user's database ID from clerk_id (or create if doesn't exist)
    const user = await getOrCreateUser(supabase, userId);

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
      .eq('host_id', user.id)
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
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );

    // Get user's database ID from clerk_id (or create if doesn't exist)
    const user = await getOrCreateUser(supabase, userId);

    // Merge default settings with provided settings
    const settings = {
      ...defaultMeetingSettings,
      ...(validation.data.settings || {}),
    };

    // Generate meeting code and invite link
    const { code, link } = generateMeetingCodeAndLink();

    // Insert meeting record
    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        host_id: user.id,
        title: validation.data.title,
        description: validation.data.description,
        status: validation.data.scheduled_start ? 'scheduled' : 'active',
        scheduled_start: validation.data.scheduled_start,
        meeting_code: code,
        invite_link: link,
        settings,
        waiting_room_enabled: validation.data.waiting_room_enabled,
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
