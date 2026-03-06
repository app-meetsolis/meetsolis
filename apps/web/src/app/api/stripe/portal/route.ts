/**
 * POST /api/stripe/portal
 * Create Stripe customer portal session
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { getBillingProvider } from '@/lib/billing/index';

function supabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );

    const db = supabase();
    const { data: sub } = await db
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', clerkUserId)
      .single();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_SUBSCRIPTION',
            message: 'No active subscription found',
          },
        },
        { status: 404 }
      );
    }

    const billing = getBillingProvider();
    const session = await billing.createPortalSession(sub.stripe_customer_id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Stripe/Portal] error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
