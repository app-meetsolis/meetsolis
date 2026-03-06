/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { getBillingProvider } from '@/lib/billing/index';

function supabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    const billing = getBillingProvider();
    const event = await billing.handleWebhook(payload, signature);

    const db = supabase();

    if (event.type === 'checkout.completed' && event.userId) {
      await db.from('subscriptions').upsert(
        {
          user_id: event.userId,
          plan: 'pro',
          status: 'active',
          stripe_customer_id: event.customerId,
          stripe_subscription_id: event.subscriptionId,
        },
        { onConflict: 'user_id' }
      );
    }

    if (event.type === 'subscription.activated' && event.customerId) {
      await db
        .from('subscriptions')
        .update({
          plan: 'pro',
          status: 'active',
          current_period_end: event.periodEnd?.toISOString(),
        })
        .eq('stripe_customer_id', event.customerId);
    }

    if (event.type === 'subscription.canceled' && event.customerId) {
      await db
        .from('subscriptions')
        .update({ plan: 'free', status: 'canceled' })
        .eq('stripe_customer_id', event.customerId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe/Webhook] error:', error);
    return NextResponse.json(
      { error: { code: 'WEBHOOK_ERROR' } },
      { status: 400 }
    );
  }
}
