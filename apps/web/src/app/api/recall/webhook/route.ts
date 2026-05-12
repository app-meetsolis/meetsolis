/**
 * POST /api/recall/webhook
 * Recall.ai bot lifecycle events via Svix delivery.
 * Always responds 200 — heavy work is fire-and-forget after response.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifySvixSignature } from '@/lib/services/recall/verify-signature';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  updateRecallSession,
  getRecallSessionByBotId,
} from '@/lib/services/recall/bot-status-update';
import { incrementBotSessionCount } from '@/lib/billing/checkUsage';
import type { RecallWebhookPayload } from '@meetsolis/shared';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  event: z.string(),
  data: z
    .object({
      bot_id: z.string(),
      recording_url: z.string().optional(),
      transcript_url: z.string().optional(),
      message: z.string().optional(),
      sub_code: z.string().optional(),
    })
    .passthrough(),
});

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Svix signature verification
  const isValid = verifySvixSignature(rawBody, {
    'webhook-id': req.headers.get('webhook-id') ?? '',
    'webhook-timestamp': req.headers.get('webhook-timestamp') ?? '',
    'webhook-signature': req.headers.get('webhook-signature') ?? '',
  });

  if (!isValid) {
    console.warn('[recall:webhook] invalid signature');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: RecallWebhookPayload;
  try {
    const parsed = payloadSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      return NextResponse.json({ ok: true }); // malformed but don't NACK
    }
    payload = parsed.data as RecallWebhookPayload;
  } catch {
    return NextResponse.json({ ok: true }); // don't NACK on parse error
  }

  // Respond 200 immediately — DB updates are fast, transcription dispatch is async
  const supabase = getSupabaseServerClient();
  const { event, data } = payload;
  const botId = data.bot_id;

  // Verify session exists — if not, log and 200 (don't trigger retries)
  const session = await getRecallSessionByBotId(botId, supabase);
  if (!session) {
    console.warn(`[recall:webhook] unknown bot_id: ${botId}, event: ${event}`);
    return NextResponse.json({ ok: true });
  }

  switch (event) {
    case 'bot.joining_call':
      await updateRecallSession(
        botId,
        { status: 'joining', joined_at: new Date().toISOString() },
        supabase
      );
      break;

    case 'bot.in_call_recording':
      await updateRecallSession(botId, { status: 'in_meeting' }, supabase);
      break;

    case 'bot.call_ended':
      await updateRecallSession(
        botId,
        { status: 'done', ended_at: new Date().toISOString() },
        supabase
      );
      // Increment quota counter (only on successful completion)
      await incrementBotSessionCount(session.user_id).catch(err =>
        console.error('[recall:webhook] increment failed:', err)
      );
      // Fire-and-forget: enqueue Story 6.3 transcription pipeline
      if (data.recording_url) {
        await updateRecallSession(
          botId,
          {
            status: 'done',
            raw_recording_url: data.recording_url,
            ended_at: new Date().toISOString(),
          },
          supabase
        );
        triggerTranscription(session.id, data.recording_url, session.user_id);
      }
      break;

    case 'bot.done':
      // Some recordings only have URL available at bot.done
      if (data.recording_url) {
        await updateRecallSession(
          botId,
          { raw_recording_url: data.recording_url, status: 'done' },
          supabase
        );
        triggerTranscription(session.id, data.recording_url, session.user_id);
      }
      break;

    case 'bot.fatal':
      await updateRecallSession(
        botId,
        {
          status: 'error',
          error_reason: data.message ?? data.sub_code ?? 'Unknown fatal error',
          ended_at: new Date().toISOString(),
        },
        supabase
      );
      break;

    default:
      // Forward-compatible: log unknown events, return 200
      console.info(`[recall:webhook] unhandled event: ${event}`);
  }

  return NextResponse.json({ ok: true });
}

/** Fire-and-forget call to Story 6.3 transcription endpoint */
function triggerTranscription(
  recallSessionId: string,
  recordingUrl: string,
  userId: string
): void {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  fetch(`${baseUrl}/api/gladia/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recall_session_id: recallSessionId,
      recording_url: recordingUrl,
      user_id: userId,
    }),
  }).catch(err =>
    console.error('[recall:webhook] transcription trigger failed:', err)
  );
}
