/**
 * Story 7.2 — AI Intelligence Strip routes for a single client.
 *
 * POST  /api/clients/[id]/intelligence-strip — Pro-only manual regen
 * PATCH /api/clients/[id]/intelligence-strip — coach edits any AI-filled field
 *
 * RLS via user_id scoping. coach_notes is NOT writeable here; use /coach-notes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';
import { getUserTier } from '@/lib/billing/checkUsage';
import { generateIntelligenceStrip } from '@/lib/clients/generate-intelligence-strip';
import {
  STRIP_FIELDS,
  type AIIntelligenceStrip,
  type AIIntelligenceStripOverrides,
  type StripField,
} from '@meetsolis/shared';

export const runtime = 'nodejs';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

function err(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

// PATCH body: any subset of AI fields (coach edit) OR clear list to drop
// override flags. NEVER generated_at. At least one of the two MUST be set.
const StripFieldEnum = z.enum(STRIP_FIELDS);
const StripPatchSchema = z
  .object({
    recurring_theme: z.string().optional(),
    theme_frequency: z.string().optional(),
    recent_breakthrough: z.string().optional(),
    current_focus: z.string().optional(),
    /** Story 7.7. List of fields to drop coach-override (so AI regenerates them next time). */
    clear_overrides: z.array(StripFieldEnum).optional(),
  })
  .strict()
  .refine(
    obj => {
      const editKeys = Object.keys(obj).filter(k => k !== 'clear_overrides');
      const clearLen = obj.clear_overrides?.length ?? 0;
      return editKeys.length > 0 || clearLen > 0;
    },
    { message: 'At least one field or clear_overrides entry required' }
  );

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    if (!UUID_REGEX.test(clientId)) {
      return err('INVALID_ID', 'Invalid client ID', 400);
    }

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return err('UNAUTHORIZED', 'Authentication required', 401);

    const supabase = getSupabase();
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) return err('USER_NOT_FOUND', 'User not found', 404);

    // First-generation (strip currently null) is allowed for both tiers —
    // matches the auto-regen-runs-for-both-tiers locked decision (BRAINSTORM §2,
    // story 7.2 A9). Subsequent manual refresh is Pro-only.
    const { data: existingRow } = await supabase
      .from('clients')
      .select('ai_intelligence_strip')
      .eq('id', clientId)
      .eq('user_id', userId)
      .maybeSingle();
    const isFirstGen = !existingRow?.ai_intelligence_strip;

    if (!isFirstGen) {
      const tier = await getUserTier(userId, supabase);
      if (tier !== 'pro') {
        return NextResponse.json(
          {
            error: {
              code: 'UPGRADE_REQUIRED',
              message:
                'Manual refresh is a Pro feature. Auto-refresh still runs after every session.',
            },
          },
          { status: 403 }
        );
      }
    }

    const result = await generateIntelligenceStrip(clientId, userId);
    if (!result.success) {
      if (result.skipped === 'client_not_found') {
        return err(
          'CLIENT_NOT_FOUND',
          'Client not found or access denied',
          404
        );
      }
      if (result.skipped === 'no_sessions') {
        return NextResponse.json(
          {
            error: {
              code: 'NO_SESSIONS',
              message: 'Add a session before refreshing insights.',
            },
          },
          { status: 422 }
        );
      }
      return err(
        'GENERATION_FAILED',
        result.error ?? 'Unable to refresh insights',
        500
      );
    }

    return NextResponse.json({ strip: result.strip }, { status: 200 });
  } catch (error) {
    console.error('[IntelligenceStrip] POST error:', error);
    return err('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    if (!UUID_REGEX.test(clientId)) {
      return err('INVALID_ID', 'Invalid client ID', 400);
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

    const parsed = StripPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid strip payload',
            details: parsed.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) return err('USER_NOT_FOUND', 'User not found', 404);

    const { data: existing, error: fetchErr } = await supabase
      .from('clients')
      .select('ai_intelligence_strip, ai_intelligence_strip_overrides')
      .eq('id', clientId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr) {
      console.error('[IntelligenceStrip] Fetch error:', fetchErr);
      return err('INTERNAL_ERROR', 'Failed to load existing strip', 500);
    }
    if (!existing) {
      return err('CLIENT_NOT_FOUND', 'Client not found or access denied', 404);
    }

    const current =
      (existing.ai_intelligence_strip as AIIntelligenceStrip | null) ?? null;
    if (!current) {
      return err(
        'NO_STRIP',
        'No insights yet — add a session before editing.',
        422
      );
    }

    const { clear_overrides: clearList, ...editPatch } = parsed.data;
    const existingOverrides =
      (existing.ai_intelligence_strip_overrides as AIIntelligenceStripOverrides | null) ??
      {};

    // Coach edits → flag the field as overridden (so AI regen preserves them)
    const nextOverrides: AIIntelligenceStripOverrides = {
      ...existingOverrides,
    };
    for (const k of Object.keys(editPatch) as StripField[]) {
      nextOverrides[k] = true;
    }
    // Clear list → drop overrides so next AI regen can rewrite those fields
    if (clearList) {
      for (const k of clearList) {
        delete nextOverrides[k];
      }
    }

    const merged: AIIntelligenceStrip = {
      ...current,
      ...editPatch,
      generated_at: current.generated_at,
    };

    const { data: updated, error: updateErr } = await supabase
      .from('clients')
      .update({
        ai_intelligence_strip: merged,
        ai_intelligence_strip_overrides: nextOverrides,
      })
      .eq('id', clientId)
      .eq('user_id', userId)
      .select('ai_intelligence_strip, ai_intelligence_strip_overrides')
      .single();

    if (updateErr || !updated) {
      console.error('[IntelligenceStrip] Update error:', updateErr);
      return err('INTERNAL_ERROR', 'Failed to update strip', 500);
    }

    return NextResponse.json(
      {
        strip: updated.ai_intelligence_strip,
        overrides: updated.ai_intelligence_strip_overrides,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[IntelligenceStrip] PATCH error:', error);
    return err('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
