import DodoPayments from 'dodopayments';
import type {
  BillingService,
  BillingPlan,
  CheckoutSession,
  WebhookEvent,
} from '@meetsolis/shared';

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
      plan === 'monthly' ? process.env.DODO_PRODUCT_ID_MONTHLY : null;

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

  verifyWebhook(payload: string, signature: string): boolean {
    try {
      this.client.webhooks.unwrap(payload, {
        headers: { 'webhook-signature': signature },
      });
      return true;
    } catch {
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
      };
    };
    const data = raw.data ?? {};
    return {
      type: raw.type as WebhookEvent['type'],
      data: {
        subscription_id: data.subscription_id,
        customer_id: data.customer?.customer_id ?? data.customer_id,
        product_id: data.product_id,
        payment_id: data.payment_id,
        status: data.status,
      },
    };
  }
}
