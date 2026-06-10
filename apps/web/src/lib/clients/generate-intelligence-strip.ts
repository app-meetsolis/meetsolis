/**
 * Story 7.2 — generate the AI intelligence strip for a single client.
 *
 * Loads the client's session history, calls the AI service, validates the
 * output via Zod, then writes to `clients.ai_intelligence_strip`. Never
 * touches `clients.coach_notes` (BRAINSTORM §2: coach_notes is sacred).
 *
 * Story 7.7 retrofit: respects `clients.ai_intelligence_strip_overrides`.
 * Any field flagged as coach-edited is preserved verbatim across regens.
 *
 * Fire-and-forget from summarize-session.ts — callers MUST NOT block on this.
 */

import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';
import {
  AIIntelligenceStripSchema,
  STRIP_FIELDS,
  type AIIntelligenceStrip,
  type AIIntelligenceStripOverrides,
  type StripField,
} from '@meetsolis/shared';
import { config } from '@/lib/config/env';
import { ServiceFactory } from '@/lib/service-factory';

// Most-recent-first; first 3 passed verbatim, rest get summary truncated.
const VERBATIM_SESSION_COUNT = 3;
const OLDER_SUMMARY_CHAR_LIMIT = 200;

export interface GenerateIntelligenceStripResult {
  success: boolean;
  strip?: AIIntelligenceStrip;
  error?: string;
  skipped?: 'no_sessions' | 'client_not_found';
}

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

function truncate(text: string | null, limit: number): string {
  if (!text) return '';
  return text.length <= limit ? text : `${text.slice(0, limit).trimEnd()}…`;
}

/**
 * Merge AI candidate with existing strip, preserving coach-edited fields.
 * Exported for unit-testing.
 */
export function mergeWithOverrides(
  aiCandidate: Omit<AIIntelligenceStrip, 'generated_at'>,
  existing: AIIntelligenceStrip | null,
  overrides: AIIntelligenceStripOverrides
): Omit<AIIntelligenceStrip, 'generated_at'> {
  const merged = { ...aiCandidate };
  if (!existing) return merged;
  for (const field of STRIP_FIELDS) {
    if (overrides[field as StripField] === true) {
      merged[field] = existing[field];
    }
  }
  return merged;
}

export async function generateIntelligenceStrip(
  clientId: string,
  userId: string
): Promise<GenerateIntelligenceStripResult> {
  const supabase = getSupabase();

  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select(
      'id, user_id, name, goal, start_date, ai_intelligence_strip, ai_intelligence_strip_overrides'
    )
    .eq('id', clientId)
    .eq('user_id', userId)
    .single();

  if (clientErr || !client) {
    return { success: false, skipped: 'client_not_found' };
  }

  const { data: sessionsRaw } = await supabase
    .from('sessions')
    .select('id, session_date, summary, key_topics')
    .eq('client_id', clientId)
    .eq('user_id', userId)
    .eq('status', 'complete')
    .not('summary', 'is', null)
    .order('session_date', { ascending: false });

  const sessions = sessionsRaw ?? [];

  if (sessions.length === 0) {
    return { success: false, skipped: 'no_sessions' };
  }

  const formatted = sessions.map((s, i) => ({
    session_date: s.session_date as string,
    summary:
      i < VERBATIM_SESSION_COUNT
        ? (s.summary as string)
        : truncate(s.summary as string | null, OLDER_SUMMARY_CHAR_LIMIT),
    key_topics: Array.isArray(s.key_topics) ? (s.key_topics as string[]) : [],
  }));

  let fields;
  try {
    const aiService = ServiceFactory.createAIService();
    fields = await aiService.generateIntelligenceStrip({
      client: {
        name: client.name as string,
        goal: (client.goal as string | null) ?? null,
        start_date: (client.start_date as string | null) ?? null,
      },
      sessions: formatted,
    });
  } catch (err) {
    Sentry.captureException(err, {
      extra: { clientId, stage: 'intelligence_strip:ai_call' },
    });
    return {
      success: false,
      error: err instanceof Error ? err.message : 'ai_call_failed',
    };
  }

  const existingStrip =
    (client.ai_intelligence_strip as AIIntelligenceStrip | null) ?? null;
  const overrides =
    (client.ai_intelligence_strip_overrides as AIIntelligenceStripOverrides | null) ??
    {};

  const merged = mergeWithOverrides(fields, existingStrip, overrides);

  const candidate: AIIntelligenceStrip = {
    ...merged,
    generated_at: new Date().toISOString(),
  };

  const validation = AIIntelligenceStripSchema.safeParse(candidate);
  if (!validation.success) {
    Sentry.captureException(
      new Error('Intelligence strip failed Zod validation'),
      {
        extra: {
          clientId,
          issues: validation.error.issues,
          candidate,
        },
      }
    );
    return { success: false, error: 'zod_validation_failed' };
  }

  const { error: writeErr } = await supabase
    .from('clients')
    .update({ ai_intelligence_strip: validation.data })
    .eq('id', clientId)
    .eq('user_id', userId);

  if (writeErr) {
    Sentry.captureException(writeErr, {
      extra: { clientId, stage: 'intelligence_strip:write' },
    });
    return { success: false, error: writeErr.message };
  }

  return { success: true, strip: validation.data };
}
