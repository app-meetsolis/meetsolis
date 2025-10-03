/**
 * Supabase Database Utilities
 *
 * Common utility functions for database operations,
 * error handling, and data transformations.
 */

import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Database operation result type
 */
export type DbResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Handle Supabase errors with standardized error messages
 */
export function handleSupabaseError(error: PostgrestError | null): string {
  if (!error) return 'Unknown database error';

  // Map common Postgres error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    '23505': 'A record with this information already exists',
    '23503': 'Referenced record does not exist',
    '23502': 'Required field is missing',
    '42P01': 'Database table not found',
    PGRST116: 'No rows returned from query',
  };

  return errorMessages[error.code] || error.message;
}

/**
 * Wrap Supabase query results in standardized format
 */
export async function executeQuery<T>(
  queryPromise: Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<DbResult<T>> {
  try {
    const { data, error } = await queryPromise;

    if (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
      };
    }

    if (data === null) {
      return {
        success: false,
        error: 'No data returned from query',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate a random invite link for meetings
 */
export function generateInviteLink(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Calculate file expiration timestamp (7 days from now)
 */
export function calculateFileExpiration(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt;
}

/**
 * Check if a file has expired
 */
export function isFileExpired(expiresAt: Date | string): boolean {
  const expiration =
    typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expiration < new Date();
}
