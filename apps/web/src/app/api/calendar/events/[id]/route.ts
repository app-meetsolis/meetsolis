/**
 * PATCH /api/calendar/events/[id] — update client_id (manual match) or bot_skipped.
 * Story 6.1: client_id matching. Story 6.5: bot_skipped (forward-compat).
 *
 * Optional: remember_email flag updates clients.email when matching.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInternalUserId } from '@/lib/helpers/user';

export const runtime = 'nodejs';

const patchSchema = z
  .object({
    client_id: z.string().uuid().nullable().optional(),
    bot_skipped: z.boolean().optional(),
    remember_email: z.string().email().optional(),
  })
  .refine(
    data => data.client_id !== undefined || data.bot_skipped !== undefined,
    { message: 'At least one of client_id or bot_skipped required' }
  );

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const { client_id, bot_skipped, remember_email } = parsed.data;
  const update: Record<string, unknown> = {};
  if (client_id !== undefined) update.client_id = client_id;
  if (bot_skipped !== undefined) update.bot_skipped = bot_skipped;

  const { error } = await supabase
    .from('calendar_events')
    .update(update)
    .eq('id', params.id)
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  // Optional: also save email to client if requested + currently null
  if (remember_email && client_id) {
    await supabase
      .from('clients')
      .update({ email: remember_email })
      .eq('id', client_id)
      .eq('user_id', userId)
      .is('email', null);
  }

  return NextResponse.json({ ok: true });
}
