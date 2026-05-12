/**
 * Calendar Token Encryption (Story 6.1)
 *
 * AES-256-GCM symmetric encryption for Google OAuth tokens at rest.
 * Key sourced from CALENDAR_TOKEN_ENCRYPTION_KEY env var (32-byte base64).
 *
 * Format: <iv_base64>:<auth_tag_base64>:<ciphertext_base64>
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { config } from '@/lib/config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits — GCM standard
const KEY_LENGTH = 32; // 256 bits

function getKey(): Buffer {
  const raw = config.security.calendarTokenEncryptionKey;
  if (!raw) {
    throw new Error(
      'CALENDAR_TOKEN_ENCRYPTION_KEY is required for calendar token encryption. ' +
        'Generate via: openssl rand -base64 32'
    );
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `CALENDAR_TOKEN_ENCRYPTION_KEY must decode to ${KEY_LENGTH} bytes (got ${key.length}). ` +
        'Generate via: openssl rand -base64 32'
    );
  }
  return key;
}

export function encryptToken(plaintext: string): string {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new Error('encryptToken: plaintext must be a non-empty string');
  }
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext.toString('base64')}`;
}

export function decryptToken(encrypted: string): string {
  if (typeof encrypted !== 'string' || encrypted.length === 0) {
    throw new Error('decryptToken: encrypted must be a non-empty string');
  }
  const parts = encrypted.split(':');
  if (parts.length !== 3) {
    throw new Error(
      'decryptToken: malformed payload (expected iv:tag:ciphertext)'
    );
  }
  const [ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(ctB64, 'base64');
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString('utf8');
}
