import type {
  BillingService,
  BillingPlan,
  CheckoutSession,
  WebhookEvent,
  SubscriptionDetails,
} from '@meetsolis/shared';

export class PlaceholderBillingService implements BillingService {
  async createCheckoutSession(
    userId: string,
    _plan: BillingPlan,
    successUrl: string,
    _cancelUrl: string
  ): Promise<CheckoutSession> {
    const url = new URL(successUrl);
    url.searchParams.set('simulated', 'true');
    url.searchParams.set('user_id', userId);
    return {
      checkout_url: url.toString(),
      payment_id: `sim_${Date.now()}`,
    };
  }

  verifyWebhook(_payload: string, _headers: Record<string, string>): boolean {
    return true;
  }

  parseWebhookEvent(payload: string): WebhookEvent {
    return JSON.parse(payload) as WebhookEvent;
  }

  // eslint-disable-next-line no-unused-vars
  async cancelSubscription(_id: string): Promise<void> {}

  // eslint-disable-next-line no-unused-vars
  async resumeSubscription(_id: string): Promise<void> {}

  // eslint-disable-next-line no-unused-vars
  async retrieveSubscription(_id: string): Promise<SubscriptionDetails> {
    return {
      cancel_at_next_billing_date: false,
      current_period_end: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: 'active',
    };
  }
}
