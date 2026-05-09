import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';
import { ServiceFactory } from '@/lib/service-factory';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInternalUserId } from '@/lib/helpers/user';

export const runtime = 'nodejs';

export async function POST() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const userId = await getInternalUserId(supabase, clerkUserId);
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('dodo_subscription_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!sub?.dodo_subscription_id) {
    return NextResponse.json(
      { error: 'No subscription found' },
      { status: 400 }
    );
  }

  try {
    const billing = ServiceFactory.createBillingService();
    await billing.resumeSubscription(sub.dodo_subscription_id);

    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    Sentry.addBreadcrumb({
      category: 'billing.resume',
      message: 'subscription resumed',
      level: 'info',
      data: { user_id: userId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { op: 'billing.resume' },
      extra: { user_id: userId },
    });
    return NextResponse.json({ error: 'Resume failed' }, { status: 500 });
  }
}
