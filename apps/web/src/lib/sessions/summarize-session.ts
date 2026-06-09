/**
 * Core session summarization logic.
 * Callable directly (no HTTP, no Clerk auth needed) — used by fire-and-forget trigger.
 * Action items are generated separately — see generate-action-items.ts (Story 6.2c).
 */

import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';
import { config } from '@/lib/config/env';
import { ServiceFactory } from '@/lib/service-factory';
import { ClientContext } from '@meetsolis/shared';
import { isPlaceholderTitle } from '@/lib/sessions/session-title';
import { generateIntelligenceStrip } from '@/lib/clients/generate-intelligence-strip';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

export async function runSummarize(
  sessionId: string,
  userId: string
): Promise<'complete' | 'error' | 'skipped'> {
  const supabase = getSupabase();

  const { data: session } = await supabase
    .from('sessions')
    .select('id, user_id, client_id, title, transcript_text')
    .eq('id', sessionId)
    .single();

  if (!session || session.user_id !== userId) return 'skipped';
  if (!session.transcript_text) return 'skipped';

  const { data: client } = await supabase
    .from('clients')
    .select('name, goal, start_date')
    .eq('id', session.client_id)
    .single();

  const clientCtx: ClientContext = {
    name: client?.name ?? 'Client',
    goal: client?.goal ?? null,
    coaching_since: client?.start_date ?? null,
  };

  await supabase
    .from('sessions')
    .update({ status: 'processing' })
    .eq('id', sessionId);

  try {
    const aiService = ServiceFactory.createAIService();

    const summary = await aiService.summarizeSession(
      session.transcript_text,
      clientCtx
    );
    const embedding = await aiService.generateEmbedding(summary.summary);

    const updates: Record<string, unknown> = {
      summary: summary.summary,
      key_topics: summary.key_topics,
      embedding: JSON.stringify(embedding),
      status: 'complete',
    };
    // Give the session a real title when it only has a placeholder
    // (e.g. "(no title)" inherited from a calendar event with no summary).
    if (summary.title && isPlaceholderTitle(session.title)) {
      updates.title = summary.title;
    }

    await supabase.from('sessions').update(updates).eq('id', sessionId);

    // Story 7.2 — refresh the client's AI intelligence strip after each session.
    // Fire-and-forget: a strip failure must NEVER flip session status to error.
    generateIntelligenceStrip(session.client_id, session.user_id).catch(err => {
      Sentry.captureException(err, {
        extra: { sessionId, stage: 'intelligence_strip' },
      });
    });

    console.log(`[Summarize] Session ${sessionId} complete`);
    return 'complete';
  } catch (error) {
    console.error('[Summarize] Error:', error);
    await supabase
      .from('sessions')
      .update({ status: 'error' })
      .eq('id', sessionId);
    return 'error';
  }
}
