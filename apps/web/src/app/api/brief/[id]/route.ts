/**
 * PATCH /api/brief/[id] — inline edits to a Coach Brief (Story 6.4)
 *
 * AI fields are coach-editable: ai_prep_note, key_theme, suggested_questions,
 * breakthroughs. Edited keys are tracked in content.edited_fields to drive
 * the "edited" pencil icon on the screen.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';
import { CoachBriefPatchSchema } from '@meetsolis/shared';
import type { CoachBriefContent } from '@meetsolis/shared';

export const runtime = 'nodejs';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

function err(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!UUID_REGEX.test(params.id)) {
      return err('VALIDATION_ERROR', 'Invalid brief ID', 400);
    }

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return err('UNAUTHORIZED', 'Authentication required', 401);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return err('VALIDATION_ERROR', 'Invalid JSON body', 400);
    }

    const parsed = CoachBriefPatchSchema.safeParse(body);
    if (!parsed.success) {
      return err(
        'VALIDATION_ERROR',
        parsed.error.issues[0]?.message ?? 'Invalid input',
        400
      );
    }

    const supabase = getSupabase();
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) return err('USER_NOT_FOUND', 'User not found', 404);

    const { data: brief } = await supabase
      .from('coach_briefs')
      .select('id, user_id, content')
      .eq('id', params.id)
      .maybeSingle();
    if (!brief || brief.user_id !== userId) {
      return err('NOT_FOUND', 'Brief not found', 404);
    }

    const content = brief.content as CoachBriefContent;
    const edited = new Set(content.edited_fields ?? []);
    const patch = parsed.data;

    if (patch.ai_prep_note !== undefined) {
      content.ai_prep_note = patch.ai_prep_note;
      edited.add('ai_prep_note');
    }
    if (patch.key_theme !== undefined && content.last_session) {
      content.last_session.key_theme = patch.key_theme;
      edited.add('key_theme');
    }
    if (patch.suggested_questions !== undefined) {
      content.suggested_questions = patch.suggested_questions;
      edited.add('suggested_questions');
    }
    if (patch.breakthroughs !== undefined) {
      content.past_breakthroughs = patch.breakthroughs;
      edited.add('breakthroughs');
    }
    content.edited_fields = Array.from(edited);

    const { data: updated, error: updateError } = await supabase
      .from('coach_briefs')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError || !updated) {
      return err('INTERNAL_ERROR', 'Failed to update brief', 500);
    }

    return NextResponse.json({ brief: updated });
  } catch (e) {
    console.error('[PATCH /api/brief/[id]]', e);
    return err('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
