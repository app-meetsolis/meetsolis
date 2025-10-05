# Clerk Webhook Setup Guide

This guide explains how to configure Clerk webhooks to automatically sync user accounts to Supabase.

## Problem

Without webhook configuration, new users who sign up with Clerk are NOT automatically added to the Supabase `users` table. This causes "User not found" errors when they try to access protected features.

## Why Webhooks Are Needed

When a user signs up:
1. ✅ Clerk creates the user account
2. ❌ Your Supabase database doesn't know about the user
3. ❌ API routes fail with 404 "User not found"

**The webhook fixes this by:**
- Clerk sends `user.created` event → Your app receives it
- Your app automatically inserts user into Supabase `users` table
- User can immediately access protected features

---

## Setup Options

### Option 1: Local Development with ngrok ⭐ Recommended for Testing

**Use this when:** Developing locally and need to test with multiple user accounts

#### Prerequisites
- Development server running (`npm run dev`)
- Clerk account with application created

#### Steps

**1. Install ngrok**

```bash
# Using npm
npm install -g ngrok

# Or download from https://ngrok.com/download
```

**2. Start your dev server**

```bash
# From project root
npm run dev
```

Wait for "✓ Compiled successfully"

**3. Start ngrok tunnel (in separate terminal)**

```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding   https://abc123def456.ngrok.io -> http://localhost:3000
```

Copy the `https://` URL (e.g., `https://abc123def456.ngrok.io`)

**4. Configure Clerk Webhook**

Go to Clerk Dashboard: https://dashboard.clerk.com

- Select your application: **deep-ocelot-7** (or your app name)
- Navigate to: **Webhooks** (in left sidebar)
- Click: **Add Endpoint**

**Configure endpoint:**
- **Endpoint URL:** `https://abc123def456.ngrok.io/api/webhooks/clerk`
  - Replace `abc123def456.ngrok.io` with your ngrok URL
  - Keep `/api/webhooks/clerk` path exactly as shown
- **Description:** "Development - User Sync to Supabase"
- **Subscribe to events:**
  - ✅ `user.created`
  - ✅ `user.updated`
  - ✅ `user.deleted`
- Click **Create**

**5. Copy Signing Secret**

After creating the endpoint:
- Click on the endpoint to view details
- Find **Signing Secret** (starts with `whsec_`)
- Click **Copy** button

Example: `whsec_abc123xyz789...`

**6. Add to `.env.local`**

Open `apps/web/.env.local` and add:

```bash
# Clerk Webhook Secret (for ngrok development)
CLERK_WEBHOOK_SECRET=whsec_abc123xyz789...
```

Replace `whsec_abc123xyz789...` with your actual secret.

**7. Restart development server**

```bash
# Stop server (Ctrl+C in terminal running npm run dev)
npm run dev
```

**8. Test webhook**

- Open your app: `http://localhost:3000`
- Sign out (if already logged in)
- Click **Sign Up**
- Create a new account with a different email
- After signup, check console logs for:
  ```
  User created: user_xxxxxxxxxxxxx
  ```

**9. Verify in Supabase**

Go to Supabase Dashboard → Table Editor → `users` table

You should see the new user with:
- `clerk_id`: user_xxxxxxxxxxxxx
- `email`: your test email
- `name`: First Last
- `role`: participant

✅ **Success!** New users now automatically sync.

---

#### Troubleshooting ngrok

**Error: "Webhook verification failed"**

**Cause:** Signing secret doesn't match

**Fix:**
1. Delete the old endpoint in Clerk Dashboard
2. Create a new endpoint
3. Copy the NEW signing secret
4. Update `CLERK_WEBHOOK_SECRET` in `.env.local`
5. Restart server

**Error: "Failed to connect to webhook"**

**Cause:** ngrok tunnel expired or stopped

**Fix:**
1. Check ngrok is still running (should show "Forwarding..." line)
2. If ngrok stopped, restart it: `ngrok http 3000`
3. Update Clerk webhook endpoint URL with new ngrok URL
4. Restart your dev server

**ngrok URL changes every restart**

**Problem:** Free ngrok gives you a new URL each time

**Solutions:**
- **Quick:** Update Clerk webhook URL each time ngrok restarts
- **Better:** Get ngrok paid plan for static URL
- **Best:** Use Vercel deployment (see Option 2 below)

---

### Option 2: Production Deployment (Vercel)

**Use this when:** Deploying to production or want a permanent webhook URL

#### Prerequisites
- Vercel account
- Project pushed to Git (GitHub/GitLab/Bitbucket)

#### Steps

**1. Deploy to Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project root
vercel deploy
```

Follow the prompts:
- Link to existing project or create new
- Set root directory (leave default)
- Override settings? No

**2. Get production URL**

After deployment completes:
```
✓ Production: https://meetsolis.vercel.app
```

Or get from Vercel Dashboard:
- Go to https://vercel.com/dashboard
- Click your project
- Copy the production URL

**3. Configure Clerk Webhook**

Go to Clerk Dashboard: https://dashboard.clerk.com

- Select your application
- Navigate to: **Webhooks**
- Click: **Add Endpoint**

**Configure endpoint:**
- **Endpoint URL:** `https://meetsolis.vercel.app/api/webhooks/clerk`
  - Replace with your actual Vercel URL
  - Keep `/api/webhooks/clerk` path
- **Description:** "Production - User Sync to Supabase"
- **Subscribe to events:**
  - ✅ `user.created`
  - ✅ `user.updated`
  - ✅ `user.deleted`
- Click **Create**

**4. Copy Signing Secret**

- Click on the endpoint
- Copy **Signing Secret** (starts with `whsec_`)

**5. Add to Vercel Environment Variables**

In Vercel Dashboard:
- Go to your project
- Click **Settings** → **Environment Variables**
- Add new variable:
  - **Name:** `CLERK_WEBHOOK_SECRET`
  - **Value:** `whsec_abc123xyz789...` (your actual secret)
  - **Environments:** Select **Production**, **Preview**, **Development**
- Click **Save**

**6. Redeploy**

```bash
vercel --prod
```

Or trigger redeploy from Vercel Dashboard:
- Go to **Deployments** tab
- Click **...** on latest deployment
- Click **Redeploy**

**7. Test**

- Visit your production URL: `https://meetsolis.vercel.app`
- Sign up with a new account
- Check Supabase `users` table for new entry

✅ **Success!** Production webhook configured.

---

### Option 3: Manual User Sync (Development Only)

**Use this when:** Quick testing without setting up ngrok/Vercel

**⚠️ Not recommended** - requires manual work for each test user

#### Steps

**1. Sign in with new user**

- Go to `http://localhost:3000`
- Sign up with new email
- Complete signup

**2. Get Clerk ID**

Visit debug endpoint:
```
http://localhost:3000/api/debug/me
```

Copy the `clerk_id` value:
```json
{
  "clerk_id": "user_abc123xyz789",
  "email": "test@example.com",
  "first_name": "Test",
  "last_name": "User",
  "full_name": "Test User"
}
```

**3. Insert into Supabase**

Go to Supabase Dashboard → SQL Editor

Run this query (replace values):

```sql
INSERT INTO users (
  clerk_id,
  email,
  name,
  role,
  created_at,
  updated_at
)
VALUES (
  'user_abc123xyz789',  -- From step 2
  'test@example.com',    -- From step 2
  'Test User',           -- From step 2
  'participant',         -- Default role
  NOW(),
  NOW()
);
```

**4. Refresh dashboard**

Go back to `http://localhost:3000/dashboard` and refresh

✅ User should now work

**Repeat for each new test user**

---

## Webhook Handler Code

The webhook is already implemented at:
```
apps/web/src/app/api/webhooks/clerk/route.ts
```

It handles:
- `user.created` → Creates user in Supabase
- `user.updated` → Updates user info in Supabase
- `user.deleted` → Soft deletes user in Supabase

**No code changes needed** - just configure the webhook URL and secret.

---

## Verification

After webhook is configured, verify it's working:

**1. Check Clerk Dashboard**

- Go to Webhooks → Your endpoint
- Click **Testing** tab
- Send a test `user.created` event
- Should see "200 OK" response

**2. Check Server Logs**

When a user signs up, you should see:
```
User created: user_xxxxxxxxxxxxx
```

**3. Check Supabase**

New users should appear in `users` table immediately after signup.

---

## Security Notes

**Webhook Secret**
- Never commit `CLERK_WEBHOOK_SECRET` to Git
- Keep it in `.env.local` (gitignored)
- Rotate secret if exposed

**Webhook Verification**
- The handler uses `svix` to verify signatures
- Requests without valid signature are rejected (401)
- Don't disable webhook verification

---

## Common Issues

**"Webhook verification failed"**
- Check `CLERK_WEBHOOK_SECRET` matches Clerk Dashboard
- Ensure no extra spaces in secret
- Restart server after changing `.env.local`

**"User not found" error persists**
- Check webhook endpoint is active in Clerk Dashboard
- Check server logs for webhook errors
- Verify webhook URL is correct
- Try manual SQL insert as temporary workaround

**Webhook not receiving events**
- Check ngrok/Vercel URL is publicly accessible
- Check Clerk webhook endpoint status (should be green)
- Check firewall isn't blocking incoming requests
- Review Clerk Dashboard webhook logs for errors

---

## Next Steps

After webhook is configured:
1. ✅ New users automatically sync to Supabase
2. ✅ No more "User not found" errors
3. ✅ Can delete `/api/debug/me` endpoint (if desired)
4. ✅ Multi-user testing works seamlessly

**For Story 1.5 completion:**
- Webhook configuration is recommended but not required
- Manual sync is acceptable for single-user testing
- Production deployment MUST have webhook configured
