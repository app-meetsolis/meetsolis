/**
 * @jest-environment node
 */

jest.mock('@/lib/config', () => ({
  config: {
    security: {
      calendarTokenEncryptionKey: require('crypto')
        .randomBytes(32)
        .toString('base64'),
      cronSecret: 'test-cron-secret',
    },
  },
}));

import { encryptToken, decryptToken } from '../token-encryption';

describe('calendar token encryption (AES-256-GCM)', () => {
  it('roundtrips short strings', () => {
    const plain = 'ya29.A0AfH6SMC-test-access-token';
    const enc = encryptToken(plain);
    expect(enc).not.toBe(plain);
    expect(enc.split(':').length).toBe(3);
    expect(decryptToken(enc)).toBe(plain);
  });

  it('roundtrips long refresh tokens', () => {
    const plain = '1//0g' + 'x'.repeat(200);
    expect(decryptToken(encryptToken(plain))).toBe(plain);
  });

  it('produces different ciphertext per encryption (random IV)', () => {
    const plain = 'same-input';
    const a = encryptToken(plain);
    const b = encryptToken(plain);
    expect(a).not.toBe(b);
    expect(decryptToken(a)).toBe(plain);
    expect(decryptToken(b)).toBe(plain);
  });

  it('rejects tampered ciphertext (auth tag mismatch)', () => {
    const plain = 'auth-tag-test';
    const enc = encryptToken(plain);
    const [iv, tag] = enc.split(':');
    const tampered = `${iv}:${tag}:${Buffer.from('forged').toString('base64')}`;
    expect(() => decryptToken(tampered)).toThrow();
  });

  it('rejects malformed payload', () => {
    expect(() => decryptToken('not-formatted')).toThrow(/malformed/);
    expect(() => decryptToken('only:two')).toThrow(/malformed/);
  });

  it('rejects empty input', () => {
    expect(() => encryptToken('')).toThrow();
    expect(() => decryptToken('')).toThrow();
  });
});
