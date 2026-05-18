/**
 * POST /api/gladia/webhook
 * Gladia v2 pre-recorded callback — fires when a transcription job finishes
 * (Story 6.3).
 *
 * Gladia does not sign per-job callbacks, so authenticity is a shared-secret
 * token in the URL (`?token=`). The body discriminates on `event`:
 *   transcription.success → diarized utterances under payload.transcription
 *   transcription.error   → failure-recovery fallback
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { verifyGladiaCallbackToken } from '@/lib/services/transcription/verify-gladia-callback';
import {
  handleGladiaDone,
  runGladiaFailureRecovery,
} from '@/lib/sessions/process-recall-transcript';

export const runtime = 'nodejs';

// Gladia UtteranceDTO — `speaker` is only present when diarization ran, so it
// is optional and defaults to 0. Unknown fields (words, confidence, …) strip.
const UtteranceSchema = z.object({
  speaker: z.number().int().nonnegative().optional().default(0),
  text: z.string(),
  start: z.number(),
  end: z.number(),
});

const GladiaCallbackSchema = z.object({
  id: z.string().min(1),
  event: z.enum(['transcription.success', 'transcription.error']),
  payload: z
    .object({
      transcription: z
        .object({ utterances: z.array(UtteranceSchema).default([]) })
        .optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  // --- 1. Authenticity: shared-secret token in the callback URL. ---
  const token = req.nextUrl.searchParams.get('token');
  if (!verifyGladiaCallbackToken(token)) {
    console.warn('[gladia:webhook] invalid callback token');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- 2. Parse + validate. ---
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = GladiaCallbackSchema.safeParse(json);
  if (!parsed.success) {
    console.warn(
      `[gladia:webhook] payload validation failed: ${parsed.error.message}`
    );
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { id: jobId, event, payload } = parsed.data;
  const supabase = getSupabaseServerClient();

  // --- 3. Resolve the recall_session by Gladia job id. ---
  const { data: rs } = await supabase
    .from('recall_sessions')
    .select('id')
    .eq('gladia_job_id', jobId)
    .maybeSingle();

  if (!rs) {
    console.warn(`[gladia:webhook] no recall_session for job ${jobId}`);
    return NextResponse.json({ ok: true });
  }

  console.info(`[gladia:webhook] event=${event} job=${jobId}`);

  // --- 4. Dispatch. Work is lightweight (DB writes + one summary chain). ---
  try {
    if (event === 'transcription.success') {
      const utterances = payload?.transcription?.utterances ?? [];
      await handleGladiaDone(rs.id, utterances, supabase);
    } else {
      await runGladiaFailureRecovery(
        rs.id,
        'Gladia reported a transcription error',
        supabase
      );
    }
  } catch (err) {
    console.error(
      '[gladia:webhook] processing failed:',
      err instanceof Error ? err.message : String(err)
    );
  }

  return NextResponse.json({ ok: true });
}
