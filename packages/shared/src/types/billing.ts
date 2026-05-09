export type BillingPlan = 'monthly' | 'annual';

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
    user_id?: string;
  };
}

export interface SubscriptionDetails {
  cancel_at_next_billing_date: boolean;
  current_period_end?: string | null;
  status: string;
}

export interface BillingService {
  createCheckoutSession(
    userId: string,
    plan: BillingPlan,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession>;
  verifyWebhook(payload: string, headers: Record<string, string>): boolean;
  parseWebhookEvent(payload: string): WebhookEvent;
  cancelSubscription(subscriptionId: string): Promise<void>;
  resumeSubscription(subscriptionId: string): Promise<void>;
  retrieveSubscription(subscriptionId: string): Promise<SubscriptionDetails>;
}
