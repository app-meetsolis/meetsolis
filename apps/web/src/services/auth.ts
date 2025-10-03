/**
 * Authentication Service
 * Service layer for authentication operations with Supabase sync
 */

import {
  User,
  UserRole,
  UserInsert,
  UserUpdate,
} from '@meetsolis/shared/types';
import { getDefaultRole } from '@/lib/auth/roles';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { executeQuery } from '@/lib/supabase/utils';

/**
 * Create user profile in Supabase database
 * Called from Clerk webhook on user creation
 */
export async function createUserProfile(
  clerkUserId: string,
  email: string,
  firstName: string,
  lastName: string
): Promise<User> {
  const name = `${firstName} ${lastName}`.trim() || 'User';
  const role: UserRole = getDefaultRole();

  const supabase = getSupabaseServerClient();

  const userInsert: UserInsert = {
    clerk_id: clerkUserId,
    email,
    name,
    role,
    verified_badge: false,
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      meeting_defaults: {
        waiting_room: true,
        mute_on_join: false,
        video_on_join: true,
      },
    },
  };

  const result = await executeQuery(
    supabase.from('users').insert(userInsert).select().single() as any
  );

  if (!result.success) {
    console.error('Failed to create user in Supabase:', result.error);
    throw new Error(`Failed to create user: ${result.error}`);
  }

  return result.data as User;
}

/**
 * Update user profile in Supabase database
 * Called from Clerk webhook on user update
 */
export async function updateUserProfile(
  clerkUserId: string,
  email: string,
  firstName: string,
  lastName: string
): Promise<User | null> {
  const name = `${firstName} ${lastName}`.trim() || 'User';

  const supabase = getSupabaseServerClient();

  const userUpdate: UserUpdate = {
    email,
    name,
  };

  const result = await executeQuery(
    supabase
      .from('users')
      .update(userUpdate)
      .eq('clerk_id', clerkUserId)
      .select()
      .single() as any
  );

  if (!result.success) {
    console.error('Failed to update user in Supabase:', result.error);
    return null;
  }

  return result.data as User;
}

/**
 * Delete user profile from Supabase database
 * Called from Clerk webhook on user deletion
 */
export async function deleteUserProfile(clerkUserId: string): Promise<void> {
  const supabase = getSupabaseServerClient();

  // Hard delete from database (CASCADE will handle related records)
  const result = await executeQuery(
    supabase.from('users').delete().eq('clerk_id', clerkUserId) as any
  );

  if (!result.success) {
    console.error('Failed to delete user from Supabase:', result.error);
    throw new Error(`Failed to delete user: ${result.error}`);
  }

  console.log(`User ${clerkUserId} deleted from Supabase`);
}

/**
 * Get user profile from Supabase database
 */
export async function getUserProfile(
  clerkUserId: string
): Promise<User | null> {
  const supabase = getSupabaseServerClient();

  const result = await executeQuery(
    supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkUserId)
      .single() as any
  );

  if (!result.success) {
    console.error('Failed to get user from Supabase:', result.error);
    return null;
  }

  return result.data as User;
}
