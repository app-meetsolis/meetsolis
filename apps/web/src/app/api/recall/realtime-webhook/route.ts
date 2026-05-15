/**
 * POST /api/recall/realtime-webhook
 * Recall.ai real-time transcript events (`transcript.data`) — live streaming
 * transcription (Story 6.2b).
 *
 * Separate from /api/recall/webhook: per-bot real-time endpoints are signed
 * with the Recall workspace verification secret, not the Svix endpoint secret.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySvixSignature } from '@/lib/services/recall/verify-signature';
import { config } from '@/lib/config/env';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getRecallSessionByBotId } from '@/lib/services/recall/bot-status-update';
import { ensureSessionRow } from '@/lib/services/recall/ensure-session';
import { appendTranscriptChunk } from '@/lib/services/recall/process-transcript-chunk';
import { RecallTranscriptDataEventSchema, mapEventToChunk } from './schema';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const isValid = verifySvixSignature(
    rawBody,
    {
      'webhook-id': req.headers.get('webhook-id') ?? '',
      'webhook-timestamp': req.headers.get('webhook-timestamp') ?? '',
      'webhook-signature': req.headers.get('webhook-signature') ?? '',
    },
    config.recall.realtimeWebhookSecret
  );
  if (!isValid) {
    console.warn('[recall:realtime-webhook] invalid signature');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = RecallTranscriptDataEventSchema.safeParse(json);
  if (!parsed.success) {
    console.warn(
      `[recall:realtime-webhook] payload validation failed: ${parsed.error.message}`
    );
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const event = parsed.data;
  const botId = event.data.bot.id;
  const supabase = getSupabaseServerClient();

  const recallSession = await getRecallSessionByBotId(botId, supabase);
  if (!recallSession) {
    console.warn(`[recall:realtime-webhook] unknown bot_id: ${botId}`);
    return NextResponse.json({ ok: true });
  }

  const chunk = mapEventToChunk(event);
  if (!chunk) {
    return NextResponse.json({ ok: true }); // no words — nothing to store
  }

  try {
    await ensureSessionRow(recallSession.id, supabase);
    await appendTranscriptChunk(recallSession.id, chunk, supabase);
  } catch (err) {
    // Return 200 anyway — a non-2xx triggers up to 60 Recall retries of a
    // single chunk. Dropping one utterance is preferable to a retry storm.
    console.error(
      '[recall:realtime-webhook] append failed:',
      err instanceof Error ? err.message : String(err)
    );
  }

  return NextResponse.json({ ok: true });
}
