export interface CheckoutSession {
  url: string;
}

export interface PortalSession {
  url: string;
}

export type WebhookEventType =
  | 'checkout.completed'
  | 'subscription.activated'
  | 'subscription.canceled'
  | 'unknown';

export interface WebhookEvent {
  type: WebhookEventType;
  userId?: string;
  customerId?: string;
  subscriptionId?: string;
  plan?: 'free' | 'pro';
  periodEnd?: Date;
}

export interface BillingProvider {
  createCheckoutSession(
    userId: string,
    plan: 'monthly' | 'annual'
  ): Promise<CheckoutSession>;
  createPortalSession(customerId: string): Promise<PortalSession>;
  handleWebhook(payload: string, signature: string): Promise<WebhookEvent>;
}
