/**
 * Unit tests — Gladia callback token verification (Story 6.3)
 *
 * Gladia does not sign per-job callbacks; authenticity is a shared-secret
 * token in the callback URL. This is the auth check the webhook relies on.
 */

jest.mock('@/lib/config/env', () => ({
  config: { gladia: { webhookSecret: undefined as string | undefined } },
}));

import { config } from '@/lib/config/env';
import { verifyGladiaCallbackToken } from '../verify-gladia-callback';

const setSecret = (v: string | undefined) => {
  (
    config as { gladia: { webhookSecret: string | undefined } }
  ).gladia.webhookSecret = v;
};

describe('verifyGladiaCallbackToken', () => {
  it('skips verification when no secret is configured (dev/mock)', () => {
    setSecret(undefined);
    expect(verifyGladiaCallbackToken(null)).toBe(true);
    expect(verifyGladiaCallbackToken('anything')).toBe(true);
  });

  it('accepts a matching token', () => {
    setSecret('s3cr3t-token');
    expect(verifyGladiaCallbackToken('s3cr3t-token')).toBe(true);
  });

  it('rejects a wrong token', () => {
    setSecret('s3cr3t-token');
    expect(verifyGladiaCallbackToken('wrong-token')).toBe(false);
  });

  it('rejects a missing token when a secret is set', () => {
    setSecret('s3cr3t-token');
    expect(verifyGladiaCallbackToken(null)).toBe(false);
  });

  it('rejects a token of different length without throwing', () => {
    setSecret('s3cr3t-token');
    expect(verifyGladiaCallbackToken('short')).toBe(false);
  });
});
