/**
 * POST /api/recall/webhook
 * Recall.ai bot lifecycle events via Svix delivery.
 * Always responds 200 — heavy work is fire-and-forget after response.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySvixSignature } from '@/lib/services/recall/verify-signature';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  updateRecallSession,
  getRecallSessionByBotId,
} from '@/lib/services/recall/bot-status-update';
import { processRecallRecording } from '@/lib/services/recall/process-recording';
import { incrementBotSessionCount } from '@/lib/billing/checkUsage';

export const runtime = 'nodejs';

/**
 * Recall.ai's new account-level webhook payload structure varies:
 *  - bot.* events:        data.bot.id            (sometimes data.bot_id legacy)
 *  - recording.* events:  data.bot.id            (recording is keyed to a bot)
 *  - meeting_metadata.*:  data.bot.id
 * Extract bot_id defensively to survive payload-shape changes.
 */
function extractBotId(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (typeof d.bot_id === 'string') return d.bot_id;
  if (d.bot && typeof d.bot === 'object') {
    const b = d.bot as Record<string, unknown>;
    if (typeof b.id === 'string') return b.id;
  }
  return null;
}

/**
 * recording.done payload typically has the download URL deep in the structure:
 *   data.recording.media_shortcuts.video_mixed.data.download_url
 * Search a few known shapes; bail out if nothing found.
 */
function extractRecordingUrl(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (typeof d.recording_url === 'string') return d.recording_url;

  const rec = d.recording as Record<string, unknown> | undefined;
  if (rec) {
    const ms = rec.media_shortcuts as Record<string, unknown> | undefined;
    if (ms) {
      const vm = ms.video_mixed as Record<string, unknown> | undefined;
      if (vm?.data && typeof vm.data === 'object') {
        const url = (vm.data as Record<string, unknown>).download_url;
        if (typeof url === 'string') return url;
      }
      const am = ms.audio_mixed as Record<string, unknown> | undefined;
      if (am?.data && typeof am.data === 'object') {
        const url = (am.data as Record<string, unknown>).download_url;
        if (typeof url === 'string') return url;
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const isValid = verifySvixSignature(rawBody, {
    'webhook-id': req.headers.get('webhook-id') ?? '',
    'webhook-timestamp': req.headers.get('webhook-timestamp') ?? '',
    'webhook-signature': req.headers.get('webhook-signature') ?? '',
  });

  if (!isValid) {
    console.warn('[recall:webhook] invalid signature');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let parsed: { event?: string; data?: unknown };
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const event = parsed.event;
  const data = parsed.data;
  const botId = extractBotId(data);

  if (!event || !botId) {
    console.warn(
      `[recall:webhook] missing event or bot_id. event=${event} body=${rawBody.slice(0, 500)}`
    );
    return NextResponse.json({ ok: true });
  }

  const supabase = getSupabaseServerClient();
  const session = await getRecallSessionByBotId(botId, supabase);
  if (!session) {
    console.warn(`[recall:webhook] unknown bot_id: ${botId}, event: ${event}`);
    return NextResponse.json({ ok: true });
  }

  console.info(`[recall:webhook] event=${event} bot=${botId}`);

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
      await incrementBotSessionCount(session.user_id).catch(err =>
        console.error('[recall:webhook] increment failed:', err)
      );
      break;

    case 'bot.done':
    case 'recording.done': {
      const url = extractRecordingUrl(data);
      const update: Parameters<typeof updateRecallSession>[1] = {
        status: 'done',
      };
      if (url) update.raw_recording_url = url;
      await updateRecallSession(botId, update, supabase);
      if (url) {
        // Await session insert (fast) — Vercel may kill the function after
        // we return 200, so don't fire-and-forget the DB write.
        // runTranscribe inside processRecallRecording stays fire-and-forget.
        try {
          await processRecallRecording(
            session.id,
            url,
            session.user_id,
            supabase
          );
        } catch (err) {
          console.error('[recall:webhook] processRecording failed:', err);
        }
      } else {
        console.warn(
          `[recall:webhook] ${event} had no recording url. payload=${rawBody.slice(0, 1000)}`
        );
      }
      break;
    }

    case 'bot.fatal': {
      const d = data as Record<string, unknown>;
      const reason =
        (typeof d.message === 'string' && d.message) ||
        (typeof d.sub_code === 'string' && d.sub_code) ||
        'Unknown fatal error';
      await updateRecallSession(
        botId,
        {
          status: 'error',
          error_reason: reason,
          ended_at: new Date().toISOString(),
        },
        supabase
      );
      break;
    }

    default:
      console.info(`[recall:webhook] unhandled event: ${event}`);
  }

  return NextResponse.json({ ok: true });
}
