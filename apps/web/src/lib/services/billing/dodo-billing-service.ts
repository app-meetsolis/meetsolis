import DodoPayments from 'dodopayments';
import type {
  BillingService,
  BillingPlan,
  CheckoutSession,
  WebhookEvent,
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
