import { createClient } from '@supabase/supabase-js';
import { FREE_LIMITS } from '@meetsolis/shared';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7); // 'YYYY-MM'
}

export async function getUserPlan(
  clerkUserId: string
): Promise<'free' | 'pro'> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', clerkUserId)
    .single();

  if (data && data.plan === 'pro' && data.status === 'active') return 'pro';
  return 'free';
}

export interface UsageStatus {
  allowed: boolean;
  reason?: string;
  current?: number;
  limit?: number;
}

export async function checkClientLimit(
  clerkUserId: string,
  internalUserId: string
): Promise<UsageStatus> {
  const plan = await getUserPlan(clerkUserId);
  if (plan === 'pro') return { allowed: true };

  const supabase = getSupabase();
  const { count } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', internalUserId);

  const current = count || 0;
  const limit = FREE_LIMITS.clients;

  if (current >= limit) {
    return {
      allowed: false,
      reason: `Free plan limited to ${limit} client. Upgrade to Pro for unlimited clients.`,
      current,
      limit,
    };
  }

  return { allowed: true, current, limit };
}

export async function checkTranscriptLimit(
  clerkUserId: string
): Promise<UsageStatus> {
  const plan = await getUserPlan(clerkUserId);
  if (plan === 'pro') return { allowed: true };

  const supabase = getSupabase();

  // Free tier: lifetime limit (not monthly)
  const { count } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', clerkUserId)
    .neq('status', 'pending');

  const current = count || 0;
  const limit = FREE_LIMITS.transcripts_lifetime;

  if (current >= limit) {
    return {
      allowed: false,
      reason: `Free plan limited to ${limit} transcripts lifetime. Upgrade to Pro for unlimited.`,
      current,
      limit,
    };
  }

  return { allowed: true, current, limit };
}

export async function checkQueryLimit(
  clerkUserId: string
): Promise<UsageStatus> {
  const plan = await getUserPlan(clerkUserId);
  if (plan === 'pro') {
    // Pro: monthly limit
    const supabase = getSupabase();
    const { data } = await supabase
      .from('usage_tracking')
      .select('query_count')
      .eq('user_id', clerkUserId)
      .eq('month', currentMonth())
      .single();

    const current = data?.query_count || 0;
    const limit = 2000;
    return { allowed: current < limit, current, limit };
  }

  // Free: lifetime limit
  const supabase = getSupabase();
  const { count } = await supabase
    .from('solis_queries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', clerkUserId);

  const current = count || 0;
  const limit = FREE_LIMITS.queries_lifetime;

  if (current >= limit) {
    return {
      allowed: false,
      reason: `Free plan limited to ${limit} queries lifetime. Upgrade to Pro for 2000/month.`,
      current,
      limit,
    };
  }

  return { allowed: true, current, limit };
}

export async function incrementQueryCount(clerkUserId: string): Promise<void> {
  const supabase = getSupabase();
  const month = currentMonth();

  const { error } = await supabase.rpc('increment_usage', {
    p_user_id: clerkUserId,
    p_month: month,
    p_field: 'query_count',
  });

  if (error) {
    // Fallback: simple upsert
    await supabase
      .from('usage_tracking')
      .upsert(
        { user_id: clerkUserId, month, query_count: 1 },
        { onConflict: 'user_id,month' }
      );
  }
}
