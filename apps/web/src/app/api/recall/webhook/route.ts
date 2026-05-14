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
import { getRecallRecording } from '@/lib/services/recall/recall-client';
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

/** Extract recording_id from recording.* webhook payload (data.recording.id). */
function extractRecordingId(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const rec = d.recording as Record<string, unknown> | undefined;
  if (rec && typeof rec.id === 'string') return rec.id;
  return null;
}

/**
 * Recall.ai recording endpoint response — the download URL lives in one of a
 * few possible shapes depending on what recording_config we requested.
 */
function extractDownloadUrl(recording: unknown): string | null {
  if (!recording || typeof recording !== 'object') return null;
  const r = recording as Record<string, unknown>;

  // Older API: video_url / audio_url at top level
  if (typeof r.video_url === 'string') return r.video_url;
  if (typeof r.audio_url === 'string') return r.audio_url;

  // Newer API: media_shortcuts.{video_mixed,audio_mixed}.data.download_url
  const ms = r.media_shortcuts as Record<string, unknown> | undefined;
  if (ms) {
    for (const key of ['video_mixed', 'audio_mixed'] as const) {
      const node = ms[key] as Record<string, unknown> | undefined;
      const nodeData = node?.data as Record<string, unknown> | undefined;
      if (nodeData && typeof nodeData.download_url === 'string') {
        return nodeData.download_url;
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
      await updateRecallSession(botId, { status: 'done' }, supabase);
      break;

    case 'recording.done': {
      // Recording.done webhook only carries recording.id — fetch the
      // recording from Recall.ai's API to get the download URL.
      const recordingId = extractRecordingId(data);
      if (!recordingId) {
        console.warn(
          `[recall:webhook] recording.done had no recording.id. body=${rawBody.slice(0, 500)}`
        );
        break;
      }

      let url: string | null = null;
      try {
        const recording = await getRecallRecording(recordingId);
        url = extractDownloadUrl(recording);
        if (!url) {
          console.warn(
            `[recall:webhook] no download URL found in recording response. recording_id=${recordingId}`
          );
        }
      } catch (err) {
        console.error(
          `[recall:webhook] failed to fetch recording ${recordingId}:`,
          err instanceof Error ? err.message : String(err)
        );
      }

      const update: Parameters<typeof updateRecallSession>[1] = {
        status: 'done',
      };
      if (url) update.raw_recording_url = url;
      await updateRecallSession(botId, update, supabase);

      if (url) {
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
