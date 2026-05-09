import DodoPayments from 'dodopayments';
import type {
  BillingService,
  BillingPlan,
  CheckoutSession,
  WebhookEvent,
  SubscriptionDetails,
} from '@meetsolis/shared';
import { config } from '@/lib/config/env';

export class DodoBillingService implements BillingService {
  private client: DodoPayments;

  constructor(
    apiKey: string,
    webhookKey: string,
    environment: 'test_mode' | 'live_mode'
  ) {
    this.client = new DodoPayments({
      bearerToken: apiKey,
      webhookKey,
      environment,
    });
  }

  async createCheckoutSession(
    userId: string,
    plan: BillingPlan,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession> {
    const productId =
      plan === 'monthly'
        ? config.billing.dodoProductIdMonthly
        : config.billing.dodoProductIdAnnual;

    if (!productId)
      throw new Error(`No product ID configured for plan: ${plan}`);

    const response = await this.client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      return_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { user_id: userId },
    });

    return {
      checkout_url: response.checkout_url ?? '',
      payment_id: response.session_id,
    };
  }

  verifyWebhook(payload: string, headers: Record<string, string>): boolean {
    try {
      this.client.webhooks.unwrap(payload, { headers });
      return true;
    } catch (err) {
      console.error(
        '[dodo] webhook verify failed:',
        err instanceof Error ? err.message : err
      );
      return false;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.client.subscriptions.update(subscriptionId, {
      cancel_at_next_billing_date: true,
    } as Parameters<typeof this.client.subscriptions.update>[1]);
  }

  async resumeSubscription(subscriptionId: string): Promise<void> {
    await this.client.subscriptions.update(subscriptionId, {
      cancel_at_next_billing_date: false,
    } as Parameters<typeof this.client.subscriptions.update>[1]);
  }

  async retrieveSubscription(
    subscriptionId: string
  ): Promise<SubscriptionDetails> {
    const sub = await this.client.subscriptions.retrieve(subscriptionId);
    const raw = sub as unknown as Record<string, unknown>;
    return {
      cancel_at_next_billing_date: Boolean(raw['cancel_at_next_billing_date']),
      current_period_end:
        typeof raw['current_period_end'] === 'string'
          ? raw['current_period_end']
          : null,
      status: typeof raw['status'] === 'string' ? raw['status'] : 'unknown',
    };
  }

  parseWebhookEvent(payload: string): WebhookEvent {
    const raw = JSON.parse(payload) as {
      type: string;
      data?: {
        subscription_id?: string;
        customer?: { customer_id?: string };
        customer_id?: string;
        product_id?: string;
        payment_id?: string;
        status?: string;
        metadata?: Record<string, string>;
        payment_link?: { metadata?: Record<string, string> };
      };
    };
    const data = raw.data ?? {};
    const metadata = data.metadata ?? data.payment_link?.metadata ?? {};
    return {
      type: raw.type as WebhookEvent['type'],
      data: {
        subscription_id: data.subscription_id,
        customer_id: data.customer?.customer_id ?? data.customer_id,
        product_id: data.product_id,
        payment_id: data.payment_id,
        status: data.status,
        user_id: metadata['user_id'],
      },
    };
  }
}
