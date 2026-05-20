/**
 * POST /api/brief/dismiss — dismiss a Coach Brief (Story 6.4)
 * Body: { brief_id: uuid }
 * Hides the dashboard banner; brief stays accessible at /brief/[eventId].
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';

export const runtime = 'nodejs';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const BodySchema = z.object({ brief_id: z.string().uuid() });

function err(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return err('UNAUTHORIZED', 'Authentication required', 401);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return err('VALIDATION_ERROR', 'Invalid JSON body', 400);
    }

    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return err('VALIDATION_ERROR', 'Invalid brief_id', 400);
    }

    const supabase = getSupabase();
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) return err('USER_NOT_FOUND', 'User not found', 404);

    const { data: brief } = await supabase
      .from('coach_briefs')
      .select('id, user_id')
      .eq('id', parsed.data.brief_id)
      .maybeSingle();
    if (!brief || brief.user_id !== userId) {
      return err('NOT_FOUND', 'Brief not found', 404);
    }

    const { error: updateError } = await supabase
      .from('coach_briefs')
      .update({
        dismissed: true,
        dismissed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsed.data.brief_id);

    if (updateError) {
      return err('INTERNAL_ERROR', 'Failed to dismiss brief', 500);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[POST /api/brief/dismiss]', e);
    return err('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
