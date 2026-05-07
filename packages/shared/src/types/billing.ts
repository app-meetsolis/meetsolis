export type BillingPlan = 'monthly';

export interface CheckoutSession {
  checkout_url: string;
  payment_id: string;
}

export type WebhookEventType =
  | 'payment.succeeded'
  | 'subscription.active'
  | 'subscription.updated'
  | 'subscription.cancelled'
  | 'subscription.expired'
  | 'subscription.on_hold'
  | 'payment.failed';

export interface WebhookEvent {
  type: WebhookEventType;
  data: {
    subscription_id?: string;
    customer_id?: string;
    product_id?: string;
    payment_id?: string;
    status?: string;
  };
}

export interface BillingService {
  createCheckoutSession(
    userId: string,
    plan: BillingPlan,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession>;
  verifyWebhook(payload: string, signature: string): boolean;
  parseWebhookEvent(payload: string): WebhookEvent;
}
