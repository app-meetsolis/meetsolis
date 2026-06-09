/**
 * Story 7.2 — PATCH /api/clients/[id]/coach-notes
 *
 * Saves the private coach_notes field. NEVER touches ai_intelligence_strip.
 * BRAINSTORM §2: coach_notes is sacred — AI must never read or write it.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';

export const runtime = 'nodejs';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CoachNotesSchema = z.object({
  coach_notes: z
    .string()
    .max(5000, 'Coach notes must be at most 5,000 characters'),
});

function err(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
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

    const parsed = CoachNotesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid coach_notes payload',
            details: parsed.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) return err('USER_NOT_FOUND', 'User not found', 404);

    const { data: updated, error: updateErr } = await supabase
      .from('clients')
      .update({ coach_notes: parsed.data.coach_notes })
      .eq('id', clientId)
      .eq('user_id', userId)
      .select('coach_notes')
      .maybeSingle();

    if (updateErr) {
      console.error('[CoachNotes] Update error:', updateErr);
      return err('INTERNAL_ERROR', 'Failed to update coach notes', 500);
    }
    if (!updated) {
      return err('CLIENT_NOT_FOUND', 'Client not found or access denied', 404);
    }

    return NextResponse.json(
      { coach_notes: updated.coach_notes },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CoachNotes] PATCH error:', error);
    return err('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
