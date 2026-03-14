/**
 * Core session summarization logic.
 * Callable directly (no HTTP, no Clerk auth needed) — used by fire-and-forget trigger.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { ServiceFactory } from '@/lib/service-factory';
import { ClientContext } from '@meetsolis/shared';

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
    .select('id, user_id, client_id, transcript_text')
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

    // Idempotent: delete existing before inserting new
    await supabase.from('action_items').delete().eq('session_id', sessionId);

    if (summary.action_items.length > 0) {
      await supabase.from('action_items').insert(
        summary.action_items.map(item => ({
          session_id: sessionId,
          client_id: session.client_id,
          user_id: userId,
          description: item.description,
          assignee: item.assigned_to,
          completed: false,
        }))
      );
    }

    await supabase
      .from('sessions')
      .update({
        summary: summary.summary,
        key_topics: summary.key_topics,
        embedding: JSON.stringify(embedding),
        status: 'complete',
      })
      .eq('id', sessionId);

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
