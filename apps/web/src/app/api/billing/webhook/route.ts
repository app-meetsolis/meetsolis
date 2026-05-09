import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { ServiceFactory } from '@/lib/service-factory';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { config } from '@/lib/config/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const webhookId = req.headers.get('webhook-id') ?? '';

  const webhookHeaders = {
    'webhook-id': webhookId,
    'webhook-timestamp': req.headers.get('webhook-timestamp') ?? '',
    'webhook-signature': req.headers.get('webhook-signature') ?? '',
  };

  Sentry.addBreadcrumb({
    category: 'billing.webhook',
    message: 'received',
    level: 'info',
    data: { webhook_id: webhookId },
  });

  const billing = ServiceFactory.createBillingService();

  if (!billing.verifyWebhook(payload, webhookHeaders)) {
    Sentry.captureMessage('billing.webhook signature invalid', {
      level: 'warning',
      tags: { webhook_id: webhookId },
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = billing.parseWebhookEvent(payload);
  const supabase = getSupabaseServerClient();

  Sentry.addBreadcrumb({
    category: 'billing.webhook',
    message: `event ${event.type}`,
    level: 'info',
    data: {
      type: event.type,
      customer_id: event.data.customer_id,
      subscription_id: event.data.subscription_id,
      has_user_id: !!event.data.user_id,
    },
  });

  try {
    switch (event.type) {
      case 'subscription.active':
      case 'payment.succeeded': {
        const { customer_id, subscription_id, product_id, user_id } =
          event.data;

        if (!user_id) {
          Sentry.captureMessage('billing.webhook missing user_id in metadata', {
            level: 'warning',
            tags: { type: event.type, webhook_id: webhookId },
            extra: { customer_id, subscription_id },
          });
          return NextResponse.json({ received: true });
        }

        const allowedProducts = [config.billing.dodoProductIdMonthly].filter(
          Boolean
        ) as string[];
        if (product_id && !allowedProducts.includes(product_id)) {
          Sentry.captureMessage('billing.webhook product_id not recognized', {
            level: 'warning',
            tags: { type: event.type, webhook_id: webhookId },
            extra: { product_id, allowed: allowedProducts },
          });
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
          Sentry.captureException(new Error(error.message), {
            tags: {
              type: event.type,
              webhook_id: webhookId,
              op: 'subscription.upsert',
            },
            extra: { user_id, customer_id },
          });
          return NextResponse.json(
            { error: 'Internal error' },
            { status: 500 }
          );
        }

        Sentry.addBreadcrumb({
          category: 'billing.webhook',
          message: 'upgraded user',
          level: 'info',
          data: { user_id },
        });
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

        Sentry.addBreadcrumb({
          category: 'billing.webhook',
          message: 'downgraded to free',
          level: 'info',
          data: { subscription_id, user_id },
        });
        break;
      }

      case 'subscription.on_hold': {
        const { subscription_id } = event.data;
        if (!subscription_id) break;
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('dodo_subscription_id', subscription_id);

        Sentry.addBreadcrumb({
          category: 'billing.webhook',
          message: 'subscription on hold',
          level: 'warning',
          data: { subscription_id },
        });
        break;
      }

      case 'subscription.updated': {
        const { subscription_id } = event.data;
        if (!subscription_id) break;

        try {
          const details = await billing.retrieveSubscription(subscription_id);
          await supabase
            .from('subscriptions')
            .update({
              cancel_at_period_end: details.cancel_at_next_billing_date,
              ...(details.current_period_end
                ? { current_period_end: details.current_period_end }
                : {}),
              updated_at: new Date().toISOString(),
            })
            .eq('dodo_subscription_id', subscription_id);

          Sentry.addBreadcrumb({
            category: 'billing.webhook',
            message: 'subscription.updated synced',
            level: 'info',
            data: {
              subscription_id,
              cancel_at_period_end: details.cancel_at_next_billing_date,
            },
          });
        } catch (retrieveErr) {
          Sentry.captureException(retrieveErr, {
            tags: { type: event.type, webhook_id: webhookId, op: 'retrieve' },
          });
        }
        break;
      }

      case 'payment.failed':
      default:
        break;
    }
  } catch (err) {
    Sentry.captureException(err, {
      tags: { type: event.type, webhook_id: webhookId },
    });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
