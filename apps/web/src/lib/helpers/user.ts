/**
 * User Helper Functions
 *
 * Reusable helper functions for user-related operations.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get user's database ID from their Clerk ID
 *
 * This function queries the users table to find the database record
 * corresponding to a Clerk authentication ID.
 *
 * @param supabase - Supabase client instance
 * @param clerkId - User's Clerk authentication ID
 * @returns User database record with ID, or null if not found
 *
 * @example
 * ```typescript
 * const user = await getUserByClerkId(supabase, userId);
 * if (!user) {
 *   return NextResponse.json(
 *     { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
 *     { status: 404 }
 *   );
 * }
 * ```
 */
export async function getUserByClerkId(
  supabase: SupabaseClient,
  clerkId: string
): Promise<{ id: string; name: string | null; email: string } | null> {
  const { data } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('clerk_id', clerkId)
    .single();

  return data;
}

/**
 * Get user's internal database UUID from their Clerk ID.
 * Convenience wrapper over getUserByClerkId — returns just the id string.
 */
export async function getInternalUserId(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<string | null> {
  const user = await getUserByClerkId(supabase, clerkUserId);
  return user?.id ?? null;
}
