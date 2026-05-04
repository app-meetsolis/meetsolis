import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ServiceFactory } from '@/lib/service-factory';
import type { BillingPlan } from '@meetsolis/shared';

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
    const billing = ServiceFactory.createBillingService();
    const origin = req.nextUrl.origin;
    const session = await billing.createCheckoutSession(
      userId,
      plan,
      `${origin}/settings?upgrade=success`,
      `${origin}/settings?upgrade=cancelled`
    );
    return NextResponse.redirect(session.checkout_url, 302);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
