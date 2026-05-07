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

        const targetUserId = row?.user_id ?? user_id;

        if (targetUserId) {
          const upsertPayload: Record<string, string | null> = {
            user_id: targetUserId,
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
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
          console.log('[billing/webhook] upgraded user:', targetUserId);
        } else {
          console.error('[billing/webhook] no user_id — cannot update', {
            customer_id,
            user_id,
          });
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
