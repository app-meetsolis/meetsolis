# Upstash Redis Setup Guide

## Production-Ready Rate Limiting (SEC-001 Fix)

This guide explains how to set up Upstash Redis for distributed rate limiting in production.

## Why Upstash Redis?

✅ **Serverless-friendly** - Works perfectly with Vercel and other serverless platforms
✅ **Free tier available** - 10,000 commands/day free
✅ **Global replication** - Low latency worldwide
✅ **REST API** - No connection pooling issues
✅ **Pay-as-you-go** - Only pay for what you use

## Setup Steps

### 1. Create Upstash Account

1. Go to [https://upstash.com](https://upstash.com)
2. Sign up for free (GitHub/Google/Email)
3. Verify your email

### 2. Create Redis Database

1. Click **"Create Database"**
2. Configure your database:
   - **Name:** `meetsolis-rate-limit` (or your preferred name)
   - **Type:** Regional or Global
     - **Regional** (Recommended for cost): Choose region closest to your deployment
     - **Global**: Better latency worldwide but costs more
   - **Primary Region:** `us-east-1` (or closest to your Vercel deployment)
   - **Eviction:** LRU (Least Recently Used)
   - **TLS:** Enabled (default)

3. Click **"Create"**

### 3. Get Credentials

After creating the database:

1. Go to **Database Details**
2. Scroll to **"REST API"** section
3. Copy these values:
   - **UPSTASH_REDIS_REST_URL** - Your database REST URL
   - **UPSTASH_REDIS_REST_TOKEN** - Your read/write token

### 4. Configure Environment Variables

#### Local Development (.env.local)

```bash
# Rate Limiting - Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-database-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_rest_token_here
```

#### Production (Vercel)

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings → Environment Variables**
3. Add both variables:
   - `UPSTASH_REDIS_REST_URL` = `https://your-database-url.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN` = `your_rest_token_here`
4. Select **Production** environment
5. Click **Save**
6. **Redeploy your application** for changes to take effect

## Verification

### 1. Test Locally

```bash
# Start dev server
npm run dev

# Send test messages to trigger rate limiting
# After 10 messages in 1 minute, you should get a 429 error
```

### 2. Test Production

```bash
# Deploy to Vercel
vercel --prod

# Send test API requests
# Monitor rate limits in Upstash Dashboard → Metrics
```

### 3. Monitor in Upstash Dashboard

1. Go to **Database Details** in Upstash
2. Check **Metrics** tab:
   - Command count
   - Bandwidth usage
   - Response times

## Rate Limit Configuration

Current presets in `src/lib/rate-limit.ts`:

```typescript
MESSAGE: { limit: 10, window: 60 }        // 10 messages per minute
FILE_UPLOAD: { limit: 5, window: 60 }    // 5 uploads per minute
API: { limit: 30, window: 60 }           // 30 requests per minute
AUTH: { limit: 100, window: 3600 }       // 100 requests per hour
```

To customize, edit `RateLimitPresets` in `apps/web/src/lib/rate-limit.ts`.

## Troubleshooting

### "Rate limiting disabled (development mode)"

**Cause:** Redis environment variables not set

**Solution:**
1. Check `.env.local` has `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
2. Restart dev server

### "Redis connection failed"

**Cause:** Invalid credentials or network issue

**Solution:**
1. Verify credentials in Upstash Dashboard
2. Check TLS is enabled
3. Ensure no firewall blocking Upstash
4. Test with: `curl https://your-database-url.upstash.io`

### Rate limits not working in production

**Cause:** Environment variables not set in Vercel

**Solution:**
1. Check Vercel → Settings → Environment Variables
2. Ensure variables are set for **Production** environment
3. **Redeploy** after adding variables

## Cost Estimation

### Free Tier
- **10,000 commands/day** = ~300,000 commands/month
- Estimate: ~3,000 active users sending 100 messages/month
- **Cost:** $0/month

### Paid Tier (if needed)
- **$0.20 per 100,000 commands**
- Example: 1M commands/month = **$2/month**
- Example: 10M commands/month = **$20/month**

## Best Practices

✅ **DO:**
- Monitor usage in Upstash Dashboard
- Set up alerts for quota limits
- Use different databases for staging/production
- Test rate limiting in staging first

❌ **DON'T:**
- Share Redis credentials publicly
- Commit credentials to git (use .env.local)
- Disable rate limiting in production
- Use same database for dev/prod

## Alternative Solutions

If you prefer not to use Upstash:

### Vercel KV (Built on Upstash)
```typescript
import { kv } from '@vercel/kv';
// Similar API, Vercel-native integration
```

### Upstash Rate Limit Library
```typescript
import { Ratelimit } from '@upstash/ratelimit';
// Higher-level abstraction (already installed)
```

## Support

- **Upstash Docs:** [https://docs.upstash.com/redis](https://docs.upstash.com/redis)
- **Upstash Discord:** [https://discord.gg/upstash](https://discord.gg/upstash)
- **Issues:** File a GitHub issue in this repo

## Security Notes

🔒 **Credentials are sensitive** - Never commit to git
🔒 **Use environment variables** - .env.local (local), Vercel (production)
🔒 **Rotate tokens** - If leaked, regenerate in Upstash Dashboard
🔒 **Use separate databases** - Different credentials for dev/staging/prod

---

## Migration Checklist

- [ ] Create Upstash account
- [ ] Create Redis database
- [ ] Copy REST URL and Token
- [ ] Add to local .env.local
- [ ] Test locally (send 11 messages, expect 429)
- [ ] Add to Vercel environment variables
- [ ] Deploy to production
- [ ] Verify in Upstash Metrics dashboard
- [ ] Monitor for 24 hours
- [ ] Update SEC-001 gate status to RESOLVED

**Status:** Required for production deployment (SEC-001)
