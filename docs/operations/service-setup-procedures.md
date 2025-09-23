# Service Setup Procedures

## Overview

This document provides step-by-step procedures for setting up all external service dependencies for MeetSolis.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to create accounts on external service platforms
- Basic understanding of environment variables and API keys

## Service Setup Checklist

### 1. Clerk Authentication Setup

**Purpose**: User authentication and session management

**Setup Steps**:
1. Visit [clerk.dev](https://clerk.dev) and create an account
2. Create a new application for MeetSolis
3. Configure authentication providers (email, Google, GitHub, etc.)
4. Copy the API keys from the dashboard
5. Add to `.env.local`:
   ```bash
   CLERK_SECRET_KEY=sk_live_xxxxx
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
   ```

**Verification**:
- Test login/logout flow in development
- Verify user session persistence
- Check middleware protection on routes

### 2. Supabase Database Setup

**Purpose**: PostgreSQL database with real-time capabilities

**Setup Steps**:
1. Visit [supabase.com](https://supabase.com) and create account
2. Create new project with strong password
3. Navigate to Project Settings > API
4. Copy Project URL and API keys
5. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
   SUPABASE_ANON_KEY=eyJxxxxx
   ```

**Database Setup**:
1. Run initial migrations via Supabase CLI or SQL editor
2. Configure Row Level Security (RLS) policies
3. Set up real-time subscriptions for meetings table

**Verification**:
- Test database connection via health check endpoint
- Verify CRUD operations work correctly
- Test real-time subscriptions

### 3. OpenAI API Setup

**Purpose**: AI-powered meeting summaries and text analysis

**Setup Steps**:
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create account and navigate to API Keys
3. Generate new API key with appropriate permissions
4. Add to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-xxxxx
   ```

**Configuration**:
- Set usage limits to prevent unexpected charges
- Configure organization if working in team
- Test with sample requests

**Verification**:
- Test summary generation with sample text
- Verify token usage tracking
- Check error handling for quota limits

### 4. DeepL Translation Setup

**Purpose**: Real-time translation for international meetings

**Setup Steps**:
1. Visit [deepl.com](https://www.deepl.com/pro-api)
2. Sign up for DeepL API Pro account
3. Get API key from account dashboard
4. Add to `.env.local`:
   ```bash
   DEEPL_API_KEY=xxxxx:fx
   ```

**Verification**:
- Test translation between supported languages
- Verify character usage tracking
- Test language detection functionality

### 5. Twilio SMS Setup

**Purpose**: SMS notifications for meeting reminders

**Setup Steps**:
1. Visit [twilio.com](https://www.twilio.com) and create account
2. Complete phone number verification
3. Purchase phone number for SMS sending
4. Get Account SID and Auth Token from console
5. Add to `.env.local`:
   ```bash
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```

**Verification**:
- Send test SMS to verified number
- Check delivery status via webhook
- Verify cost tracking

### 6. Google Calendar API Setup

**Purpose**: Calendar integration for meeting scheduling

**Setup Steps**:
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google Calendar API
4. Create credentials (OAuth 2.0 client ID)
5. Configure OAuth consent screen
6. Add to `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID=xxxxx.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxxxx
   ```

**Verification**:
- Test OAuth flow for calendar access
- Verify event creation and reading
- Test webhook notifications

### 7. PostHog Analytics Setup

**Purpose**: User behavior analytics and feature tracking

**Setup Steps**:
1. Visit [posthog.com](https://posthog.com) and create account
2. Create new project for MeetSolis
3. Copy project API key from settings
4. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

**Verification**:
- Test event tracking in development
- Verify user identification works
- Check dashboard for incoming events

### 8. Sentry Error Tracking Setup

**Purpose**: Error monitoring and performance tracking

**Setup Steps**:
1. Visit [sentry.io](https://sentry.io) and create account
2. Create new project for Next.js
3. Copy DSN from project settings
4. Add to `.env.local`:
   ```bash
   SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   ```

**Verification**:
- Test error capture with sample error
- Verify performance monitoring data
- Check alert configurations

### 9. Vercel Deployment Setup

**Purpose**: Production hosting and deployment

**Setup Steps**:
1. Visit [vercel.com](https://vercel.com) and connect GitHub
2. Import MeetSolis repository
3. Configure environment variables in dashboard
4. Set up production and preview deployments
5. Configure custom domain (optional)

**Environment Variables**:
- Copy all `.env.local` variables to Vercel dashboard
- Set `USE_MOCK_SERVICES=false` for production
- Configure different values for staging vs production

**Verification**:
- Test production deployment
- Verify all services work in production
- Check performance metrics

## Post-Setup Validation

After completing all service setups:

1. Run the connectivity test suite:
   ```bash
   npm run test:integration
   ```

2. Check service health dashboard:
   ```bash
   npm run dev
   # Visit http://localhost:3000/admin/services
   ```

3. Verify all environment variables are set:
   ```bash
   npm run validate-env
   ```

4. Test critical user flows end-to-end

## Troubleshooting

### Common Issues

**Authentication Errors**:
- Verify API keys are correctly copied
- Check for extra spaces or newlines
- Ensure environment variables are loaded

**Network Connectivity**:
- Check firewall settings
- Verify DNS resolution
- Test from different networks

**Rate Limiting**:
- Check service usage dashboards
- Verify quota limits
- Implement proper retry logic

**CORS Issues**:
- Configure allowed origins in service dashboards
- Check browser network tab for errors
- Verify Next.js API routes configuration

### Getting Help

1. Check service-specific documentation
2. Review error logs in Sentry
3. Use service health dashboard for diagnostics
4. Contact individual service support teams
5. Check MeetSolis documentation and GitHub issues

## Security Considerations

- **Never commit API keys to version control**
- Use different keys for development, staging, and production
- Regularly rotate API keys
- Set up proper access controls and permissions
- Monitor usage for unusual patterns
- Enable two-factor authentication on all service accounts