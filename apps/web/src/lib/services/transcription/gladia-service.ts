/**
 * Bot recording transcription router (Story 6.3).
 *
 * `transcribeBotRecording` is the single entry point the Recall webhook calls
 * once a recording is ready. It routes to one of three providers:
 *
 *   USE_MOCK_SERVICES=true        → canned fixture (dev / test only)
 *   real services, no GLADIA key  → Deepgram batch (real transcription)
 *   real services, GLADIA key set → Gladia (real transcription, diarized)
 *
 * All three produce a DiarizedUtterance[] that flows through the identical
 * downstream pipeline (handleGladiaDone): speaker mapping, summary, the
 * speaker-reassignment UI. Gladia is the optional quality upgrade — flip it on
 * by setting GLADIA_API_KEY, no code change required.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import {
  handleGladiaDone,
  runGladiaFailureRecovery,
} from '@/lib/sessions/process-recall-transcript';
import { transcribeRecordingWithDeepgram } from './deepgram-batch';
import { MOCK_DIARIZED_UTTERANCES } from './gladia-fixture';

/** Synthetic job-id prefixes — mark which provider ran + drive idempotency. */
export const GLADIA_MOCK_JOB_PREFIX = 'mock-gladia-';
export const DEEPGRAM_JOB_PREFIX = 'deepgram-';

/** Retry backoff for 5xx submit failures. Zeroed under test for fast specs. */
const RETRY_DELAYS_MS =
  config.app.env === 'test' ? [0, 0, 0] : [1000, 4000, 16000];

interface GladiaSubmitResponse {
  id: string;
  result_url?: string;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Build the Gladia callback URL. Gladia does NOT sign per-job callbacks
 * (confirmed against Gladia v2 docs — `callback_config` callbacks are
 * unsigned), so authenticity is enforced with a shared-secret token in the
 * URL, which /api/gladia/webhook checks. See verify-gladia-callback.ts.
 */
export function buildGladiaCallbackUrl(): string {
  const base = `${config.app.url}/api/gladia/webhook`;
  return config.gladia.webhookSecret
    ? `${base}?token=${encodeURIComponent(config.gladia.webhookSecret)}`
    : base;
}

/**
 * POST to Gladia /pre-recorded with exponential backoff on 5xx.
 * 4xx fails immediately (a retry would not help). Throws after the last retry.
 */
async function submitWithRetry(
  audioUrl: string
): Promise<GladiaSubmitResponse> {
  const body = JSON.stringify({
    audio_url: audioUrl,
    diarization: true,
    diarization_config: { min_speakers: 2, max_speakers: 4 },
    // `callback_url` is deprecated in Gladia v2 — use callback + callback_config.
    callback: true,
    callback_config: { url: buildGladiaCallbackUrl(), method: 'POST' },
  });

  let lastError = '';
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1]);

    let res: Response;
    try {
      res = await fetch(`${config.gladia.baseUrl}/pre-recorded`, {
        method: 'POST',
        headers: {
          'x-gladia-key': config.gladia.apiKey as string,
          'Content-Type': 'application/json',
        },
        body,
      });
    } catch (err) {
      // Network error — treat like a 5xx and retry.
      lastError = err instanceof Error ? err.message : String(err);
      continue;
    }

    if (res.ok) {
      return (await res.json()) as GladiaSubmitResponse;
    }

    const text = await res.text().catch(() => '');
    lastError = `Gladia ${res.status}: ${text}`;
    // Only 5xx is retryable.
    if (res.status < 500) break;
  }

  throw new Error(lastError || 'Gladia submit failed');
}

/** Mark the recall_session with a job id (idempotency) + transcribing status. */
async function markTranscribing(
  recallSessionId: string,
  jobId: string,
  supabase: SupabaseClient
): Promise<void> {
  await supabase
    .from('recall_sessions')
    .update({ gladia_job_id: jobId, status: 'transcribing' })
    .eq('id', recallSessionId);
}

/** Gladia path — async: submit, store the real job id, await the callback. */
async function submitToGladia(
  recallSessionId: string,
  audioUrl: string,
  supabase: SupabaseClient
): Promise<void> {
  try {
    const job = await submitWithRetry(audioUrl);
    await markTranscribing(recallSessionId, job.id, supabase);
    console.info(
      `[transcribe] Gladia job ${job.id} submitted for ${recallSessionId}`
    );
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(
      `[transcribe] Gladia submit failed ${recallSessionId}:`,
      reason
    );
    await runGladiaFailureRecovery(
      recallSessionId,
      `Gladia submission failed: ${reason}`,
      supabase
    );
  }
}

/** Deepgram path — synchronous: transcribe now, run the pipeline inline. */
async function transcribeWithDeepgram(
  recallSessionId: string,
  audioUrl: string,
  supabase: SupabaseClient
): Promise<void> {
  // Mark before the API call so a duplicate webhook can't double-transcribe.
  await markTranscribing(
    recallSessionId,
    `${DEEPGRAM_JOB_PREFIX}${recallSessionId}`,
    supabase
  );
  try {
    const utterances = await transcribeRecordingWithDeepgram(audioUrl);
    await handleGladiaDone(recallSessionId, utterances, supabase);
    console.info(`[transcribe] Deepgram completed for ${recallSessionId}`);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[transcribe] Deepgram failed ${recallSessionId}:`, reason);
    await runGladiaFailureRecovery(
      recallSessionId,
      `Deepgram transcription failed: ${reason}`,
      supabase
    );
  }
}

/**
 * Transcribe a bot recording. Routes by configuration (see file header).
 *
 * Idempotent: a recall_session that already has a gladia_job_id is skipped,
 * so duplicate `recording.done` webhooks do not re-transcribe / double-charge.
 */
export async function transcribeBotRecording(
  recallSessionId: string,
  supabase: SupabaseClient
): Promise<void> {
  const { data: rs, error } = await supabase
    .from('recall_sessions')
    .select('raw_recording_url, gladia_job_id')
    .eq('id', recallSessionId)
    .maybeSingle();

  if (error || !rs) {
    console.error(`[transcribe] recall_session not found: ${recallSessionId}`);
    return;
  }
  if (rs.gladia_job_id) {
    console.info(
      `[transcribe] already started for ${recallSessionId} — skipping`
    );
    return;
  }
  if (!rs.raw_recording_url) {
    console.warn(
      `[transcribe] no raw_recording_url for ${recallSessionId} — skipping`
    );
    return;
  }

  // --- Mock mode: canned fixture through the pipeline (dev / test only). ---
  if (config.useMockServices) {
    await markTranscribing(
      recallSessionId,
      `${GLADIA_MOCK_JOB_PREFIX}${recallSessionId}`,
      supabase
    );
    console.info(
      `[transcribe] mock mode — processing fixture for ${recallSessionId}`
    );
    await handleGladiaDone(recallSessionId, MOCK_DIARIZED_UTTERANCES, supabase);
    return;
  }

  // --- Real transcription: Gladia when configured, else Deepgram. ---
  if (config.gladia.apiKey) {
    await submitToGladia(recallSessionId, rs.raw_recording_url, supabase);
  } else {
    await transcribeWithDeepgram(
      recallSessionId,
      rs.raw_recording_url,
      supabase
    );
  }
}
