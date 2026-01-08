# MeetSolis Environment Variables & Configuration

**Version:** 2.0
**Last Updated:** January 7, 2026
**Purpose:** Complete list of required API keys, tokens, and configuration for staging and production

---

## Overview

MeetSolis requires two Supabase projects:
- **Production**: Where Epic 1 exists, where real users connect, where v2.0 migration will run
- **Staging**: Clone of production for testing migrations safely

Both projects need the same environment variables, but with different values.

---

## Required Environment Variables

### 1. Supabase Configuration

#### Production Supabase Project

**Where Epic 1 already exists, where migration will run, where app connects**

```env
# .env.production

# Supabase Project: meetsolis-production
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database connection (for migrations)
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
DATABASE_URL_PRODUCTION=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
```

**How to get these:**
1. Go to https://app.supabase.com
2. Select your **existing** production project (where Epic 1 is)
3. Settings → API
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (secret!)
4. Settings → Database
   - `DATABASE_URL` = Connection string (copy, replace [password])

---

#### Staging Supabase Project

**NEW project for testing migrations (create this)**

```env
# .env.staging

# Supabase Project: meetsolis-staging (NEW)
NEXT_PUBLIC_SUPABASE_URL=https://yyyyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database connection (for migrations)
DATABASE_URL_STAGING=postgresql://postgres:[password]@db.yyyyy.supabase.co:5432/postgres
```

**How to create staging project:**
1. Go to https://app.supabase.com
2. Click "New Project"
3. Name: `meetsolis-staging`
4. Password: (save this!)
5. Region: Same as production (for consistency)
6. Wait 2-3 minutes for provisioning
7. Copy API keys from Settings → API
8. Copy DATABASE_URL from Settings → Database

---

### 2. Clerk Authentication

**IMPORTANT:** Clerk has ONE account, but separate development/production environments

#### Production Clerk

```env
# .env.production

# Clerk Production Environment
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx...
CLERK_SECRET_KEY=sk_live_xxx...

# Webhook signing secret (for user sync)
CLERK_WEBHOOK_SECRET=whsec_xxx...
```

**How to get these:**
1. Go to https://dashboard.clerk.com
2. Select your app
3. **Switch to Production** (top-left dropdown)
4. API Keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = Publishable Key
   - `CLERK_SECRET_KEY` = Secret Key
5. Webhooks → `user.created` webhook:
   - Endpoint: `https://meetsolis.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - `CLERK_WEBHOOK_SECRET` = Signing Secret

---

#### Staging Clerk

**Option A: Use Clerk Development Environment (Recommended)**

```env
# .env.staging

# Clerk Development Environment
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx...
CLERK_SECRET_KEY=sk_test_xxx...
CLERK_WEBHOOK_SECRET=whsec_xxx...
```

**How to get these:**
1. Clerk Dashboard → Switch to **Development**
2. Copy API keys (same as production, but `pk_test_` and `sk_test_`)
3. Webhooks → Create webhook:
   - Endpoint: `https://staging.meetsolis.com/api/webhooks/clerk` (or ngrok URL)
   - Events: `user.created`, `user.updated`, `user.deleted`

**Option B: Share Production Clerk (Not Recommended)**
- Use same Clerk keys as production
- Test users will appear in production Clerk dashboard
- Risk: Might accidentally email real users

**Recommendation:** Use Clerk Development environment for staging

---

### 3. Upstash Redis (Rate Limiting)

#### Production Redis

```env
# .env.production

UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx...
```

**How to get these:**
1. Go to https://console.upstash.com
2. Select your **existing** Redis database (from Epic 1)
3. Details → REST API
   - Copy `UPSTASH_REDIS_REST_URL`
   - Copy `UPSTASH_REDIS_REST_TOKEN`

---

#### Staging Redis

**Option A: Create separate staging Redis (Recommended)**

```env
# .env.staging

UPSTASH_REDIS_REST_URL=https://yyy.upstash.io
UPSTASH_REDIS_REST_TOKEN=yyy...
```

**How to create:**
1. Upstash Console → Create Database
2. Name: `meetsolis-staging`
3. Region: Same as production
4. Type: Regional (free tier)
5. Copy REST API credentials

**Option B: Share production Redis**
- Use same Redis as production
- Add namespace prefix for staging: `staging:user:rate-limit:{user_id}`
- Risk: Staging tests might affect production rate limits

**Recommendation:** Separate Redis for staging (free tier allows multiple databases)

---

### 4. OpenAI API (AI Features)

**ONE OpenAI account, same key for both environments**

```env
# .env.production and .env.staging

OPENAI_API_KEY=sk-proj-xxx...
OPENAI_ORG_ID=org-xxx... (optional)
```

**How to get:**
1. Go to https://platform.openai.com/api-keys
2. Create API key (or use existing)
3. Copy key → `OPENAI_API_KEY`

**Cost control:**
- Production: Real usage, monitor closely
- Staging: Use for testing only, limit usage in code

**Recommendation:** Use same key, but add usage tracking to differentiate:
```typescript
// In staging
const usage = await trackAIUsage({
  environment: 'staging', // Tag for monitoring
  user_id: 'test_user',
  // ...
});
```

---

### 5. Gladia API (Transcription)

**ONE Gladia account, same key for both environments**

```env
# .env.production and .env.staging

GLADIA_API_KEY=xxx...
```

**How to get:**
1. Go to https://www.gladia.io
2. Sign up / Log in
3. Dashboard → API Keys
4. Copy key

**Free tier:** 10 hours/month (shared between staging + production)

**Recommendation:**
- Use same key
- Tag staging requests to track usage separately
- Or create separate Gladia account for staging (new email)

---

### 6. Stripe (Payments) - v2.0 Feature

#### Production Stripe

```env
# .env.production

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx...
STRIPE_SECRET_KEY=sk_live_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...
```

**How to get:**
1. Go to https://dashboard.stripe.com
2. **Switch to Live mode** (top-right toggle)
3. Developers → API Keys:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = Publishable key
   - `STRIPE_SECRET_KEY` = Secret key
4. Webhooks → Add endpoint:
   - URL: `https://meetsolis.com/api/webhooks/stripe`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - `STRIPE_WEBHOOK_SECRET` = Signing secret

---

#### Staging Stripe

```env
# .env.staging

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx...
STRIPE_SECRET_KEY=sk_test_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...
```

**How to get:**
1. Stripe Dashboard → **Switch to Test mode**
2. Copy test API keys (same location as production)
3. Webhooks → Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   # Copy webhook secret from output
   ```

**Recommendation:** Always use Stripe Test mode for staging

---

### 7. Vercel (Deployment)

```env
# Set via Vercel CLI or Dashboard

# Production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# ... (all other variables)

# Staging (Preview deployments)
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY preview
# ... (all other variables)
```

**How to set:**

**Option A: Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select project → Settings → Environment Variables
3. Add each variable
4. Select environment: Production / Preview / Development

**Option B: Vercel CLI**
```bash
# Production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste value when prompted

# Preview (staging)
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
# Paste staging value
```

---

### 8. Feature Flags (v2.0)

```env
# .env.production (disabled by default)
NEXT_PUBLIC_ENABLE_CLIENT_CARDS=false
NEXT_PUBLIC_ENABLE_NEW_MEETINGS=false
ENABLE_PGVECTOR=false

# .env.staging (can enable for testing)
NEXT_PUBLIC_ENABLE_CLIENT_CARDS=true
NEXT_PUBLIC_ENABLE_NEW_MEETINGS=true
ENABLE_PGVECTOR=true
```

**Set via Vercel:**
```bash
# Production: Disabled (safe)
vercel env add NEXT_PUBLIC_ENABLE_CLIENT_CARDS false production

# Staging: Enabled (testing)
vercel env add NEXT_PUBLIC_ENABLE_CLIENT_CARDS true preview
```

---

## Environment Setup Checklist

### Production Setup (Epic 1 Already Complete)

- [x] Supabase production project exists
- [x] Clerk production configured
- [x] Upstash Redis configured
- [x] Vercel production deployment configured
- [ ] OpenAI API key added (if not already)
- [ ] Gladia API key added (new for v2.0)
- [ ] Stripe API keys added (new for v2.0)
- [ ] Feature flags added (disabled by default)

---

### Staging Setup (New for v2.0 Testing)

- [ ] **Create staging Supabase project**
  ```bash
  # 1. Go to https://app.supabase.com
  # 2. New Project → meetsolis-staging
  # 3. Copy API keys
  # 4. Copy DATABASE_URL
  ```

- [ ] **Clone production data to staging**
  ```bash
  # Dump production database
  pg_dump $DATABASE_URL_PRODUCTION > production-dump.sql

  # Import to staging
  psql $DATABASE_URL_STAGING < production-dump.sql
  ```

- [ ] **Configure Clerk development environment**
  ```bash
  # 1. Clerk Dashboard → Switch to Development
  # 2. Copy pk_test_* and sk_test_* keys
  # 3. Add to .env.staging
  ```

- [ ] **Create staging Redis** (optional, recommended)
  ```bash
  # 1. Upstash Console → New Database
  # 2. Name: meetsolis-staging
  # 3. Copy credentials
  ```

- [ ] **Add staging environment variables to Vercel**
  ```bash
  vercel env add NEXT_PUBLIC_SUPABASE_URL preview
  # Paste staging Supabase URL

  vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY preview
  # Paste pk_test_* key

  # ... (repeat for all variables)
  ```

- [ ] **Test staging deployment**
  ```bash
  # Push to staging branch
  git checkout -b staging
  git push origin staging

  # Vercel auto-deploys preview
  # Visit: https://meetsolis-git-staging-yourname.vercel.app
  ```

---

## Clerk User Sync Configuration

**CRITICAL:** Clerk webhook must sync users to CORRECT Supabase project

### Production Webhook

**Clerk Dashboard → Production → Webhooks**

- Endpoint: `https://meetsolis.com/api/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`
- Destination: Production Supabase (DATABASE_URL_PRODUCTION)

**Test:**
```bash
# Create test user in Clerk
# Check production Supabase users table
psql $DATABASE_URL_PRODUCTION -c "SELECT * FROM users ORDER BY created_at DESC LIMIT 1"
# Should show newly created user
```

---

### Staging Webhook

**Clerk Dashboard → Development → Webhooks**

- Endpoint: `https://staging.meetsolis.com/api/webhooks/clerk` (or ngrok for local)
- Events: `user.created`, `user.updated`, `user.deleted`
- Destination: Staging Supabase (DATABASE_URL_STAGING)

**For local testing with ngrok:**
```bash
# 1. Start ngrok
ngrok http 3000

# 2. Copy ngrok URL (e.g., https://abc123.ngrok.io)

# 3. Clerk Dashboard → Development → Webhooks
#    Endpoint: https://abc123.ngrok.io/api/webhooks/clerk

# 4. Create test user in Clerk
# 5. Check staging Supabase
psql $DATABASE_URL_STAGING -c "SELECT * FROM users ORDER BY created_at DESC LIMIT 1"
```

---

## Security Best Practices

### 1. Never Commit Secrets

```bash
# .gitignore (should already include)
.env
.env.local
.env.production
.env.staging
.env*.local
```

### 2. Use Environment Variables, Not Hardcoded Values

```typescript
// ❌ BAD
const supabaseUrl = "https://xxxxx.supabase.co";

// ✅ GOOD
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

### 3. Rotate Keys Regularly

- Supabase service role key: Every 90 days
- Clerk secret key: Every 90 days
- OpenAI API key: If compromised
- Stripe secret key: If compromised

### 4. Use Separate Keys for Staging

- Prevents staging bugs from affecting production
- Easier to track usage/costs
- Can revoke staging keys without breaking production

---

## Troubleshooting

### Issue: Clerk users not syncing to Supabase

**Check:**
1. Webhook configured correctly (URL, events, signing secret)
2. Webhook endpoint returns 200 OK
3. Supabase connection working (`DATABASE_URL` correct)
4. `users` table exists with correct schema

**Test webhook:**
```bash
# Check Clerk webhook logs
# Clerk Dashboard → Webhooks → Your webhook → Logs

# Manually test endpoint
curl -X POST https://meetsolis.com/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: test" \
  -H "svix-timestamp: $(date +%s)" \
  -H "svix-signature: test" \
  -d '{"type": "user.created", "data": {...}}'
```

---

### Issue: Database connection fails

**Check:**
1. `DATABASE_URL` format correct
2. Password doesn't contain special characters (URL-encode if needed)
3. IP allowlist configured (if Supabase has restrictions)
4. Database not paused (Supabase free tier pauses after inactivity)

**Test connection:**
```bash
psql $DATABASE_URL -c "SELECT 1"
# Should return: 1
```

---

### Issue: Wrong Supabase project (staging vs production)

**Symptom:** Changes appear in wrong environment

**Fix:**
```bash
# Check which Supabase URL is configured
echo $NEXT_PUBLIC_SUPABASE_URL

# Production should be: https://xxxxx.supabase.co
# Staging should be: https://yyyyy.supabase.co

# Update if wrong
vercel env rm NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste correct production URL
```

---

## Quick Reference

| Service | Production | Staging | Shared? |
|---------|-----------|---------|---------|
| Supabase | `meetsolis-production` (existing) | `meetsolis-staging` (NEW) | ❌ Separate |
| Clerk | Production environment | Development environment | ❌ Separate |
| Upstash Redis | Production DB | Staging DB (or shared) | ⚠️ Recommend separate |
| OpenAI | Same API key | Same API key | ✅ Shared (tag usage) |
| Gladia | Same API key | Same API key | ✅ Shared (10h/mo limit) |
| Stripe | Live mode | Test mode | ❌ Separate |
| Vercel | Production deployment | Preview deployment | ❌ Separate |

---

## Summary

**To set up staging for migration testing:**

1. ✅ **Production Supabase**: Already exists (Epic 1 is here)
2. ➕ **Create staging Supabase**: New project for testing
3. 📋 **Clone production data** → staging
4. 🔑 **Add staging env vars** to Vercel (preview environment)
5. 🧪 **Test migration on staging** first
6. ✅ **Run migration on production** after staging success

**Your app continues using production Supabase throughout this process!**

---

**Last Updated:** January 7, 2026
**Owner:** DevOps Team
