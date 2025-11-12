# User Sync Architecture: Clerk → Supabase

## Overview

This document explains how users are synchronized from Clerk (authentication) to Supabase (database).

---

## Dual-Approach System

We use **TWO methods** to ensure users are always synced:

### 1. Primary: Webhook-Based Sync (Recommended)

**How it works:**
```
User signs up in Clerk
    ↓
Clerk sends webhook → POST /api/webhooks/clerk
    ↓
Webhook handler creates user in Supabase
    ↓
User exists in both systems immediately ✅
```

**Advantages:**
- ✅ Immediate sync (happens at signup)
- ✅ Clean architecture
- ✅ Follows best practices
- ✅ No API overhead later

**Disadvantages:**
- ❌ Requires webhook configuration
- ❌ Needs public URL (ngrok for local dev)
- ❌ Can fail if webhook is down

**Implementation:**
- File: `apps/web/src/app/api/webhooks/clerk/route.ts`
- Service: `apps/web/src/services/auth.ts` (`createUserProfile()`)
- Setup: See `WEBHOOK_SETUP.md`

---

### 2. Fallback: Auto-Create on First API Call

**How it works:**
```
User tries to use API (e.g., save profile)
    ↓
API checks if user exists in Supabase
    ↓
If NOT found → Fetch from Clerk → Create in Supabase
    ↓
Continue with API request ✅
```

**Advantages:**
- ✅ No configuration needed
- ✅ Works immediately
- ✅ Handles webhook failures gracefully
- ✅ Perfect for development

**Disadvantages:**
- ❌ Creates users "lazily" (not at signup)
- ❌ Small overhead on first API call
- ❌ User doesn't exist until they interact with app

**Implementation:**
```typescript
// File: apps/web/src/app/api/profile/route.ts
// File: apps/web/src/app/api/meetings/route.ts

async function getOrCreateUser(supabase, userId) {
  // Try to find existing user
  let user = await getUserByClerkId(supabase, userId);

  // Not found? Create from Clerk data
  if (!user) {
    const clerkUser = await currentUser();
    user = await createUserProfile(
      userId,
      clerkUser.emailAddresses[0].emailAddress,
      clerkUser.firstName,
      clerkUser.lastName
    );
  }

  return user;
}
```

---

## Comparison Matrix

| Feature | Webhook Sync | Auto-Create Fallback |
|---------|--------------|----------------------|
| **Setup Required** | ⚠️ Yes (Clerk dashboard + ngrok) | ✅ None |
| **Works Locally** | ⚠️ With ngrok | ✅ Yes |
| **Production Ready** | ✅ Yes | ✅ Yes |
| **Timing** | ⏱️ Immediate (at signup) | ⏱️ Lazy (first API call) |
| **Reliability** | ⚠️ Can fail if webhook down | ✅ Always works |
| **API Overhead** | ✅ None | ⚠️ Small (first call only) |
| **Best Practice** | ✅ Yes | ⚠️ Fallback only |

---

## Current Implementation

**Both methods are implemented!**

```typescript
// When user signs up:
1. Webhook tries to create user in Supabase ← Primary method
2. If webhook fails/not configured, user created later ← Fallback

// When user calls API (e.g., /api/profile):
1. Check if user exists in Supabase
2. If not found → Auto-create from Clerk ← Fallback kicks in
3. Continue with API request
```

**This gives you:**
- ✅ **Resilience:** Always works, even if webhook fails
- ✅ **Development:** No setup needed for local dev
- ✅ **Production:** Proper webhook sync when configured
- ✅ **Safety Net:** Fallback catches edge cases

---

## When Each Method is Used

### Development Mode (Default)

**Without webhook configured:**
```
User signs up → Clerk only
User visits /onboarding → First API call → Auto-create in Supabase ✅
```

**With webhook configured:**
```
User signs up → Webhook creates in Supabase ✅
User visits /onboarding → User already exists → No auto-create needed ✅
```

### Production Mode

**Recommended setup:**
```
User signs up → Webhook creates in Supabase ✅
Fallback remains active as safety net ✅
```

---

## Setup Instructions

### Option 1: Development (No Webhook)

**Current status:** ✅ Already working!

Just use the app. Users will be auto-created on first API call.

**No additional setup required.**

### Option 2: Development (With Webhook)

Follow `WEBHOOK_SETUP.md` to configure webhooks for local development.

**Requires:**
- ngrok (to expose localhost)
- Clerk webhook configuration
- CLERK_WEBHOOK_SECRET in .env.local

### Option 3: Production

1. Deploy to production (Vercel, etc.)
2. Configure Clerk webhook with production URL
3. Add CLERK_WEBHOOK_SECRET to production environment variables

**The fallback remains active as a safety net.**

---

## Troubleshooting

### User Not Created in Supabase

**Symptoms:**
- API returns "User not found" errors
- No user record in Supabase `users` table

**Diagnosis:**
```bash
# Check if webhook is configured
echo $CLERK_WEBHOOK_SECRET
# If empty → Using fallback (should still work)

# Check Clerk webhook logs
# Dashboard → Webhooks → Logs
# If no events → Webhook not firing

# Check API logs
# Should see: "User {id} not found in Supabase, creating from Clerk..."
```

**Solution:**
The fallback should automatically create the user. If it doesn't:
1. Check database migration was run (001_create_schema.sql)
2. Verify SUPABASE_SERVICE_ROLE_KEY has INSERT permission
3. Check terminal logs for errors

### Webhook Fails But Fallback Doesn't Work

**Symptoms:**
- Webhook returns 500 error in Clerk logs
- User still not created on API call

**Diagnosis:**
```typescript
// Check apps/web/src/app/api/profile/route.ts
// Look for: await getOrCreateUser(supabase, userId);
```

**Solution:**
This should be fixed in the latest code. If not, the auto-create fallback is missing from the API route.

---

## Code Locations

### Webhook Handler
- **Route:** `/api/webhooks/clerk`
- **File:** `apps/web/src/app/api/webhooks/clerk/route.ts`
- **Events:** `user.created`, `user.updated`, `user.deleted`

### User Creation Service
- **File:** `apps/web/src/services/auth.ts`
- **Functions:**
  - `createUserProfile()` - Create user in Supabase
  - `updateUserProfile()` - Update user in Supabase
  - `deleteUserProfile()` - Delete user from Supabase

### Auto-Create Fallback
- **Profile API:** `apps/web/src/app/api/profile/route.ts`
- **Meetings API:** `apps/web/src/app/api/meetings/route.ts`
- **Helper:** `getOrCreateUser()` function

### Database Schema
- **Migration:** `apps/web/migrations/001_create_schema.sql`
- **Table:** `users`
- **Columns:** `id`, `clerk_id`, `email`, `name`, etc.

---

## Best Practices

### ✅ DO

- Keep both webhook AND fallback enabled (defense in depth)
- Configure webhooks for production deployments
- Use fallback for local development (no ngrok needed)
- Monitor webhook logs in Clerk dashboard
- Add logging to track which method created the user

### ❌ DON'T

- Don't remove the fallback (it's your safety net)
- Don't expose CLERK_WEBHOOK_SECRET in client code
- Don't assume webhooks will always work (networks fail)
- Don't create users manually in Supabase (let the system do it)

---

## Monitoring

### Check Webhook Status

**Clerk Dashboard:**
1. Go to https://dashboard.clerk.com
2. Navigate to Webhooks
3. Click your endpoint
4. Check "Logs" tab
5. Look for recent `user.created` events

**Expected:**
```
user.created → 200 OK ✅
Payload: { id: "user_abc123", email: "..." }
```

### Check Fallback Usage

**Terminal Logs:**
```bash
# Look for this message:
User user_abc123 not found in Supabase, creating from Clerk...
```

**If you see this:**
- ✅ Fallback is working
- ⚠️ Webhook didn't create the user (not configured or failed)

**If you DON'T see this:**
- ✅ Webhook created the user successfully
- ✅ No fallback needed

### Database Checks

**Supabase Dashboard:**
1. Go to Table Editor → `users`
2. Check for recent records
3. Verify `clerk_id`, `email`, `name` are populated

---

## Summary

**Current State:**
- ✅ Webhook handler implemented
- ✅ Auto-create fallback implemented
- ⚠️ Webhook NOT configured (by choice)
- ✅ Fallback is active and working

**Recommendation:**
- **Local Development:** Use fallback (current state) ✅
- **Production:** Configure webhook + keep fallback as safety net

**Next Steps:**
1. Test onboarding with current fallback (should work)
2. Optionally: Configure webhook using `WEBHOOK_SETUP.md`
3. Deploy to production with webhook configured
