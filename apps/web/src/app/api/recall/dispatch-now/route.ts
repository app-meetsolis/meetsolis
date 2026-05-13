/**
 * POST /api/recall/dispatch-now
 * On-demand dispatch — called when user clicks "Join with Notetaker".
 * Auth: Clerk session.
 * Body: { event_id: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInternalUserId } from '@/lib/helpers/user';
import { createRecallBot } from '@/lib/services/recall/recall-client';
import { checkBotSessionLimit } from '@/lib/billing/checkUsage';
import { config } from '@/lib/config/env';

export const runtime = 'nodejs';
export const maxDuration = 30;

const Body = z.object({ event_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { event_id: string };
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const userId = await getInternalUserId(supabase, clerkUserId);
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Load event + ownership check
  const { data: evt } = await supabase
    .from('calendar_events')
    .select('id, user_id, client_id, meet_link, bot_status, bot_skipped')
    .eq('id', body.event_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (!evt) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  if (!evt.client_id) {
    return NextResponse.json(
      { error: 'Match a client to this event first' },
      { status: 400 }
    );
  }
  if (!evt.meet_link) {
    return NextResponse.json(
      { error: 'Event has no meeting link' },
      { status: 400 }
    );
  }
  if (evt.bot_skipped) {
    return NextResponse.json({ error: 'Bot skipped' }, { status: 400 });
  }

  // Allow retry: clear stale state if previous attempt errored or stuck pending without bot_id
  if (evt.bot_status) {
    const { data: existingSession } = await supabase
      .from('recall_sessions')
      .select('status, recall_bot_id, created_at')
      .eq('calendar_event_id', evt.id)
      .maybeSingle();

    const isErrored = evt.bot_status === 'error';
    const isStuckPending =
      evt.bot_status === 'pending' &&
      !existingSession?.recall_bot_id &&
      existingSession?.created_at &&
      Date.now() - new Date(existingSession.created_at).getTime() > 60_000;

    if (isErrored || isStuckPending) {
      await supabase
        .from('recall_sessions')
        .delete()
        .eq('calendar_event_id', evt.id);
      await supabase
        .from('calendar_events')
        .update({ bot_status: null })
        .eq('id', evt.id);
    } else {
      return NextResponse.json(
        { error: 'Bot already dispatched', bot_status: evt.bot_status },
        { status: 409 }
      );
    }
  }

  // Pro + active subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .maybeSingle();
  if (!sub || sub.plan !== 'pro' || sub.status !== 'active') {
    return NextResponse.json({ error: 'Pro plan required' }, { status: 403 });
  }

  const quota = await checkBotSessionLimit(userId);
  if (!quota.allowed) {
    await supabase
      .from('calendar_events')
      .update({ bot_status: 'quota_exceeded' })
      .eq('id', evt.id);
    return NextResponse.json(
      {
        error: 'Monthly bot quota reached',
        used: quota.used,
        limit: quota.limit,
      },
      { status: 429 }
    );
  }

  // Insert session row first (UNIQUE constraint on calendar_event_id prevents double-fire)
  const { error: insertError } = await supabase.from('recall_sessions').insert({
    user_id: userId,
    client_id: evt.client_id as string,
    calendar_event_id: evt.id,
    status: 'pending',
  });

  if (insertError) {
    return NextResponse.json(
      { error: 'Bot already dispatching', detail: insertError.message },
      { status: 409 }
    );
  }

  try {
    const bot = await createRecallBot({
      meeting_url: evt.meet_link as string,
      bot_name: config.recall.botName,
      webhook_url: `${config.app.url}/api/recall/webhook`,
      recording_mode: 'speaker_view',
    });

    await supabase
      .from('recall_sessions')
      .update({ recall_bot_id: bot.id, updated_at: new Date().toISOString() })
      .eq('calendar_event_id', evt.id);

    await supabase
      .from('calendar_events')
      .update({ bot_status: 'pending' })
      .eq('id', evt.id);

    return NextResponse.json({ ok: true, bot_id: bot.id });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error('[recall:dispatch-now] bot creation failed:', reason);

    await supabase
      .from('recall_sessions')
      .update({
        status: 'error',
        error_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('calendar_event_id', evt.id);

    await supabase
      .from('calendar_events')
      .update({ bot_status: 'error' })
      .eq('id', evt.id);

    return NextResponse.json(
      { error: 'Bot dispatch failed', detail: reason },
      { status: 502 }
    );
  }
}
