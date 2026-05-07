import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ServiceFactory } from '@/lib/service-factory';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { BillingPlan } from '@meetsolis/shared';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const plan = req.nextUrl.searchParams.get('plan') as BillingPlan | null;
  if (!plan || plan !== 'monthly') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServerClient();

    // Resolve Supabase user UUID from Clerk ID. Auto-create row if missing
    // (Clerk webhook may not have fired yet or may not be configured).
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .maybeSingle();

    let supabaseUserId = existingUser?.id as string | undefined;

    if (!supabaseUserId) {
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

      const { data: inserted, error: insertErr } = await supabase
        .from('users')
        .insert({ clerk_id: userId, email, name, role: 'host' })
        .select('id')
        .single();

      if (insertErr || !inserted) {
        console.error(
          '[billing/checkout] user insert failed:',
          insertErr?.message
        );
        return NextResponse.json(
          { error: 'Failed to provision user' },
          { status: 500 }
        );
      }
      supabaseUserId = inserted.id as string;
    }

    const billing = ServiceFactory.createBillingService();
    const origin = req.nextUrl.origin;
    const session = await billing.createCheckoutSession(
      supabaseUserId,
      plan,
      `${origin}/settings?upgrade=success`,
      `${origin}/settings?upgrade=cancelled`
    );
    return NextResponse.redirect(session.checkout_url, 302);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    console.error('[billing/checkout]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
