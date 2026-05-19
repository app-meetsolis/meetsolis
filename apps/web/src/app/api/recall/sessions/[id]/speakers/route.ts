/**
 * /api/recall/sessions/[id]/speakers  ([id] = sessions.id)
 *
 * GET   — speaker map + review state for the session detail UI (Story 6.3).
 * PATCH — coach-corrected speaker map → reformat transcript + re-summarize.
 *
 * PATCH re-summarizes synchronously (awaited) so the work reliably completes
 * on Vercel serverless; the UI shows a 'Saving…' state and polls for the result.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { config } from '@/lib/config/env';
import type { DiarizedUtterance, SpeakerMap } from '@meetsolis/shared';
import { getInternalUserId } from '@/lib/helpers/user';
import { formatDiarizedTranscript } from '@/lib/sessions/format-diarized-transcript';
import { runSummarize } from '@/lib/sessions/summarize-session';
import { maybeAutoGenerateActionItems } from '@/lib/sessions/generate-action-items';

export const runtime = 'nodejs';
// PATCH awaits the summary + action-item AI chain — give it headroom.
export const maxDuration = 120;

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Labels are free text ("Custom…") but bounded — they land in transcript_text.
const SpeakersUpdateSchema = z.object({
  speaker_map: z.record(z.string().min(1), z.string().trim().min(1).max(80)),
});

function err(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Resolve the authenticated internal user id, or a NextResponse error. */
async function resolveUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { error: err('UNAUTHORIZED', 'Authentication required', 401) };
  }
  const supabase = getSupabase();
  const userId = await getInternalUserId(supabase, clerkUserId);
  if (!userId) {
    return { error: err('USER_NOT_FOUND', 'User not found', 404) };
  }
  return { userId, supabase };
}

/**
 * GET — speaker map + review banner state for the session detail view.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!UUID_REGEX.test(params.id)) {
      return err('VALIDATION_ERROR', 'Invalid session ID', 400);
    }

    const resolved = await resolveUser();
    if (resolved.error) return resolved.error;
    const { userId, supabase } = resolved;

    const { data: session } = await supabase
      .from('sessions')
      .select('user_id, recall_session_id, source')
      .eq('id', params.id)
      .single();

    if (!session || session.user_id !== userId) {
      return err('NOT_FOUND', 'Session not found', 404);
    }

    if (!session.recall_session_id) {
      return NextResponse.json({
        source: session.source,
        speaker_map: null,
        speaker_review_needed: false,
        review_note: null,
        client_name: null,
      });
    }

    const { data: rs } = await supabase
      .from('recall_sessions')
      .select('speaker_map, speaker_review_needed, error_reason, client_id')
      .eq('id', session.recall_session_id)
      .single();

    const { data: client } = rs?.client_id
      ? await supabase
          .from('clients')
          .select('name')
          .eq('id', rs.client_id)
          .single()
      : { data: null };

    return NextResponse.json({
      source: session.source,
      speaker_map: rs?.speaker_map ?? null,
      speaker_review_needed: rs?.speaker_review_needed ?? false,
      review_note: rs?.error_reason ?? null,
      client_name: client?.name ?? null,
    });
  } catch (error) {
    console.error('[speakers API] GET error:', error);
    return err('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

/**
 * PATCH — apply a coach-corrected speaker map, reformat the transcript, and
 * re-run the summary pipeline asynchronously.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!UUID_REGEX.test(params.id)) {
      return err('VALIDATION_ERROR', 'Invalid session ID', 400);
    }

    const resolved = await resolveUser();
    if (resolved.error) return resolved.error;
    const { userId, supabase } = resolved;

    const body = await request.json().catch(() => null);
    const parsed = SpeakersUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return err('VALIDATION_ERROR', 'Invalid speaker_map', 400);
    }
    const speakerMap: SpeakerMap = parsed.data.speaker_map;

    const { data: session } = await supabase
      .from('sessions')
      .select('user_id, recall_session_id')
      .eq('id', params.id)
      .single();

    if (!session || session.user_id !== userId) {
      return err('NOT_FOUND', 'Session not found', 404);
    }
    if (!session.recall_session_id) {
      return err('NOT_READY', 'Session is not a bot recording', 409);
    }

    const { data: rs } = await supabase
      .from('recall_sessions')
      .select('diarized_transcript')
      .eq('id', session.recall_session_id)
      .single();

    const utterances = (rs?.diarized_transcript ?? []) as DiarizedUtterance[];
    if (utterances.length === 0) {
      return err('NOT_READY', 'No diarized transcript to re-map', 409);
    }

    // Persist the corrected map; clear the review flag.
    await supabase
      .from('recall_sessions')
      .update({ speaker_map: speakerMap, speaker_review_needed: false })
      .eq('id', session.recall_session_id);

    // Reformat the transcript synchronously so it is correct immediately.
    await supabase
      .from('sessions')
      .update({
        transcript_text: formatDiarizedTranscript(utterances, speakerMap),
        source: 'recall_ai',
      })
      .eq('id', params.id);

    // Re-summarize synchronously. A fire-and-forget call would be unreliable
    // on Vercel serverless — the function can be frozen once the response is
    // sent, dropping the regeneration. The UI shows a 'Saving…' state for the
    // few seconds this takes, then polls for the refreshed summary.
    try {
      const status = await runSummarize(params.id, userId);
      if (status === 'complete') {
        await maybeAutoGenerateActionItems(params.id, userId, supabase);
      }
    } catch (e) {
      console.error(`[speakers API] re-summarize failed ${params.id}:`, e);
    }

    return NextResponse.json({ ok: true, speaker_map: speakerMap });
  } catch (error) {
    console.error('[speakers API] PATCH error:', error);
    return err('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
