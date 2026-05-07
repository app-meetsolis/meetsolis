import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ServiceFactory } from '@/lib/service-factory';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { BillingPlan } from '@meetsolis/shared';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { plan?: string } = {};
  try {
    body = await req.json();
  } catch {
    // ignore — we'll validate below
  }

  const plan = body.plan as BillingPlan | undefined;
  if (!plan || plan !== 'monthly') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServerClient();

    // Race-safe get-or-create. If two concurrent checkouts happen for the
    // same user, the upsert with ignoreDuplicates handles the conflict
    // silently and the subsequent select returns the existing row.
    let { data: row } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .maybeSingle();

    if (!row) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';
      const firstName = clerkUser?.firstName ?? '';
      const lastName = clerkUser?.lastName ?? '';
      const name = `${firstName} ${lastName}`.trim() || 'User';

      if (!email) {
        return NextResponse.json(
          { error: 'Cannot resolve user email from Clerk' },
          { status: 400 }
        );
      }

      await supabase
        .from('users')
        .upsert(
          { clerk_id: userId, email, name, role: 'host' },
          { onConflict: 'clerk_id', ignoreDuplicates: true }
        );

      const { data: refreshed, error: selectErr } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

      if (selectErr || !refreshed) {
        console.error(
          '[billing/checkout] user provision failed:',
          selectErr?.message
        );
        return NextResponse.json(
          { error: 'Failed to provision user' },
          { status: 500 }
        );
      }
      row = refreshed;
    }

    const billing = ServiceFactory.createBillingService();
    const origin = req.nextUrl.origin;
    const session = await billing.createCheckoutSession(
      row.id as string,
      plan,
      `${origin}/settings?upgrade=success`,
      `${origin}/settings?upgrade=cancelled`
    );

    return NextResponse.json({ url: session.checkout_url });
  } catch (err) {
    console.error(
      '[billing/checkout]',
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
