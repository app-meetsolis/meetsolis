/**
 * POST /api/stripe/checkout
 * Create Stripe checkout session
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getBillingProvider } from '@/lib/billing/index';
import { z } from 'zod';

const BodySchema = z.object({
  plan: z.enum(['monthly', 'annual']),
});

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );

    const body = await request.json();
    const validation = BodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const billing = getBillingProvider();
    const session = await billing.createCheckoutSession(
      clerkUserId,
      validation.data.plan
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Stripe/Checkout] error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create checkout session',
        },
      },
      { status: 500 }
    );
  }
}
