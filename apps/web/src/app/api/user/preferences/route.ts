import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInternalUserId } from '@/lib/helpers/user';

export const runtime = 'nodejs';

const patchSchema = z
  .object({
    email_notifications_enabled: z.boolean().optional(),
    timezone: z.string().min(1).max(100).optional(),
  })
  .refine(
    data =>
      data.email_notifications_enabled !== undefined ||
      data.timezone !== undefined,
    { message: 'At least one field required' }
  );

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

  const { data } = await supabase
    .from('users')
    .select('email_notifications_enabled, timezone')
    .eq('id', userId)
    .single();

  return NextResponse.json({
    email_notifications_enabled: data?.email_notifications_enabled ?? true,
    timezone: data?.timezone ?? 'UTC',
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

  const { error } = await supabase
    .from('users')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
