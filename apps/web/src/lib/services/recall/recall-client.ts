/**
 * Recall.ai API wrapper (Story 6.2)
 * Covers: createBot, getBot
 * Auth: Authorization header with API key (Token prefix optional per docs)
 */

import { config } from '@/lib/config/env';
import type {
  RecallCreateBotRequest,
  RecallCreateBotResponse,
  RecallGetBotResponse,
} from '@meetsolis/shared';

function getHeaders(): HeadersInit {
  if (!config.recall.apiKey) {
    throw new Error('RECALL_API_KEY is not configured');
  }
  return {
    Authorization: config.recall.apiKey,
    'Content-Type': 'application/json',
  };
}

export async function createRecallBot(
  params: RecallCreateBotRequest
): Promise<RecallCreateBotResponse> {
  const res = await fetch(`${config.recall.baseUrl}/bot`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Recall.ai createBot failed: ${res.status} ${res.statusText} — ${body}`
    );
  }

  return res.json() as Promise<RecallCreateBotResponse>;
}

export async function getRecallBot(
  botId: string
): Promise<RecallGetBotResponse> {
  const res = await fetch(`${config.recall.baseUrl}/bot/${botId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Recall.ai getBot failed: ${res.status} ${res.statusText} — ${body}`
    );
  }

  return res.json() as Promise<RecallGetBotResponse>;
}

/**
 * Fetch recording details by id (post-call).
 * The download URL lives inside this response — webhook payload only carries id.
 */
export async function getRecallRecording(
  recordingId: string
): Promise<unknown> {
  const res = await fetch(`${config.recall.baseUrl}/recording/${recordingId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Recall.ai getRecording failed: ${res.status} ${res.statusText} — ${body}`
    );
  }

  return res.json();
}

/**
 * Recall.ai recording response — the playable media URL lives in one of a few
 * possible shapes depending on the recording_config requested. Prefers the
 * mixed audio track, falling back to the mixed video (mp4 plays in <audio>).
 */
export function extractRecordingMediaUrl(recording: unknown): string | null {
  if (!recording || typeof recording !== 'object') return null;
  const r = recording as Record<string, unknown>;

  // Older API: audio_url / video_url at top level.
  if (typeof r.audio_url === 'string') return r.audio_url;
  if (typeof r.video_url === 'string') return r.video_url;

  // Newer API: media_shortcuts.{audio_mixed,video_mixed}.data.download_url.
  const ms = r.media_shortcuts as Record<string, unknown> | undefined;
  if (ms) {
    for (const key of ['audio_mixed', 'video_mixed'] as const) {
      const node = ms[key] as Record<string, unknown> | undefined;
      const nodeData = node?.data as Record<string, unknown> | undefined;
      if (nodeData && typeof nodeData.download_url === 'string') {
        return nodeData.download_url;
      }
    }
  }

  return null;
}

/**
 * Fetch a fresh, non-expired playable media URL for a recording.
 * Recall signed S3 URLs expire — always re-fetch rather than caching.
 */
export async function getRecallRecordingMediaUrl(
  recordingId: string
): Promise<string | null> {
  const recording = await getRecallRecording(recordingId);
  return extractRecordingMediaUrl(recording);
}
