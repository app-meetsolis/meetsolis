/**
 * Supabase Server Client (Server-Side Only)
 *
 * Server-side Supabase client with service role key.
 * Bypasses RLS - use with caution only in API routes.
 * Never expose this client to the browser.
 */

import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

/**
 * Get Supabase client for server-side operations
 * Uses service role key - bypasses RLS policies
 * ONLY use in API routes and server-side functions
 */
export function getSupabaseServerClient() {
  if (!supabaseConfig.serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for server-side operations'
    );
  }

  return createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Get Supabase client for authenticated user operations
 * Uses anon key with RLS enforcement based on Clerk user token
 * @param clerkUserId - Clerk user ID to set as auth context
 */
export function getSupabaseClientForUser(clerkUserId: string) {
  const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        // Set Clerk user ID as auth context for RLS
        'X-User-Id': clerkUserId,
      },
    },
  });

  return supabase;
}
