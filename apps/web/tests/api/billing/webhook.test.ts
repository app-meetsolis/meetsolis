import { NextRequest } from 'next/server';
import { POST } from '../../../src/app/api/billing/webhook/route';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValue({ data: { user_id: 'usr_1' }, error: null }),
    })),
  })),
}));

jest.mock('../../../src/lib/service-factory', () => ({
  ServiceFactory: {
    createBillingService: jest.fn(() => ({
      verifyWebhook: jest.fn(() => true),
      parseWebhookEvent: jest.fn((payload: string) => JSON.parse(payload)),
    })),
  },
}));

jest.mock('../../../src/lib/config/env', () => ({
  config: {
    supabase: {
      url: 'http://localhost:54321',
      serviceRoleKey: 'test-service-role-key',
    },
    billing: { provider: 'placeholder' },
  },
}));

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/billing/webhook', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'webhook-signature': 'valid_sig' },
  });
}

describe('POST /api/billing/webhook', () => {
  it('returns 401 for invalid signature', async () => {
    const { ServiceFactory } = require('../../../src/lib/service-factory');
    ServiceFactory.createBillingService.mockReturnValueOnce({
      verifyWebhook: jest.fn(() => false),
      parseWebhookEvent: jest.fn(),
    });
    const req = makeRequest({ type: 'subscription.active', data: {} });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 200 and handles subscription.active', async () => {
    const req = makeRequest({
      type: 'subscription.active',
      data: {
        customer_id: 'cus_1',
        subscription_id: 'sub_1',
        product_id: 'prod_1',
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
  });

  it('returns 200 for subscription.cancelled', async () => {
    const req = makeRequest({
      type: 'subscription.cancelled',
      data: { subscription_id: 'sub_1' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
