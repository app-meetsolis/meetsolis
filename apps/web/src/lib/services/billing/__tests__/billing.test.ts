import { PlaceholderBillingService } from '../placeholder-billing-service';

describe('PlaceholderBillingService', () => {
  const svc = new PlaceholderBillingService();

  it('createCheckoutSession returns url with simulated param', async () => {
    const result = await svc.createCheckoutSession(
      'user_123',
      'monthly',
      'http://localhost:3000/settings?upgrade=success',
      'http://localhost:3000/settings?upgrade=cancelled'
    );
    expect(result.checkout_url).toContain('simulated=true');
    expect(result.checkout_url).toContain('user_id=user_123');
    expect(result.payment_id).toMatch(/^sim_/);
  });

  it('verifyWebhook always returns true', () => {
    expect(svc.verifyWebhook('payload', {})).toBe(true);
  });

  it('parseWebhookEvent parses subscription.active', () => {
    const event = {
      type: 'subscription.active',
      data: { subscription_id: 'sub_123', customer_id: 'cus_123' },
    };
    const result = svc.parseWebhookEvent(JSON.stringify(event));
    expect(result.type).toBe('subscription.active');
    expect(result.data.subscription_id).toBe('sub_123');
  });
});

describe('DodoBillingService - parseWebhookEvent', () => {
  it('parses subscription.cancelled event', () => {
    const { DodoBillingService } = require('../dodo-billing-service');
    const svc = new DodoBillingService('key', 'whkey', 'test_mode');
    const event = {
      type: 'subscription.cancelled',
      data: { subscription_id: 'sub_999', customer: { customer_id: 'cus_1' } },
    };
    const result = svc.parseWebhookEvent(JSON.stringify(event));
    expect(result.type).toBe('subscription.cancelled');
    expect(result.data.subscription_id).toBe('sub_999');
    expect(result.data.customer_id).toBe('cus_1');
  });
});
