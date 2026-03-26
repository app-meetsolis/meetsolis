/**
 * Usage API — Story 4.4
 * GET /api/usage — current user's usage counts and limits
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInternalUserId } from '@/lib/helpers/user';
import { LIMITS } from '@/lib/billing/checkUsage';
import type { UsageResponse, SubscriptionPlan } from '@meetsolis/shared';

export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const supabase = getSupabaseServerClient();

  const userId = await getInternalUserId(supabase, clerkUserId);
  if (!userId) {
    return NextResponse.json(
      { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
      { status: 404 }
    );
  }

  // Fetch tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .maybeSingle();

  const tier: SubscriptionPlan = subscription?.plan === 'pro' ? 'pro' : 'free';
  const limits = LIMITS[tier];

  // Fetch usage_tracking (create if missing)
  await supabase
    .from('usage_tracking')
    .upsert(
      { user_id: userId },
      { onConflict: 'user_id', ignoreDuplicates: true }
    );

  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Client count
  const { count: clientCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // resets_at: for pro, use the earlier of the two reset timestamps
  let resetsAt: string | null = null;
  if (tier === 'pro' && usage) {
    const candidates = [usage.transcript_reset_at, usage.query_reset_at].filter(
      Boolean
    ) as string[];
    if (candidates.length > 0) {
      // Earliest reset_at + 30 days = next reset
      const earliest = candidates.reduce((a, b) => (a < b ? a : b));
      resetsAt = new Date(
        new Date(earliest).getTime() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
  }

  const response: UsageResponse = {
    tier,
    transcript_count: usage?.transcript_count ?? 0,
    transcript_limit: limits.transcripts,
    query_count: usage?.query_count ?? 0,
    query_limit: limits.queries,
    client_count: clientCount ?? 0,
    client_limit: limits.clients === Infinity ? -1 : limits.clients,
    resets_at: resetsAt,
  };

  return NextResponse.json(response, { status: 200 });
}
