/**
 * Profile API Routes
 * GET /api/profile - Fetch user profile
 * PUT /api/profile - Update user profile
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { config } from '@/lib/config/env';
import { getUserByClerkId } from '@/lib/helpers/user';
import { createUserProfile } from '@/services/auth';

// Request validation schema for profile updates
const UpdateProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  title: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  timezone: z.string().optional(),
  onboarding_completed: z.boolean().optional(),
});

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
 * GET /api/profile - Get user's profile
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

    // Fetch full user profile
    const { data: profile, error } = await supabase
      .from('users')
      .select(
        'id, clerk_id, email, name, display_name, title, bio, timezone, role, onboarding_completed, onboarding_completed_at, created_at, updated_at'
      )
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return NextResponse.json(profile);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile - Update user's profile
 */
export async function PUT(request: NextRequest) {
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
    const validation = UpdateProfileSchema.safeParse(body);
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

    // Build update object (only include fields that were provided)
    const updateData: any = {};

    if (validation.data.display_name !== undefined) {
      updateData.display_name = validation.data.display_name;
    }
    if (validation.data.title !== undefined) {
      updateData.title = validation.data.title;
    }
    if (validation.data.bio !== undefined) {
      updateData.bio = validation.data.bio;
    }
    if (validation.data.timezone !== undefined) {
      updateData.timezone = validation.data.timezone;
    }
    if (validation.data.onboarding_completed !== undefined) {
      updateData.onboarding_completed = validation.data.onboarding_completed;
      if (validation.data.onboarding_completed) {
        updateData.onboarding_completed_at = new Date().toISOString();
      }
    }

    // Update user profile
    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(updatedProfile, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
