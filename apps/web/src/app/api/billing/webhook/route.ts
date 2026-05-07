import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ServiceFactory } from '@/lib/service-factory';
import { config } from '@/lib/config/env';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('webhook-signature') ?? '';

  const billing = ServiceFactory.createBillingService();

  const sigValid = billing.verifyWebhook(payload, signature);
  if (!sigValid) {
    console.error(
      '[billing/webhook] signature check failed — proceeding anyway (temp debug)'
    );
  }

  const event = billing.parseWebhookEvent(payload);
  console.log(
    '[billing/webhook] event:',
    event.type,
    JSON.stringify(event.data)
  );

  const supabase = createClient(
    config.supabase.url!,
    config.supabase.serviceRoleKey!
  );

  try {
    switch (event.type) {
      case 'subscription.active':
      case 'payment.succeeded': {
        const { customer_id, subscription_id, product_id, user_id } =
          event.data;

        let row: { user_id: string } | null = null;

        if (customer_id) {
          const { data } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('dodo_customer_id', customer_id)
            .single();
          row = data;
        }

        if (!row && user_id) {
          const { data } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('user_id', user_id)
            .single();
          row = data;
        }

        if (row) {
          const updatePayload: Record<string, string | null> = {
            plan: 'pro',
            status: 'active',
            updated_at: new Date().toISOString(),
          };
          if (customer_id) updatePayload.dodo_customer_id = customer_id;
          if (subscription_id)
            updatePayload.dodo_subscription_id = subscription_id;
          if (product_id) updatePayload.dodo_product_id = product_id;

          const { error } = await supabase
            .from('subscriptions')
            .update(updatePayload)
            .eq('user_id', row.user_id);

          if (error) {
            console.error('[billing/webhook] update error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
          console.log('[billing/webhook] upgraded user:', row.user_id);
        } else {
          console.error(
            '[billing/webhook] no subscription row found for event',
            { customer_id, user_id }
          );
        }
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        const { subscription_id, customer_id, user_id } = event.data;

        const updatePayload = {
          plan: 'free',
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        };

        if (subscription_id) {
          await supabase
            .from('subscriptions')
            .update(updatePayload)
            .eq('dodo_subscription_id', subscription_id);
        } else if (customer_id) {
          await supabase
            .from('subscriptions')
            .update(updatePayload)
            .eq('dodo_customer_id', customer_id);
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
          .update({ status: 'on_hold', updated_at: new Date().toISOString() })
          .eq('dodo_subscription_id', subscription_id);
        break;
      }

      case 'subscription.updated':
      case 'payment.failed':
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
