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
    .select('dodo_subscription_id, current_period_end')
    .eq('user_id', userId)
    .maybeSingle();

  if (!sub?.dodo_subscription_id) {
    return NextResponse.json(
      { error: 'No active subscription' },
      { status: 400 }
    );
  }

  try {
    const billing = ServiceFactory.createBillingService();
    await billing.cancelSubscription(sub.dodo_subscription_id);

    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    Sentry.addBreadcrumb({
      category: 'billing.cancel',
      message: 'subscription cancel scheduled',
      level: 'info',
      data: { user_id: userId },
    });

    return NextResponse.json({ ok: true, period_end: sub.current_period_end });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { op: 'billing.cancel' },
      extra: { user_id: userId },
    });
    return NextResponse.json({ error: 'Cancel failed' }, { status: 500 });
  }
}
