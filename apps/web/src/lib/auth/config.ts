/**
 * Clerk Authentication Configuration
 * Centralized configuration for Clerk authentication settings
 */

export const clerkConfig = {
  /**
   * Public routes accessible without authentication
   */
  publicRoutes: ['/', '/sign-in(.*)', '/sign-up(.*)', '/api/webhooks(.*)'],

  /**
   * Routes that should be accessible only to authenticated users
   */
  protectedRoutes: ['/dashboard(.*)', '/meeting(.*)', '/api/(?!webhooks)(.*)'],

  /**
   * Session configuration
   */
  session: {
    /**
     * Session timeout in milliseconds (30 minutes)
     */
    timeout: 30 * 60 * 1000,
  },

  /**
   * JWT token configuration
   */
  jwt: {
    /**
     * Token lifetime in seconds (30 minutes)
     */
    lifetime: 30 * 60,
  },
} as const;

/**
 * Get Clerk environment variables with validation
 */
export function getClerkEnv() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!publishableKey || !secretKey) {
    throw new Error(
      'Missing Clerk environment variables. Please set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY'
    );
  }

  return {
    publishableKey,
    secretKey,
  };
}
