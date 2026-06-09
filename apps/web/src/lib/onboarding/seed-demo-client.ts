/**
 * Story 7.4 — Seed the "Alex Rivera" demo client for a new Path-B user.
 *
 * Idempotent: if the user already has an `is_demo = true` client, returns its
 * ID without re-seeding. Embeddings are generated through the configured AI
 * service (zero-vector under the claude provider — see story note A3); Solis's
 * hybrid search still surfaces results via the keyword side of the ranking.
 *
 * Per-signup cost: ~$0.001 (4 OpenAI embedding calls). Brief content is
 * hand-written into demo-client-data.ts — no per-signup brief generation.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { ServiceFactory } from '@/lib/service-factory';
import {
  DEMO_CLIENT_PROFILE,
  buildDemoAIStrip,
  buildDemoSessions,
  DEMO_ACTION_ITEMS,
  buildDemoBriefContent,
  demoDates,
} from './demo-client-data';

export interface SeedDemoResult {
  clientId: string;
  alreadySeeded: boolean;
  sessionsCreated: number;
  actionItemsCreated: number;
  briefCreated: boolean;
}

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

/**
 * Seeds Alex Rivera + 4 sessions + 8 action items + 1 coach brief for the
 * given internal user UUID. Safe to call repeatedly — returns existing
 * `clientId` with `alreadySeeded: true` if the demo client already exists.
 */
export async function seedDemoClient(userId: string): Promise<SeedDemoResult> {
  const supabase = getSupabase();

  // ---- Idempotency check ------------------------------------------------
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .eq('is_demo', true)
    .maybeSingle();

  if (existing?.id) {
    return {
      clientId: existing.id,
      alreadySeeded: true,
      sessionsCreated: 0,
      actionItemsCreated: 0,
      briefCreated: false,
    };
  }

  const seedAt = new Date();
  const dates = demoDates(seedAt);
  const aiStrip = buildDemoAIStrip(seedAt);
  const sessions = buildDemoSessions(seedAt);

  // ---- 1. Insert client -------------------------------------------------
  const { data: insertedClient, error: clientErr } = await supabase
    .from('clients')
    .insert({
      user_id: userId,
      name: DEMO_CLIENT_PROFILE.name,
      role: DEMO_CLIENT_PROFILE.role,
      company: DEMO_CLIENT_PROFILE.company,
      goal: DEMO_CLIENT_PROFILE.goal,
      start_date: dates.startDate,
      is_demo: true,
      ai_intelligence_strip: aiStrip,
      // last_session_at mirrors the latest session below so the client card
      // shows realistic "last session" copy immediately.
      last_session_at: new Date(`${dates.session4}T12:00:00Z`).toISOString(),
    })
    .select('id')
    .single();

  if (clientErr || !insertedClient) {
    // 23505 = Postgres unique_violation. With migration 031's UNIQUE partial
    // index on (user_id) WHERE is_demo=TRUE, a concurrent seed wins the race
    // and our insert hits the constraint. Re-fetch the winning row and treat
    // as alreadySeeded — same outcome as the read-side idempotency check.
    if (clientErr?.code === '23505') {
      const { data: existingAfterRace } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .eq('is_demo', true)
        .maybeSingle();
      if (existingAfterRace?.id) {
        return {
          clientId: existingAfterRace.id,
          alreadySeeded: true,
          sessionsCreated: 0,
          actionItemsCreated: 0,
          briefCreated: false,
        };
      }
    }
    throw new Error(
      `seed-demo-client: failed to insert client — ${clientErr?.message}`
    );
  }
  const clientId = insertedClient.id as string;

  // ---- 2. Insert sessions + embeddings ---------------------------------
  const aiService = ServiceFactory.createAIService();
  const insertedSessionIds: string[] = [];

  for (const session of sessions) {
    // Generate embedding off the summary (matches Story 3 summarize-session
    // pattern). Under the claude provider this is a zero-vector; Solis still
    // works via the keyword half of hybrid search.
    let embedding: number[] = [];
    try {
      embedding = await aiService.generateEmbedding(session.summary);
    } catch (e) {
      console.error('[seed-demo-client] embedding failed (non-fatal):', e);
      embedding = new Array(1536).fill(0);
    }

    const { data: insertedSession, error: sErr } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        client_id: clientId,
        title: session.title,
        session_date: session.session_date,
        transcript_text: session.transcript_text,
        summary: session.summary,
        key_topics: session.key_topics,
        embedding: JSON.stringify(embedding),
        status: 'complete',
        source: 'manual',
      })
      .select('id')
      .single();

    if (sErr || !insertedSession) {
      throw new Error(
        `seed-demo-client: failed to insert session "${session.title}" — ${sErr?.message}`
      );
    }
    insertedSessionIds.push(insertedSession.id as string);
  }

  // ---- 3. Insert action items ------------------------------------------
  const itemRows = DEMO_ACTION_ITEMS.map(item => {
    const sessionId = insertedSessionIds[item.sessionIndex];
    const completedAt = item.completed ? new Date().toISOString() : null;
    return {
      user_id: userId,
      client_id: clientId,
      session_id: sessionId,
      description: item.description,
      assignee: item.assignee,
      completed: item.completed,
      completed_at: completedAt,
      status: item.completed ? 'completed' : 'pending',
    };
  });

  const { data: insertedItems, error: itemsErr } = await supabase
    .from('action_items')
    .insert(itemRows)
    .select('id, session_id, description, completed');

  if (itemsErr) {
    throw new Error(
      `seed-demo-client: failed to insert action items — ${itemsErr.message}`
    );
  }
  const actionItemsCreated = insertedItems?.length ?? 0;

  // ---- 4. Insert coach brief -------------------------------------------
  // Use real IDs (session 3 = breakthrough; session 4 = last session) and the
  // action items belonging to session 4 so the BriefScreen can render
  // checkboxes against the live action_items table.
  const session3Id = insertedSessionIds[2];
  const session4Id = insertedSessionIds[3];
  const session4Items =
    insertedItems
      ?.filter(i => i.session_id === session4Id)
      .map(i => ({
        id: i.id as string,
        text: i.description as string,
        completed: i.completed as boolean,
      })) ?? [];

  const briefContent = buildDemoBriefContent(
    seedAt,
    session3Id,
    session4Id,
    session4Items
  );

  const { error: briefErr } = await supabase.from('coach_briefs').insert({
    user_id: userId,
    client_id: clientId,
    calendar_event_id: null, // manual brief
    content: briefContent,
    generation_status: 'ok',
    dismissed: false,
    generated_at: seedAt.toISOString(),
  });

  if (briefErr) {
    // Brief failure is non-fatal — client and sessions are seeded; coach can
    // regenerate from /brief/manual/{clientId}. Log and continue.
    console.error(
      '[seed-demo-client] coach_briefs insert failed (non-fatal):',
      briefErr.message
    );
  }

  return {
    clientId,
    alreadySeeded: false,
    sessionsCreated: insertedSessionIds.length,
    actionItemsCreated,
    briefCreated: !briefErr,
  };
}
