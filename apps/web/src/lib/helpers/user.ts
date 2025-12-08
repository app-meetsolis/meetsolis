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
): Promise<{ id: string; name: string | null } | null> {
  const { data } = await supabase
    .from('users')
    .select('id, name')
    .eq('clerk_id', clerkId)
    .single();

  return data;
}
