# Story 2.4 Production Deployment Guide

## 🎯 Objective

Deploy Story 2.4 (Real-Time Messaging and Chat Features) to production with production-ready rate limiting.

## ✅ Pre-Deployment Checklist

### Code Quality
- [x] TypeScript compilation passes (0 errors)
- [x] All tests pass (63 comprehensive tests)
- [x] Security fixes applied (SEC-001 resolved)
- [x] Test coverage complete (TEST-001 resolved)

### Infrastructure Setup
- [ ] Upstash Redis database created
- [ ] Environment variables configured
- [ ] Rate limiting verified in local development
- [ ] Rate limiting verified in staging

---

## 📋 Step-by-Step Deployment

### Step 1: Create Upstash Redis Database (5-10 minutes)

1. **Sign up for Upstash**
   - Go to [https://upstash.com](https://upstash.com)
   - Sign up with GitHub, Google, or Email
   - Verify your email

2. **Create Database**
   - Click "Create Database"
   - **Name:** `meetsolis-rate-limit-prod`
   - **Type:** Regional (recommended for cost)
   - **Region:** Choose closest to your Vercel deployment (e.g., `us-east-1`)
   - **Eviction:** LRU (default)
   - **TLS:** Enabled (default)
   - Click "Create"

3. **Get Credentials**
   - Go to Database Details
   - Scroll to "REST API" section
   - Copy:
     - **UPSTASH_REDIS_REST_URL** (e.g., `https://your-db-12345.upstash.io`)
     - **UPSTASH_REDIS_REST_TOKEN** (long string starting with `AY...`)

### Step 2: Configure Local Environment (2 minutes)

1. **Create `.env.local`** (if not exists)
   ```bash
   cp .env.example .env.local
   ```

2. **Add Upstash Credentials**
   Edit `.env.local` and add:
   ```env
   UPSTASH_REDIS_REST_URL=https://your-db-12345.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AYour_token_here...
   ```

3. **Restart Dev Server**
   ```bash
   npm run dev
   ```

### Step 3: Verify Local Setup (5 minutes)

1. **Run Verification Script**
   ```bash
   npx tsx scripts/verify-redis-setup.ts
   ```

   Expected output:
   ```
   ✅ Environment Variables - PASS
   ✅ Redis Connection - PASS
   ✅ Rate Limiting Functions - PASS
   ✅ Rate Limit Utility - PASS

   🎉 ALL CHECKS PASSED!
   ```

2. **Test Rate Limiting Manually**
   ```bash
   # Start dev server
   npm run dev

   # In another terminal, run test script
   npx tsx scripts/test-rate-limiting.ts
   ```

   Expected: 10 requests succeed, 11th fails with 429

### Step 4: Configure Staging Environment (5 minutes)

1. **Add to Vercel (Staging)**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add variables for **Preview** environment:
     - `UPSTASH_REDIS_REST_URL` = `https://your-db-12345.upstash.io`
     - `UPSTASH_REDIS_REST_TOKEN` = `AYour_token_here...`
   - Click Save

2. **Deploy to Staging**
   ```bash
   git push origin story-2.4-development-start
   ```

   Or create preview deployment:
   ```bash
   vercel --prod=false
   ```

3. **Verify Staging**
   - Wait for deployment to complete
   - Copy staging URL
   - Test rate limiting (see Step 5 below)

### Step 5: Test Rate Limiting in Staging (10 minutes)

1. **Manual API Test**
   ```bash
   # Replace STAGING_URL with your Vercel preview URL
   export STAGING_URL="https://your-preview.vercel.app"

   # Send 11 requests (10 should succeed, 11th should fail)
   for i in {1..11}; do
     echo "Request $i:"
     curl -X POST "$STAGING_URL/api/meetings/test-meeting/messages" \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer YOUR_TEST_TOKEN" \
       -d '{"content":"Test message '$i'","type":"public"}' \
       -i | grep -E "HTTP|X-RateLimit"
     echo ""
   done
   ```

2. **Expected Results**
   - Requests 1-10: `HTTP/2 201` (or 200)
   - Request 11: `HTTP/2 429` (Too Many Requests)
   - Headers should show:
     ```
     X-RateLimit-Limit: 10
     X-RateLimit-Remaining: 0
     X-RateLimit-Reset: <timestamp>
     ```

3. **Check Upstash Dashboard**
   - Go to Upstash → Database Details → Metrics
   - Verify command count increased
   - Check latency (should be <50ms)

### Step 6: Configure Production Environment (5 minutes)

⚠️ **IMPORTANT:** Use the SAME Upstash database for staging and production, OR create a separate production database.

**Option A: Same Database (Recommended for MVP)**
- Use same credentials as staging
- Separate rate limits by environment in key prefix

**Option B: Separate Database (Recommended for Production)**
- Create new database: `meetsolis-rate-limit-prod`
- Get new credentials
- Configure separately

1. **Add to Vercel (Production)**
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add variables for **Production** environment:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
   - Click Save

2. **Deploy to Production**
   ```bash
   # Merge to main branch
   git checkout main
   git merge story-2.4-development-start
   git push origin main
   ```

   Or deploy directly:
   ```bash
   vercel --prod
   ```

### Step 7: Verify Production (15 minutes)

1. **Run Smoke Tests**
   - Test message sending (should work)
   - Test rate limiting (11th request should fail)
   - Test file uploads
   - Test hand raise functionality

2. **Monitor Upstash Dashboard**
   - Watch command count
   - Check for errors
   - Verify latency <100ms

3. **Monitor Application Logs**
   ```bash
   vercel logs --prod
   ```

   Look for:
   - ✅ No "Redis connection failed" errors
   - ✅ Rate limiting working (check for 429 responses if needed)
   - ❌ Any unexpected errors

4. **Set Up Alerts (Optional)**
   - Upstash: Set quota alerts (90% of free tier)
   - Sentry: Monitor rate limit errors
   - Vercel: Monitor API response times

---

## 🔍 Verification Checklist

After deployment, verify these items:

### Local Development
- [ ] Verification script passes all checks
- [ ] Rate limiting works (10 requests succeed, 11th fails)
- [ ] Dev server starts without errors
- [ ] No Redis connection warnings in logs

### Staging Environment
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] Rate limiting works via API calls
- [ ] Upstash metrics show activity
- [ ] No errors in Vercel logs

### Production Environment
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] Rate limiting works via API calls
- [ ] Upstash metrics show activity
- [ ] No errors in Vercel logs
- [ ] Monitored for 24 hours (no issues)

---

## 📊 Monitoring & Maintenance

### Daily Monitoring (First Week)

1. **Upstash Dashboard**
   - Check command count (should stay under 10k/day for free tier)
   - Monitor latency (should be <100ms)
   - Check for connection errors

2. **Application Metrics**
   - Count of 429 responses (rate limit hits)
   - API response times
   - Error rates

3. **Cost Monitoring**
   - Upstash usage vs free tier limits
   - Estimate costs if usage grows

### Weekly Tasks

- Review rate limit violations (are limits too strict?)
- Check Upstash metrics trends
- Review error logs for Redis issues
- Update rate limits if needed (edit `RateLimitPresets`)

### Upstash Free Tier Limits

- **10,000 commands/day** = ~300,000 commands/month
- Estimate: ~3,000 active users sending 100 messages/month
- **Cost if exceeded:** $0.20 per 100,000 commands

**Monitoring Alert Thresholds:**
- Yellow: 70% of daily limit (7,000 commands)
- Red: 90% of daily limit (9,000 commands)

---

## 🐛 Troubleshooting

### Issue: "Rate limiting disabled (development mode)"

**Cause:** Redis environment variables not set

**Fix:**
1. Check `.env.local` has both variables
2. Restart dev server
3. Run verification script

### Issue: "Redis connection failed"

**Cause:** Invalid credentials or network issue

**Fix:**
1. Verify credentials in Upstash dashboard
2. Check URL format (should start with `https://`)
3. Test with: `curl https://your-redis-url.upstash.io`
4. Check firewall/network settings

### Issue: Rate limits not working

**Cause:** Redis not configured or errors being swallowed

**Fix:**
1. Check application logs for Redis errors
2. Verify Upstash metrics show activity
3. Test with verification script
4. Check rate limit utility is being called

### Issue: "429 Too Many Requests" for legitimate users

**Cause:** Rate limits too strict

**Fix:**
1. Review rate limit presets in `src/lib/rate-limit.ts`
2. Increase limits if needed:
   ```typescript
   MESSAGE: { limit: 20, window: 60 }  // Increase from 10 to 20
   ```
3. Redeploy

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ All verification checks pass
- ✅ Rate limiting works in staging and production
- ✅ No Redis connection errors in logs
- ✅ Upstash metrics show activity
- ✅ Application works normally
- ✅ 24-hour monitoring shows no issues
- ✅ Quality Gate status: **PASS**

---

## 📞 Support

- **Upstash Docs:** https://docs.upstash.com/redis
- **Upstash Discord:** https://discord.gg/upstash
- **Issues:** File in this repository

---

## 🚀 Post-Deployment

After successful deployment:

1. ✅ Mark SEC-001 as VERIFIED in quality gate
2. ✅ Update Story 2.4 status to DONE
3. ✅ Document lessons learned
4. 🎯 Plan for PERF-001 and REQ-001 in future sprints
5. 🎉 Celebrate! You've successfully deployed production-ready rate limiting! 🎉
