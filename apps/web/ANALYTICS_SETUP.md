# Analytics Setup Guide

This guide explains how to configure analytics and monitoring services for MeetSolis.

## Quick Start

All analytics services are **optional** in development. The application will use mock analytics providers if environment variables are not configured.

## Environment Variables

Copy these to your `.env.local` file and add your API keys:

```bash
# Analytics - PostHog (Product Analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Analytics - Mixpanel (Advanced Analytics)
NEXT_PUBLIC_MIXPANEL_TOKEN=your_token_here

# Analytics - Hotjar (Heatmaps & Recordings)
NEXT_PUBLIC_HOTJAR_ID=your_site_id_here
NEXT_PUBLIC_HOTJAR_SV=6

# Analytics - Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://your_key@sentry.io/your_project_id
SENTRY_DSN=https://your_key@sentry.io/your_project_id

# Analytics - App Version (for release tracking)
NEXT_PUBLIC_APP_VERSION=1.0.0

# Alerting - Slack Webhooks (for critical errors)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Service Configuration (set to false to use real analytics)
NEXT_PUBLIC_USE_MOCK_SERVICES=true
```

## Service Setup Instructions

### 1. PostHog (Free - Recommended)

**Purpose**: Product analytics, feature usage tracking, funnels

1. Sign up at [https://posthog.com](https://posthog.com)
2. Create a new project
3. Copy your Project API Key from Settings → Project → Project API Key
4. Set `NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here`

**Free Tier**: 1M events/month

### 2. Mixpanel (Free)

**Purpose**: Advanced retention analytics, cohort analysis

1. Sign up at [https://mixpanel.com](https://mixpanel.com)
2. Create a new project
3. Go to Project Settings → Access Keys
4. Copy your Project Token
5. Set `NEXT_PUBLIC_MIXPANEL_TOKEN=your_token_here`

**Free Tier**: 100K Monthly Tracked Users (MTU)

### 3. Hotjar (Free)

**Purpose**: Heatmaps, session recordings, user behavior

1. Sign up at [https://hotjar.com](https://hotjar.com)
2. Add a new site
3. Copy your Site ID from the tracking code
4. Set `NEXT_PUBLIC_HOTJAR_ID=your_site_id`

**Free Tier**: 35 daily sessions

### 4. Sentry (Free)

**Purpose**: Error tracking and performance monitoring

1. Sign up at [https://sentry.io](https://sentry.io)
2. Create a new Next.js project
3. Copy the DSN from Settings → Client Keys (DSN)
4. Set both `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` to the same value

**Free Tier**: 5K errors/month

### 5. Vercel Analytics (Included with Vercel)

**Purpose**: Core Web Vitals monitoring

- No configuration needed if deployed on Vercel
- Automatically enabled via `@vercel/analytics` package
- Shows in Vercel dashboard → Analytics tab

### 6. Slack Webhooks (Optional)

**Purpose**: Real-time error alerts for critical issues

1. Go to your Slack workspace → Apps → Incoming Webhooks
2. Click "Add to Slack"
3. Choose a channel (e.g., #alerts or #monitoring)
4. Copy the Webhook URL
5. Set `SLACK_WEBHOOK_URL=https://hooks.slack.com/...`

## Development Mode

By default, the app uses **mock analytics** in development to:

- Avoid polluting production analytics with test data
- Work without API keys
- Speed up development

You'll see these console messages (this is normal):

```
[MOCK ANALYTICS] Initialized
[Sentry] DSN not configured, error tracking disabled
```

To test real analytics in development:

1. Set `NEXT_PUBLIC_USE_MOCK_SERVICES=false`
2. Add your analytics API keys
3. Restart the dev server

## Production Configuration

For production deployment:

1. Add all environment variables to your hosting platform (Vercel/Netlify/etc)
2. Set `NEXT_PUBLIC_USE_MOCK_SERVICES=false`
3. Set `NEXT_PUBLIC_APP_VERSION` to your release version (e.g., `1.0.0`)
4. Verify CSP headers allow analytics domains (already configured in `apps/web/src/lib/security/headers.ts`)

## Testing Analytics

### Browser DevTools

1. Open DevTools → Console
2. Look for analytics initialization messages:
   - `[PostHog] Initialized successfully`
   - `[Mixpanel] Initialized successfully`
   - `[Analytics] Initialized all services`

3. Trigger an event (e.g., create a meeting)
4. Check Network tab for requests to analytics services

### Cookie Consent

1. Open the app in an incognito/private window
2. You should see the cookie consent banner
3. Click "Customize" to see granular controls
4. Accept analytics cookies
5. Verify analytics events are being sent

### Analytics Dashboard

Visit `/analytics` to see the custom analytics dashboard with:

- User metrics (total, active, new users)
- Meeting metrics (total, duration, success rate)
- Performance metrics (Core Web Vitals)
- Charts and visualizations

## Troubleshooting

### CSP Errors

If you see "Content Security Policy" errors in the console:

- The CSP headers in `apps/web/src/lib/security/headers.ts` have been updated to allow all analytics services
- Make sure you're using the latest code
- Restart your dev server

### Analytics Not Tracking

1. Check browser console for errors
2. Verify cookie consent is granted (check localStorage: `cookie-consent`)
3. Confirm `NEXT_PUBLIC_USE_MOCK_SERVICES=false` in production
4. Check that environment variables are set correctly

### Sentry Not Working

1. Verify both `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` are set
2. Check that DSN format is correct: `https://key@sentry.io/project-id`
3. Restart the app after adding environment variables

## Privacy & GDPR Compliance

The analytics implementation is GDPR-compliant:

- ✅ Cookie consent banner shown on first visit
- ✅ Granular controls (necessary, analytics, marketing)
- ✅ All tracking respects user consent
- ✅ Opt-out functionality available
- ✅ User data stored in localStorage
- ✅ Privacy policy and cookie policy links

No analytics events are sent until the user grants consent.

## Cost Management

All services have generous free tiers:

| Service  | Free Tier       | Limit                                     |
| -------- | --------------- | ----------------------------------------- |
| PostHog  | 1M events/month | Event sampling configured at 90% of limit |
| Mixpanel | 100K MTU        | User-based, not event-based               |
| Hotjar   | 35 sessions/day | Automatic limit                           |
| Sentry   | 5K errors/month | Error sampling at 50% in production       |
| Vercel   | Unlimited       | Included with Vercel deployment           |

The code includes automatic usage monitoring and sampling to stay within free tier limits.

## Support

For issues or questions:

1. Check browser console for error messages
2. Verify environment variables are set correctly
3. Review this guide for setup instructions
4. Check each service's documentation for API key issues
