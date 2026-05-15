/**
 * Recall.ai webhook signature verification (Story 6.2)
 *
 * Recall uses Svix for webhook delivery. Verification:
 *   signed_content = `${webhook-id}.${webhook-timestamp}.${rawBody}`
 *   secret = base64-decode(RECALL_WEBHOOK_SECRET after stripping "whsec_" prefix)
 *   expected = base64(HMAC-SHA256(secret, signed_content))
 *   compare against each "v1,<sig>" in the webhook-signature header
 *
 * Replay protection: reject timestamps older than 5 minutes.
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { config } from '@/lib/config/env';

const TOLERANCE_SECONDS = 5 * 60; // 5 minutes

export interface SvixHeaders {
  'webhook-id': string;
  'webhook-timestamp': string;
  'webhook-signature': string;
}

/**
 * Verify a Svix-compatible HMAC signature.
 *
 * @param secret  Signing secret. Defaults to the account-level Svix endpoint
 *   secret (lifecycle webhook). Per-bot real-time endpoints (Story 6.2b) are
 *   signed with the workspace verification secret — pass it explicitly.
 */
export function verifySvixSignature(
  rawBody: string,
  headers: SvixHeaders,
  secret: string | undefined = config.recall.webhookSecret
): boolean {
  if (!secret) return false;

  const {
    'webhook-id': msgId,
    'webhook-timestamp': msgTs,
    'webhook-signature': sigHeader,
  } = headers;
  if (!msgId || !msgTs || !sigHeader) return false;

  // Replay protection
  const tsNum = parseInt(msgTs, 10);
  if (isNaN(tsNum)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - tsNum) > TOLERANCE_SECONDS) return false;

  // Decode secret — strip "whsec_" prefix if present
  const secretStr = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  let secretBytes: Buffer;
  try {
    secretBytes = Buffer.from(secretStr, 'base64');
  } catch {
    return false;
  }

  const signedContent = `${msgId}.${msgTs}.${rawBody}`;
  const expected = createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  // webhook-signature may contain multiple "v1,<sig>" values (comma-separated)
  const signatures = sigHeader.split(' ');
  for (const sig of signatures) {
    const parts = sig.split(',');
    if (parts.length !== 2 || parts[0] !== 'v1') continue;
    try {
      const candidate = Buffer.from(parts[1], 'base64');
      const expectedBuf = Buffer.from(expected, 'base64');
      if (
        candidate.length === expectedBuf.length &&
        timingSafeEqual(candidate, expectedBuf)
      ) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}
