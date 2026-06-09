/**
 * POST /api/onboarding/seed-demo (Story 7.4)
 *
 * Seeds the Alex Rivera demo client + 4 sessions + action items + a coach
 * brief for the calling user. Idempotent — if a demo client already exists
 * for this user, returns its `clientId` with `alreadySeeded: true`.
 *
 * Called from Path-B onboarding Step 2 (Story 7.3 will mount the trigger).
 */

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';
import { seedDemoClient } from '@/lib/onboarding/seed-demo-client';

export const runtime = 'nodejs';

function err(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return err('UNAUTHORIZED', 'Authentication required', 401);
    }

    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) return err('USER_NOT_FOUND', 'User not found', 404);

    const result = await seedDemoClient(userId);

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    // Log full detail server-side; return a generic message to the client so
    // Supabase column / constraint names don't leak.
    console.error('[POST /api/onboarding/seed-demo]', e);
    return err(
      'INTERNAL_ERROR',
      'Failed to set up your demo. Please try again.',
      500
    );
  }
}
