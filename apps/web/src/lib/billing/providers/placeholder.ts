import type {
  BillingProvider,
  CheckoutSession,
  PortalSession,
  WebhookEvent,
} from '../provider';

export class PlaceholderBillingProvider implements BillingProvider {
  async createCheckoutSession(
    userId: string,
    plan: 'monthly' | 'annual'
  ): Promise<CheckoutSession> {
    const price = plan === 'monthly' ? '$99/month' : '$948/year';
    console.log(`[Billing Placeholder] Checkout for user ${userId}: ${price}`);
    return { url: '/settings?checkout=placeholder_success' };
  }

  async createPortalSession(_customerId: string): Promise<PortalSession> {
    return { url: '/settings?portal=placeholder' };
  }

  async handleWebhook(
    _payload: string,
    _signature: string
  ): Promise<WebhookEvent> {
    return { type: 'unknown' };
  }
}
