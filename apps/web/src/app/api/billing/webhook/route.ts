import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/lib/service-factory';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { config } from '@/lib/config/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const payload = await req.text();

  // Standard Webhooks spec requires all 3 headers for signature verification
  const webhookHeaders = {
    'webhook-id': req.headers.get('webhook-id') ?? '',
    'webhook-timestamp': req.headers.get('webhook-timestamp') ?? '',
    'webhook-signature': req.headers.get('webhook-signature') ?? '',
  };

  const billing = ServiceFactory.createBillingService();

  if (!billing.verifyWebhook(payload, webhookHeaders)) {
    console.error('[billing/webhook] invalid signature — rejecting');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = billing.parseWebhookEvent(payload);
  const supabase = getSupabaseServerClient();

  try {
    switch (event.type) {
      case 'subscription.active':
      case 'payment.succeeded': {
        const { customer_id, subscription_id, product_id, user_id } =
          event.data;

        if (!user_id) {
          console.error(
            '[billing/webhook] missing user_id in metadata',
            event.data
          );
          return NextResponse.json({ received: true });
        }

        // Validate product_id matches our configured products. Defends against
        // forged/spoofed events activating pro plan via arbitrary products.
        const allowedProducts = [config.billing.dodoProductIdMonthly].filter(
          Boolean
        ) as string[];
        if (product_id && !allowedProducts.includes(product_id)) {
          console.error(
            '[billing/webhook] product_id not recognized — refusing upgrade',
            { product_id }
          );
          return NextResponse.json({ received: true });
        }

        const upsertPayload: Record<string, string | null> = {
          user_id,
          plan: 'pro',
          status: 'active',
          updated_at: new Date().toISOString(),
        };
        if (customer_id) upsertPayload.dodo_customer_id = customer_id;
        if (subscription_id)
          upsertPayload.dodo_subscription_id = subscription_id;
        if (product_id) upsertPayload.dodo_product_id = product_id;

        const { error } = await supabase
          .from('subscriptions')
          .upsert(upsertPayload, { onConflict: 'user_id' });

        if (error) {
          console.error('[billing/webhook] upsert error:', error.message);
          return NextResponse.json(
            { error: 'Internal error' },
            { status: 500 }
          );
        }
        console.log('[billing/webhook] upgraded user:', user_id);
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        const { subscription_id, user_id } = event.data;

        const updatePayload = {
          plan: 'free',
          status: 'canceled',
          updated_at: new Date().toISOString(),
        };

        if (subscription_id) {
          await supabase
            .from('subscriptions')
            .update(updatePayload)
            .eq('dodo_subscription_id', subscription_id);
        } else if (user_id) {
          await supabase
            .from('subscriptions')
            .update(updatePayload)
            .eq('user_id', user_id);
        }
        break;
      }

      case 'subscription.on_hold': {
        const { subscription_id } = event.data;
        if (!subscription_id) break;
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('dodo_subscription_id', subscription_id);
        break;
      }

      case 'subscription.updated':
      case 'payment.failed':
      default:
        break;
    }
  } catch (err) {
    console.error(
      '[billing/webhook]',
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
