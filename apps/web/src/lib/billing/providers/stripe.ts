import type {
  BillingProvider,
  CheckoutSession,
  PortalSession,
  WebhookEvent,
} from '../provider';

export class StripeBillingProvider implements BillingProvider {
  private secretKey: string;
  private webhookSecret: string;
  private priceMonthly: string;
  private priceAnnual: string;
  private appUrl: string;

  constructor(
    secretKey: string,
    webhookSecret: string,
    priceMonthly: string,
    priceAnnual: string,
    appUrl: string
  ) {
    this.secretKey = secretKey;
    this.webhookSecret = webhookSecret;
    this.priceMonthly = priceMonthly;
    this.priceAnnual = priceAnnual;
    this.appUrl = appUrl;
  }

  private async stripeRequest(
    path: string,
    body: Record<string, string>
  ): Promise<unknown> {
    const params = new URLSearchParams(body);
    const response = await fetch(`https://api.stripe.com/v1${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `Stripe error ${response.status}`);
    }
    return response.json();
  }

  async createCheckoutSession(
    userId: string,
    plan: 'monthly' | 'annual'
  ): Promise<CheckoutSession> {
    const priceId = plan === 'monthly' ? this.priceMonthly : this.priceAnnual;

    const session = (await this.stripeRequest('/checkout/sessions', {
      mode: 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: `${this.appUrl}/settings?checkout=success`,
      cancel_url: `${this.appUrl}/settings?checkout=canceled`,
      'metadata[user_id]': userId,
      client_reference_id: userId,
    })) as { url: string };

    return { url: session.url };
  }

  async createPortalSession(customerId: string): Promise<PortalSession> {
    const session = (await this.stripeRequest('/billing_portal/sessions', {
      customer: customerId,
      return_url: `${this.appUrl}/settings`,
    })) as { url: string };

    return { url: session.url };
  }

  async handleWebhook(
    payload: string,
    signature: string
  ): Promise<WebhookEvent> {
    // Verify Stripe signature using Web Crypto API
    const encoder = new TextEncoder();
    const parts = signature.split(',');
    const ts = parts.find(p => p.startsWith('t='))?.split('=')[1];
    const v1 = parts.find(p => p.startsWith('v1='))?.split('=')[1];

    if (!ts || !v1) return { type: 'unknown' };

    const signedPayload = `${ts}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );
    const computed = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (computed !== v1) throw new Error('Invalid Stripe webhook signature');

    const event = JSON.parse(payload);

    if (event.type === 'checkout.session.completed') {
      return {
        type: 'checkout.completed',
        userId: event.data.object.metadata?.user_id,
        customerId: event.data.object.customer,
        subscriptionId: event.data.object.subscription,
        plan: 'pro',
      };
    }

    if (event.type === 'invoice.paid') {
      return {
        type: 'subscription.activated',
        customerId: event.data.object.customer,
        subscriptionId: event.data.object.subscription,
        plan: 'pro',
        periodEnd: new Date(
          event.data.object.lines?.data?.[0]?.period?.end * 1000
        ),
      };
    }

    if (event.type === 'customer.subscription.deleted') {
      return {
        type: 'subscription.canceled',
        customerId: event.data.object.customer,
        subscriptionId: event.data.object.id,
        plan: 'free',
      };
    }

    return { type: 'unknown' };
  }
}
