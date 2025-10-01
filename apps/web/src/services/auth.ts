/**
 * Authentication Service
 * Service layer for authentication operations
 */

import { User, UserRole } from '@meetsolis/shared/types';
import { getDefaultRole } from '@/lib/auth/roles';

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

  const user: User = {
    id: clerkUserId,
    email,
    name,
    role,
    verified_badge: false,
    preferences: {
      auto_mute_on_join: false,
      default_video_off: false,
      preferred_view: 'gallery',
      theme: 'light',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // TODO: Store in Supabase when database is ready
  // For now, return the user object
  return user;
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

  // TODO: Update in Supabase when database is ready
  // For now, return a mock user
  const user: User = {
    id: clerkUserId,
    email,
    name,
    role: 'participant',
    verified_badge: false,
    preferences: {
      auto_mute_on_join: false,
      default_video_off: false,
      preferred_view: 'gallery',
      theme: 'light',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return user;
}

/**
 * Delete user profile from Supabase database
 * Called from Clerk webhook on user deletion
 */
export async function deleteUserProfile(clerkUserId: string): Promise<void> {
  // TODO: Delete from Supabase when database is ready
  console.log(`User ${clerkUserId} deleted`);
}

/**
 * Get user profile from Supabase database
 */
// eslint-disable-next-line no-unused-vars
export async function getUserProfile(
  _clerkUserId: string
): Promise<User | null> {
  // TODO: Fetch from Supabase when database is ready
  // For now, return null
  return null;
}
