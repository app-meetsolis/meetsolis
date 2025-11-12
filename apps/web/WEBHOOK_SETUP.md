# Clerk Webhook Setup Guide

This guide explains how to set up Clerk webhooks to automatically sync users from Clerk to Supabase.

## Why Do I Need This?

When a user signs up via Clerk, they need to be created in your Supabase database as well. Clerk webhooks automate this process:

```
User signs up → Clerk webhook fires → User created in Supabase ✅
```

**Without webhooks:**
- ❌ Users exist in Clerk but not in Supabase
- ❌ API calls fail with "User not found" errors
- ✅ The auto-create fallback works but is not ideal

**With webhooks:**
- ✅ Automatic user sync
- ✅ Clean architecture
- ✅ No errors

---

## Setup Instructions

### Step 1: Create Webhook Endpoint in Clerk Dashboard

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Select your application

2. **Navigate to Webhooks**
   - Click "Webhooks" in the left sidebar
   - Click "+ Add Endpoint" button

3. **Configure Endpoint**

   **For Local Development:**
   - Endpoint URL: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - (See Step 2 below for ngrok setup)

   **For Production:**
   - Endpoint URL: `https://your-domain.com/api/webhooks/clerk`

4. **Select Events to Subscribe**
   - ✅ Check `user.created`
   - ✅ Check `user.updated`
   - ✅ Check `user.deleted`

5. **Copy Signing Secret**
   - After creating the endpoint, you'll see a "Signing Secret"
   - It starts with `whsec_...`
   - Copy this value

### Step 2: Add Secret to Environment Variables

1. Open `apps/web/.env.local`

2. Find the line:
   ```bash
   CLERK_WEBHOOK_SECRET=
   ```

3. Paste your signing secret:
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_your_actual_secret_here
   ```

4. Save the file

5. **Restart your development server:**
   ```bash
   # Stop server: Ctrl+C
   npm run dev
   ```

### Step 3: Expose Localhost for Testing (Development Only)

Clerk webhooks need a publicly accessible URL. For local development, use ngrok:

#### Install ngrok

**Windows:**
```bash
choco install ngrok
```

**Mac:**
```bash
brew install ngrok
```

**Or download from:** https://ngrok.com/download

#### Run ngrok

1. **Start your Next.js dev server:**
   ```bash
   npm run dev
   ```

2. **In a NEW terminal, run ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL:**
   ```
   Forwarding    https://abc123.ngrok.io -> http://localhost:3000
                 ^^^^^^^^^^^^^^^^^^^^^^^^
                 Copy this URL
   ```

4. **Update Clerk webhook endpoint:**
   - Go back to Clerk Dashboard → Webhooks
   - Edit your endpoint
   - Change URL to: `https://abc123.ngrok.io/api/webhooks/clerk`
   - Save

### Step 4: Test the Webhook

1. **Create a new test user:**
   - Go to your sign-up page: http://localhost:3000/sign-up
   - Create a new account with a fresh email

2. **Check the webhook fired:**
   - In Clerk Dashboard → Webhooks → Your Endpoint
   - Click "Logs" tab
   - You should see a `user.created` event with status 200 ✅

3. **Verify user created in Supabase:**
   - Go to Supabase Dashboard → Table Editor → `users` table
   - Find the new user record
   - Should have: `clerk_id`, `email`, `name` populated ✅

4. **Check your terminal logs:**
   ```
   User created: user_abc123xyz
   ```

---

## Troubleshooting

### Webhook Not Firing

**Problem:** No webhook events in Clerk logs

**Solutions:**
1. ✅ Check ngrok is running and forwarding to port 3000
2. ✅ Verify webhook URL in Clerk uses the ngrok HTTPS URL
3. ✅ Ensure `user.created` event is checked in Clerk webhook config
4. ✅ Create a NEW user (webhooks don't fire for existing users)

### Webhook Returns 401 Unauthorized

**Problem:** Webhook logs show 401 error

**Solutions:**
1. ✅ Check `CLERK_WEBHOOK_SECRET` is set in `.env.local`
2. ✅ Verify the secret matches the one in Clerk Dashboard
3. ✅ Restart development server after adding the secret
4. ✅ Check no extra spaces in the secret value

### User Not Created in Supabase

**Problem:** Webhook fires (200) but user not in Supabase

**Solutions:**
1. ✅ Check terminal logs for errors
2. ✅ Verify database migration 001_create_schema.sql was run
3. ✅ Check Supabase credentials in `.env.local`
4. ✅ Verify `SUPABASE_SERVICE_ROLE_KEY` has permission to insert users

### ngrok URL Keeps Changing

**Problem:** ngrok gives you a new URL every time you restart it

**Solutions:**
1. Use ngrok auth token for persistent URLs (free tier)
2. Or: Update Clerk webhook URL each time ngrok restarts
3. Or: Use the auto-create fallback for local development (no webhook needed)

---

## Production Deployment

For production, you DON'T need ngrok. Just use your real domain:

1. **Deploy to Vercel/Netlify/etc**
   - Get your production URL (e.g., `https://meetsolis.com`)

2. **Update Clerk Webhook:**
   - Endpoint URL: `https://meetsolis.com/api/webhooks/clerk`

3. **Add Secret to Production Environment:**
   - In Vercel: Settings → Environment Variables
   - Add: `CLERK_WEBHOOK_SECRET=whsec_...`

4. **Done!** Webhooks work automatically in production ✅

---

## Current Status (Development Mode)

**Right now, you're using the auto-create fallback:**

- ✅ **Workaround:** Users auto-created on first API call
- ❌ **Webhook:** Not configured (recommended for production)

**To enable webhooks:**
1. Follow Steps 1-4 above
2. The auto-create fallback will remain as a safety net

**To skip webhooks:**
- Just use the auto-create fallback (already working)
- Configure webhooks later when deploying to production

---

## Need Help?

If you encounter issues:
1. Check Clerk webhook logs (Dashboard → Webhooks → Logs)
2. Check your terminal for error messages
3. Verify all environment variables are set correctly
4. Ensure database migrations have been run

**The auto-create fallback will work regardless, so this is optional for development!**
