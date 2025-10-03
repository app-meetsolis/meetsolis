/**
 * Supabase Client (Client-Side)
 *
 * Client-side Supabase client with anon key.
 * RLS policies are enforced for all operations.
 * Use this in React components and client-side hooks.
 */

import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Get or create Supabase client for client-side operations
 * Uses anonymous key with RLS enforcement
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      persistSession: false, // We use Clerk for auth session management
      autoRefreshToken: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10, // Rate limiting for realtime events
      },
    },
  });

  return supabaseClient;
}
