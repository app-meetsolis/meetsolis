/**
 * Core action-item generation logic (Story 6.2c).
 * Callable directly (no HTTP, no Clerk auth needed) — used by the manual
 * trigger endpoint and the optional post-summary auto-generate path.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { ServiceFactory } from '@/lib/service-factory';
import { ClientContext, ClientActionItem } from '@meetsolis/shared';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

export interface GenerateActionItemsResult {
  status: 'complete' | 'skipped' | 'error';
  action_items: ClientActionItem[];
}

/**
 * Generate action items for a session from its transcript.
 * Idempotent: deletes existing action items for the session before inserting.
 */
export async function runGenerateActionItems(
  sessionId: string,
  userId: string
): Promise<GenerateActionItemsResult> {
  const supabase = getSupabase();

  const { data: session } = await supabase
    .from('sessions')
    .select('id, user_id, client_id, transcript_text')
    .eq('id', sessionId)
    .single();

  if (!session || session.user_id !== userId) {
    return { status: 'skipped', action_items: [] };
  }
  if (!session.transcript_text) {
    return { status: 'skipped', action_items: [] };
  }

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

  try {
    const aiService = ServiceFactory.createAIService();
    const { action_items } = await aiService.generateActionItems(
      session.transcript_text,
      clientCtx
    );

    // Idempotent: replace any existing items for this session.
    await supabase.from('action_items').delete().eq('session_id', sessionId);

    if (action_items.length === 0) {
      console.log(`[ActionItems] Session ${sessionId} produced no items`);
      return { status: 'complete', action_items: [] };
    }

    const { data: inserted, error } = await supabase
      .from('action_items')
      .insert(
        action_items.map(item => ({
          session_id: sessionId,
          client_id: session.client_id,
          user_id: userId,
          description: item.description,
          assignee: item.assigned_to,
          completed: false,
        }))
      )
      .select();

    if (error) {
      console.error('[ActionItems] Insert error:', error);
      return { status: 'error', action_items: [] };
    }

    console.log(
      `[ActionItems] Session ${sessionId} — ${inserted?.length ?? 0} items`
    );
    return {
      status: 'complete',
      action_items: (inserted ?? []) as ClientActionItem[],
    };
  } catch (error) {
    console.error('[ActionItems] Error:', error);
    return { status: 'error', action_items: [] };
  }
}

/**
 * Fire action-item generation only if the user opted into auto-generation.
 * Called after a summary completes (streaming + manual-upload pipelines).
 */
export async function maybeAutoGenerateActionItems(
  sessionId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  const { data: user } = await supabase
    .from('users')
    .select('auto_action_items_enabled')
    .eq('id', userId)
    .single();

  if (!user?.auto_action_items_enabled) return;

  const result = await runGenerateActionItems(sessionId, userId);
  if (result.status === 'error') {
    console.error(
      `[ActionItems] auto-generate failed for session ${sessionId}`
    );
  }
}
