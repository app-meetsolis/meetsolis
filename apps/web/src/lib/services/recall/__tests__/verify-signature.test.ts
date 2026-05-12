/**
 * Unit tests — Recall.ai Svix webhook signature verification (Story 6.2)
 */

import { createHmac } from 'crypto';

// jest.mock is hoisted — must use literals inside factory
// 'c2VjcmV0' = base64('secret'); verify fn will base64-decode the part after 'whsec_'
jest.mock('@/lib/config/env', () => ({
  config: { recall: { webhookSecret: 'whsec_c2VjcmV0' } },
}));

import { verifySvixSignature } from '../verify-signature';

// RAW_SECRET = Buffer.from('c2VjcmV0', 'base64') = Buffer.from('secret', 'utf8')
const RAW_SECRET = Buffer.from('secret', 'utf8');

function makeSignature(msgId: string, msgTs: string, body: string): string {
  const signed = `${msgId}.${msgTs}.${body}`;
  return (
    'v1,' + createHmac('sha256', RAW_SECRET).update(signed).digest('base64')
  );
}

describe('verifySvixSignature', () => {
  const body = JSON.stringify({
    event: 'bot.joining_call',
    data: { bot_id: 'abc' },
  });
  const msgId = 'msg_test_123';
  const msgTs = String(Math.floor(Date.now() / 1000));

  it('returns true for a valid signature', () => {
    const sig = makeSignature(msgId, msgTs, body);
    expect(
      verifySvixSignature(body, {
        'webhook-id': msgId,
        'webhook-timestamp': msgTs,
        'webhook-signature': sig,
      })
    ).toBe(true);
  });

  it('returns false for a tampered body', () => {
    const sig = makeSignature(msgId, msgTs, body);
    expect(
      verifySvixSignature('{"tampered":true}', {
        'webhook-id': msgId,
        'webhook-timestamp': msgTs,
        'webhook-signature': sig,
      })
    ).toBe(false);
  });

  it('returns false for a missing signature header', () => {
    expect(
      verifySvixSignature(body, {
        'webhook-id': msgId,
        'webhook-timestamp': msgTs,
        'webhook-signature': '',
      })
    ).toBe(false);
  });

  it('returns false for a stale timestamp (> 5 min)', () => {
    const staleTs = String(Math.floor(Date.now() / 1000) - 400);
    const sig = makeSignature(msgId, staleTs, body);
    expect(
      verifySvixSignature(body, {
        'webhook-id': msgId,
        'webhook-timestamp': staleTs,
        'webhook-signature': sig,
      })
    ).toBe(false);
  });

  it('returns true when one of multiple v1 signatures is valid', () => {
    const validSig = makeSignature(msgId, msgTs, body);
    const combined = `v1,invalidsig ${validSig}`;
    expect(
      verifySvixSignature(body, {
        'webhook-id': msgId,
        'webhook-timestamp': msgTs,
        'webhook-signature': combined,
      })
    ).toBe(true);
  });
});
