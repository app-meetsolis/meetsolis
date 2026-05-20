/**
 * POST /api/brief/generate — manual Coach Brief generation (Story 6.4)
 *
 * Body: { calendar_event_id: uuid } OR { client_id: uuid }
 * Pro-only. Used by the brief screen ("generating" state) and the
 * "Generate Coach Brief" button on Client Cards (no-calendar fallback).
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';
import { getUserTier } from '@/lib/billing/checkUsage';
import { generateBrief } from '@/lib/brief/generate-brief';

export const runtime = 'nodejs';
export const maxDuration = 60;

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const BodySchema = z
  .object({
    calendar_event_id: z.string().uuid().optional(),
    client_id: z.string().uuid().optional(),
  })
  .refine(d => !!d.calendar_event_id !== !!d.client_id, {
    message: 'Provide exactly one of calendar_event_id or client_id',
  });

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
      return err(
        'VALIDATION_ERROR',
        parsed.error.issues[0]?.message ?? 'Invalid input',
        400
      );
    }

    const supabase = getSupabase();
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) return err('USER_NOT_FOUND', 'User not found', 404);

    const tier = await getUserTier(userId);
    if (tier !== 'pro') {
      return err('UPGRADE_REQUIRED', 'Coach Brief is a Pro feature', 403);
    }

    const { calendar_event_id: eventId, client_id: clientId } = parsed.data;

    // --- Calendar-event brief --------------------------------------------
    if (eventId) {
      const { data: event } = await supabase
        .from('calendar_events')
        .select('id, client_id, start_time')
        .eq('id', eventId)
        .eq('user_id', userId)
        .maybeSingle();
      if (!event) return err('NOT_FOUND', 'Event not found', 404);
      if (!event.client_id) {
        return err('UNMATCHED', 'Event is not matched to a client', 400);
      }

      const brief = await generateBrief({
        userId,
        clientId: event.client_id as string,
        calendarEventId: event.id as string,
        startTime: event.start_time as string,
      });
      return NextResponse.json({ brief }, { status: 201 });
    }

    // --- Manual (no-calendar) brief --------------------------------------
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId!)
      .eq('user_id', userId)
      .maybeSingle();
    if (!client) return err('NOT_FOUND', 'Client not found', 404);

    const brief = await generateBrief({
      userId,
      clientId: clientId!,
      calendarEventId: null,
      startTime: null,
    });
    return NextResponse.json({ brief }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/brief/generate]', e);
    return err('INTERNAL_ERROR', 'Failed to generate brief', 500);
  }
}
