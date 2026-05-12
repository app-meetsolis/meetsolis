/**
 * Usage enforcement — Stories 4.4 + 5.2
 * Server-side limit checks for free/pro tiers.
 */

import * as Sentry from '@sentry/nextjs';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { config } from '@/lib/config/env';
import {
  UpgradeRequiredError,
  type UsageTracking,
  type SubscriptionPlan,
} from '@meetsolis/shared';

// ---------------------------------------------------------------------------
// Admin bypass (dev/test only — disabled in production)
// ---------------------------------------------------------------------------

function isAdminBypassActive(userId: string): boolean {
  if (!config.adminBypassLimits) return false;
  console.log(`[admin] limit check bypassed for ${userId}`);
  return true;
}

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------

export const LIMITS = {
  free: { clients: 3, transcripts: 5, queries: 75 },
  pro: { clients: Infinity, transcripts: 25, queries: 2000 },
} as const;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function getUserTier(
  userId: string,
  supabase: ReturnType<typeof getSupabaseServerClient>
): Promise<SubscriptionPlan> {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.plan === 'pro' ? 'pro' : 'free';
}

async function getOrCreateUsageTracking(
  userId: string,
  supabase: ReturnType<typeof getSupabaseServerClient>
): Promise<UsageTracking> {
  const { data, error } = await supabase
    .from('usage_tracking')
    .upsert(
      { user_id: userId },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )
    .select()
    .single();

  if (error || !data) {
    // Row may already exist — fetch it
    const { data: existing, error: fetchError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError || !existing) {
      throw new Error(
        `Failed to get/create usage tracking: ${fetchError?.message}`
      );
    }
    return existing as UsageTracking;
  }

  return data as UsageTracking;
}

async function maybeResetMonthlyCounter(
  usage: UsageTracking,
  field: 'transcript' | 'query',
  supabase: ReturnType<typeof getSupabaseServerClient>
): Promise<UsageTracking> {
  const resetAtField = `${field}_reset_at` as const;
  const countField = `${field}_count` as const;
  const resetAt = usage[resetAtField];

  if (!resetAt) return usage; // free tier — no reset

  const resetDate = new Date(resetAt).getTime();
  const now = Date.now();

  if (now - resetDate > THIRTY_DAYS_MS) {
    const { data: updated, error } = await supabase
      .from('usage_tracking')
      .update({
        [countField]: 0,
        [resetAtField]: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', usage.user_id)
      .select()
      .single();

    if (error || !updated) throw new Error(`Failed to reset ${field} counter`);
    return updated as UsageTracking;
  }

  return usage;
}

// ---------------------------------------------------------------------------
// Exported enforcement functions
// ---------------------------------------------------------------------------

export async function checkClientLimit(userId: string): Promise<void> {
  if (isAdminBypassActive(userId)) return;
  const supabase = getSupabaseServerClient();
  const tier = await getUserTier(userId, supabase);

  if (tier === 'pro') return;

  const { count, error } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to count clients: ${error.message}`);

  if (count !== null && count >= LIMITS.free.clients) {
    throw new UpgradeRequiredError('client');
  }
}

export async function checkTranscriptLimit(userId: string): Promise<void> {
  if (isAdminBypassActive(userId)) return;
  const supabase = getSupabaseServerClient();
  const tier = await getUserTier(userId, supabase);
  let usage = await getOrCreateUsageTracking(userId, supabase);

  if (tier === 'pro') {
    usage = await maybeResetMonthlyCounter(usage, 'transcript', supabase);
    if (usage.transcript_count >= LIMITS.pro.transcripts) {
      throw new UpgradeRequiredError('transcript');
    }
  } else {
    if (usage.transcript_count >= LIMITS.free.transcripts) {
      throw new UpgradeRequiredError('transcript');
    }
  }
}

export async function checkQueryLimit(userId: string): Promise<void> {
  if (isAdminBypassActive(userId)) return;
  const supabase = getSupabaseServerClient();
  const tier = await getUserTier(userId, supabase);
  let usage = await getOrCreateUsageTracking(userId, supabase);

  if (tier === 'pro') {
    usage = await maybeResetMonthlyCounter(usage, 'query', supabase);
    if (usage.query_count >= LIMITS.pro.queries) {
      throw new UpgradeRequiredError('query');
    }
  } else {
    if (usage.query_count >= LIMITS.free.queries) {
      throw new UpgradeRequiredError('query');
    }
  }
}

export async function incrementTranscriptCount(userId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const usage = await getOrCreateUsageTracking(userId, supabase);

  const { error } = await supabase
    .from('usage_tracking')
    .update({
      transcript_count: usage.transcript_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    Sentry.captureException(new Error(error.message), {
      extra: { userId, type: 'increment_transcript' },
    });
    throw new Error(`Failed to increment transcript count: ${error.message}`);
  }
}

export async function incrementQueryCount(userId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const usage = await getOrCreateUsageTracking(userId, supabase);

  const { error } = await supabase
    .from('usage_tracking')
    .update({
      query_count: usage.query_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    Sentry.captureException(new Error(error.message), {
      extra: { userId, type: 'increment_query' },
    });
    throw new Error(`Failed to increment query count: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Bot session quota (Story 6.2 — Pro only, 25/month, Dodo billing cycle)
// ---------------------------------------------------------------------------

export const BOT_SESSION_LIMIT_PRO = 25;

/**
 * Returns { allowed, used, limit } without throwing.
 * Free tier → always { allowed: false, used: 0, limit: 0 }.
 */
export async function checkBotSessionLimit(
  userId: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (isAdminBypassActive(userId))
    return { allowed: true, used: 0, limit: BOT_SESSION_LIMIT_PRO };

  const supabase = getSupabaseServerClient();
  const tier = await getUserTier(userId, supabase);

  if (tier !== 'pro') return { allowed: false, used: 0, limit: 0 };

  const usage = await getOrCreateUsageTracking(userId, supabase);

  // Reset if period_start + 30 days has passed (aligns with billing cycle check)
  const periodStart = usage.bot_session_count_period_start;
  const count = usage.bot_session_count ?? 0;

  if (periodStart) {
    const elapsed = Date.now() - new Date(periodStart).getTime();
    if (elapsed > THIRTY_DAYS_MS) {
      await supabase
        .from('usage_tracking')
        .update({
          bot_session_count: 0,
          bot_session_count_period_start: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      return { allowed: true, used: 0, limit: BOT_SESSION_LIMIT_PRO };
    }
  }

  return {
    allowed: count < BOT_SESSION_LIMIT_PRO,
    used: count,
    limit: BOT_SESSION_LIMIT_PRO,
  };
}

export async function incrementBotSessionCount(userId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const usage = await getOrCreateUsageTracking(userId, supabase);
  const count = usage.bot_session_count ?? 0;

  const update: Record<string, unknown> = {
    bot_session_count: count + 1,
    updated_at: new Date().toISOString(),
  };

  // Initialise period_start on first increment
  if (!usage.bot_session_count_period_start) {
    update.bot_session_count_period_start = new Date().toISOString();
  }

  const { error } = await supabase
    .from('usage_tracking')
    .update(update)
    .eq('user_id', userId);

  if (error) {
    Sentry.captureException(new Error(error.message), {
      extra: { userId, type: 'increment_bot_session' },
    });
    throw new Error(`Failed to increment bot_session_count: ${error.message}`);
  }
}

/** Called by Dodo webhook on subscription.renewed to reset bot session counter. */
export async function resetBotSessionCount(userId: string): Promise<void> {
  const supabase = getSupabaseServerClient();

  const { error } = await supabase
    .from('usage_tracking')
    .update({
      bot_session_count: 0,
      bot_session_count_period_start: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to reset bot_session_count: ${error.message}`);
  }
}
