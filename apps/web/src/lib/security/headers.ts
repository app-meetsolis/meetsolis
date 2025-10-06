/**
 * Security Headers Configuration
 * Edge Runtime compatible security headers implementation
 */

export const securityHeaders = {
  // Content Security Policy - prevents XSS and other injection attacks
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://*.clerk.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com https://*.paddle.com https://*.razorpay.com https://va.vercel-scripts.com https://*.vercel.com https://*.posthog.com https://cdn.mxpnl.com https://*.mixpanel.com https://*.hotjar.com https://*.hotjar.io https://static.hotjar.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.clerk.dev https://*.clerk.accounts.dev https://*.deepl.com https://*.vercel.com https://*.vercel-analytics.com https://app.posthog.com https://*.posthog.com https://*.mixpanel.com https://api.mixpanel.com https://*.hotjar.com https://*.hotjar.io https://vars.hotjar.com https://*.sentry.io https://sentry.io",
    "img-src 'self' data: https: https://img.clerk.com",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "frame-src 'self' https://*.clerk.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com https://*.hotjar.com",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),

  // XSS Protection
  'X-XSS-Protection': '1; mode=block',

  // Prevent framing (clickjacking protection)
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // HTTPS enforcement
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Referrer policy for privacy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy (limit browser features)
  'Permissions-Policy': [
    'camera=self',
    'microphone=self',
    'geolocation=self',
    'interest-cohort=()',
    'payment=self',
  ].join(', '),
};

export const developmentSecurityHeaders = {
  ...securityHeaders,
  // More permissive CSP for development
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com https://va.vercel-scripts.com https://*.vercel.com https://*.posthog.com https://cdn.mxpnl.com https://*.mixpanel.com https://*.hotjar.com https://*.hotjar.io https://static.hotjar.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.clerk.dev https://*.clerk.accounts.dev https://*.deepl.com ws://localhost:* https://*.vercel.com https://*.vercel-analytics.com https://app.posthog.com https://*.posthog.com https://*.mixpanel.com https://api.mixpanel.com https://*.hotjar.com https://*.hotjar.io https://vars.hotjar.com https://*.sentry.io https://sentry.io",
    "img-src 'self' data: https: https://img.clerk.com",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "frame-src 'self' https://*.clerk.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com https://*.hotjar.com",
    "media-src 'self'",
    "worker-src 'self' blob:",
  ].join('; '),
};

/**
 * Get appropriate security headers based on environment
 */
export function getSecurityHeaders(): Record<string, string> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment ? developmentSecurityHeaders : securityHeaders;
}
