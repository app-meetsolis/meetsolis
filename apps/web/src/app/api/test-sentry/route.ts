import { NextResponse } from 'next/server';

/**
 * Test endpoint for verifying Sentry source map uploads
 *
 * This endpoint intentionally throws an error to test that:
 * 1. Errors are captured by Sentry
 * 2. Stack traces in Sentry show readable code (not minified)
 * 3. Source maps are working correctly
 *
 * Usage:
 * 1. Deploy to production with SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN configured
 * 2. Visit: https://your-domain.vercel.app/api/test-sentry
 * 3. Check Sentry dashboard for the error
 * 4. Verify stack trace shows: app/api/test-sentry/route.ts:XX
 *
 * IMPORTANT: Delete this file after verifying source maps work!
 */
export async function GET() {
  // This will trigger an error and send it to Sentry
  throw new Error(
    'Test error for Sentry source map verification - this is intentional'
  );

  // This line will never execute
  return NextResponse.json({ message: 'This should never be reached' });
}
