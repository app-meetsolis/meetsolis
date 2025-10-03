/**
 * Supabase Configuration
 *
 * Centralized configuration for Supabase environment variables.
 * Never access process.env directly - use these config objects.
 */

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
};

// Validate required environment variables
if (!supabaseConfig.url) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseConfig.anonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Service role key is only required on server-side
if (typeof window === 'undefined' && !supabaseConfig.serviceRoleKey) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY not set - server-side operations will fail'
  );
}
