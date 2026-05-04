import type {
  BillingService,
  BillingPlan,
  CheckoutSession,
  WebhookEvent,
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

  verifyWebhook(_payload: string, _signature: string): boolean {
    return true;
  }

  parseWebhookEvent(payload: string): WebhookEvent {
    return JSON.parse(payload) as WebhookEvent;
  }
}
