/**
 * GET/PATCH /api/user/preferences
 *
 * Joins two tables:
 *   - users: email_notifications_enabled, timezone, auto_action_items_enabled
 *   - user_preferences: auto_transcribe_enabled, coach_brief_window_minutes,
 *                       manual_transcription_provider (Stories 6.2, 6.4, 6.5)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInternalUserId } from '@/lib/helpers/user';

export const runtime = 'nodejs';

// IN-list enforced at API per Story 6.5 A2 (DB allows BETWEEN 15 AND 240).
const COACH_BRIEF_WINDOWS = [30, 60, 120, 240] as const;
const MANUAL_PROVIDERS = ['deepgram', 'gladia'] as const;

const patchSchema = z
  .object({
    // users table
    email_notifications_enabled: z.boolean().optional(),
    timezone: z.string().min(1).max(100).optional(),
    auto_action_items_enabled: z.boolean().optional(),
    // user_preferences table
    auto_transcribe_enabled: z.boolean().optional(),
    coach_brief_window_minutes: z
      .number()
      .int()
      .refine(v => (COACH_BRIEF_WINDOWS as readonly number[]).includes(v), {
        message: 'Must be one of 30, 60, 120, 240',
      })
      .optional(),
    manual_transcription_provider: z.enum(MANUAL_PROVIDERS).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field required',
  });

const USER_KEYS = [
  'email_notifications_enabled',
  'timezone',
  'auto_action_items_enabled',
] as const;
const PREF_KEYS = [
  'auto_transcribe_enabled',
  'coach_brief_window_minutes',
  'manual_transcription_provider',
] as const;

export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const userId = await getInternalUserId(supabase, clerkUserId);
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const [userRes, prefRes] = await Promise.all([
    supabase
      .from('users')
      .select(
        'email_notifications_enabled, timezone, auto_action_items_enabled'
      )
      .eq('id', userId)
      .single(),
    supabase
      .from('user_preferences')
      .select(
        'auto_transcribe_enabled, coach_brief_window_minutes, manual_transcription_provider'
      )
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  const u = userRes.data ?? {};
  const p = prefRes.data ?? {};

  return NextResponse.json({
    email_notifications_enabled:
      (u as Record<string, unknown>).email_notifications_enabled ?? true,
    timezone: (u as Record<string, unknown>).timezone ?? 'UTC',
    auto_action_items_enabled:
      (u as Record<string, unknown>).auto_action_items_enabled ?? false,
    auto_transcribe_enabled:
      (p as Record<string, unknown>).auto_transcribe_enabled ?? true,
    coach_brief_window_minutes:
      (p as Record<string, unknown>).coach_brief_window_minutes ?? 60,
    manual_transcription_provider:
      (p as Record<string, unknown>).manual_transcription_provider ??
      'deepgram',
  });
}

export async function PATCH(req: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();
  const userId = await getInternalUserId(supabase, clerkUserId);
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const userUpdate: Record<string, unknown> = {};
  const prefUpdate: Record<string, unknown> = {};
  for (const k of USER_KEYS) {
    if (k in parsed.data) {
      userUpdate[k] = (parsed.data as Record<string, unknown>)[k];
    }
  }
  for (const k of PREF_KEYS) {
    if (k in parsed.data) {
      prefUpdate[k] = (parsed.data as Record<string, unknown>)[k];
    }
  }

  const failures: string[] = [];

  if (Object.keys(userUpdate).length > 0) {
    const { error } = await supabase
      .from('users')
      .update({ ...userUpdate, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) {
      console.error('[user/preferences] users update failed', error);
      failures.push('users');
    }
  }

  if (Object.keys(prefUpdate).length > 0) {
    // Upsert — user_preferences row is created lazily for older users.
    const { error } = await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          ...prefUpdate,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    if (error) {
      console.error('[user/preferences] user_preferences upsert failed', error);
      failures.push('user_preferences');
    }
  }

  if (failures.length === 2) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
  if (failures.length === 1) {
    return NextResponse.json(
      { ok: true, partial: true, failed: failures },
      { status: 207 }
    );
  }
  return NextResponse.json({ ok: true });
}
