/**
 * Gladia callback authenticity check (Story 6.3).
 *
 * Gladia v2 does NOT sign per-job `callback_config` callbacks — there is no
 * HMAC header to verify (confirmed against Gladia's API docs + OpenAPI spec;
 * only the separate dashboard "Webhooks" feature is Svix-signed). The
 * documented mitigation is a shared-secret token in the callback URL.
 *
 * submitGladiaJob registers the callback URL with `?token=<GLADIA_WEBHOOK_SECRET>`
 * (see buildGladiaCallbackUrl); this verifies the inbound token matches.
 */

import { timingSafeEqual } from 'crypto';
import { config } from '@/lib/config/env';

/**
 * True when the callback request carries the expected secret token.
 *
 * If GLADIA_WEBHOOK_SECRET is unset (dev / mock mode) verification is skipped
 * — there is no secret to check against. Configure it in any real deployment.
 */
export function verifyGladiaCallbackToken(token: string | null): boolean {
  const expected = config.gladia.webhookSecret;
  if (!expected) return true; // dev/mock — nothing to verify against
  if (!token) return false;

  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
