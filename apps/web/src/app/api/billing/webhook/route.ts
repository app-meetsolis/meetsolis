import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ServiceFactory } from '@/lib/service-factory';
import { config } from '@/lib/config/env';

// Disable body parsing — webhook signature verification requires raw body
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('webhook-signature') ?? '';

  const billing = ServiceFactory.createBillingService();

  if (!billing.verifyWebhook(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = billing.parseWebhookEvent(payload);

  const supabase = createClient(
    config.supabase.url!,
    config.supabase.serviceRoleKey!
  );

  try {
    switch (event.type) {
      case 'subscription.active': {
        const { customer_id, subscription_id, product_id } = event.data;
        if (!customer_id || !subscription_id) break;

        // Find user by dodo_customer_id (may not exist on first activation)
        const { data: existing } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('dodo_customer_id', customer_id)
          .single();

        if (existing) {
          await supabase
            .from('subscriptions')
            .update({
              plan: 'pro',
              status: 'active',
              dodo_subscription_id: subscription_id,
              dodo_product_id: product_id ?? null,
              updated_at: new Date().toISOString(),
            })
            .eq('dodo_customer_id', customer_id);
        }
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        const { subscription_id } = event.data;
        if (!subscription_id) break;

        await supabase
          .from('subscriptions')
          .update({
            plan: 'free',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('dodo_subscription_id', subscription_id);
        break;
      }

      case 'subscription.on_hold': {
        const { subscription_id } = event.data;
        if (!subscription_id) break;

        await supabase
          .from('subscriptions')
          .update({
            status: 'on_hold',
            updated_at: new Date().toISOString(),
          })
          .eq('dodo_subscription_id', subscription_id);
        break;
      }

      case 'payment.succeeded':
      case 'subscription.updated':
      case 'payment.failed':
        // No DB action needed — subscription.active handles state changes
        break;

      default:
        break;
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Webhook processing failed';
    console.error('[billing/webhook]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
