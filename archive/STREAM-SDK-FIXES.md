# Stream SDK - Fixes Applied

## ✅ Issue #1: Content Security Policy (CSP) Blocking Stream SDK - FIXED

### Problem
```
Refused to connect to 'https://hint.stream-io-video.com/' because it violates
the document's Content Security Policy.
```

### Solution
Added Stream SDK domains to Content Security Policy in `apps/web/src/lib/security/headers.ts`:

**Domains Added:**
- `https://*.stream-io-api.com` - Stream API endpoints
- `wss://*.stream-io-api.com` - WebSocket connections
- `https://*.stream-io-video.com` - Video streaming endpoints
- `wss://*.stream-io-video.com` - Video WebSocket connections
- `https://hint.stream-io-video.com` - Location hint service
- `blob:` in `media-src` - For MediaStream objects

### Status
✅ **FIXED** - Committed in: `f298f82`

---

## ❌ Issue #2: "Failed to join meeting: Internal Server Error"

### Problem
```
Error: Failed to join meeting: {"error":{"code":"INTERNAL_ERROR","message":"Internal server error"}}
```

### Root Cause
This error occurs when trying to join a meeting that doesn't exist yet. You need to **create a meeting first** before joining it.

### Solution

#### Option 1: Create Meeting Through UI (Recommended)

1. **Restart dev server** to apply CSP changes:
   ```bash
   # Press Ctrl+C to stop current server
   npm run dev
   ```

2. **Navigate to dashboard** and create a new meeting:
   - Go to http://localhost:3000/dashboard
   - Click "Create Meeting" or "Schedule Meeting"
   - This creates a meeting in the database

3. **Join the meeting:**
   - Use the meeting link provided
   - Or navigate to `/meeting/[meeting-code]`

#### Option 2: Check if Meeting Exists

If you're trying to join an existing meeting, verify:

1. **Meeting code is correct**
   - Check the URL: `/meeting/[code]`
   - Meeting codes should be alphanumeric

2. **Meeting exists in database**
   - Open Supabase dashboard
   - Check `meetings` table
   - Verify meeting with that code exists

3. **Meeting is not ended**
   - Check `status` column in `meetings` table
   - Status should be 'scheduled' or 'active', not 'ended'

#### Option 3: Create Meeting Programmatically (For Testing)

If you need to create a test meeting quickly:

```bash
# Open Supabase SQL Editor or run this query
INSERT INTO meetings (
  id,
  meeting_code,
  title,
  host_id,
  status,
  created_at,
  scheduled_start
) VALUES (
  gen_random_uuid(),
  'test-meeting-123',  -- Your meeting code
  'Test Meeting',
  '[your-clerk-user-id]',  -- Replace with your Clerk user ID
  'scheduled',
  NOW(),
  NOW()
);
```

Then join: http://localhost:3000/meeting/test-meeting-123

---

## 🧪 Testing Steps After Fixes

### Step 1: Restart Dev Server (IMPORTANT!)
```bash
# Stop current server: Ctrl+C
npm run dev
```

**Why?** The CSP changes are applied in middleware, which requires a server restart.

### Step 2: Create a Meeting

**Option A: Through UI**
1. Navigate to http://localhost:3000/dashboard
2. Click "Create Meeting" or similar
3. Note the meeting code/link

**Option B: Quick Test Meeting**
1. Open Supabase dashboard
2. Run SQL to create test meeting (see Option 3 above)
3. Use the test meeting code

### Step 3: Join the Meeting

1. Navigate to `/meeting/[your-meeting-code]`
2. Grant camera/microphone permissions when prompted
3. Check browser console for errors

### Step 4: Verify Stream SDK Connection

**Expected Console Logs (Good Signs):**
```
[StreamVideoCallManager] Initializing Stream SDK...
[StreamVideoCallManager] Joining meeting: [code]
[StreamVideoCallManager] Requesting Stream token...
[StreamVideoCallManager] Stream token received
[StreamVideoService] Initialized successfully
[StreamVideoCallManager] Joining call...
[StreamVideoCallManager] Successfully connected!
[StreamVideoService] Event listeners setup complete
```

**No CSP Errors!** - You should NOT see:
```
❌ Refused to connect... violates Content Security Policy
```

### Step 5: Test Multiple Participants

1. Open meeting in **Tab 1** (normal browser)
2. Open **Tab 2** (incognito window)
3. Sign in as different user in Tab 2
4. Join the same meeting in Tab 2
5. Verify both participants see each other

---

## 📋 Troubleshooting Common Errors

### Error: "Meeting not found"
**Cause:** Meeting doesn't exist or meeting code is wrong

**Fix:**
1. Verify meeting code in URL
2. Check database for meeting
3. Create meeting if needed

---

### Error: "User not found"
**Cause:** User doesn't exist in Supabase database

**Fix:**
1. Ensure you're logged in with Clerk
2. Check Clerk webhook is syncing users to Supabase
3. Manually create user in Supabase if needed

---

### Error: "Participant not found" (for stream-token endpoint)
**Cause:** Trying to get token before joining meeting

**Fix:**
1. Ensure you call `/api/meetings/[id]/join` first
2. Then call `/api/meetings/[id]/stream-token`
3. StreamVideoCallManager does this automatically

---

### Error: Still seeing CSP violations
**Cause:** Server not restarted after CSP changes

**Fix:**
1. Stop dev server (Ctrl+C)
2. Restart: `npm run dev`
3. Hard refresh browser (Ctrl+Shift+R)
4. Clear browser cache if needed

---

### Error: "Call not initialized"
**Cause:** Stream SDK initialization failed

**Fix:**
1. Check browser console for detailed error
2. Verify Stream API keys in `.env.local`
3. Check Stream dashboard for API key status
4. Verify token generation endpoint works

---

## ✅ Success Criteria

After applying fixes and restarting server, you should see:

1. ✅ **No CSP violations** in console
2. ✅ **Stream SDK connects** successfully
3. ✅ **Meeting join works** without 500 errors
4. ✅ **Local video appears** in participant grid
5. ✅ **Console shows** Stream initialization logs

---

## 🔄 Next Steps

1. **Restart dev server** (if not already done)
   ```bash
   npm run dev
   ```

2. **Create a meeting** (through UI or SQL)

3. **Test single participant:**
   - Join meeting
   - Verify local video shows
   - Check console for errors

4. **Test multiple participants:**
   - Open 2+ browser tabs/windows
   - Join same meeting
   - Verify all see each other

5. **If successful:**
   - Proceed with full testing guide (TESTING-STREAM-SDK.md)
   - Test 3+ participants (the critical test!)

---

## 📊 Applied Changes Summary

| File | Change | Status |
|------|--------|--------|
| `apps/web/src/lib/security/headers.ts` | Added Stream SDK domains to CSP | ✅ FIXED |
| CSP - connect-src | Added Stream API/Video domains | ✅ FIXED |
| CSP - media-src | Added `blob:` for MediaStream | ✅ FIXED |

**Commit:** `f298f82` - "fix: Add Stream SDK domains to Content Security Policy"

---

## 💡 Tips

1. **Always check console first** - Errors are detailed
2. **Restart server after .env changes** - Changes need reload
3. **Clear browser cache** - CSP is cached
4. **Use incognito for 2nd user** - Avoids Clerk session conflicts
5. **Check Stream dashboard** - Shows API usage and errors

---

## 📞 If Issues Persist

If you still encounter errors after:
- ✅ Restarting dev server
- ✅ Creating a meeting
- ✅ Clearing browser cache

Then:
1. **Copy full console errors** (including stack traces)
2. **Check browser Network tab** (failed requests)
3. **Check Stream dashboard** (dashboard.getstream.io)
4. **Share error details** for further debugging

---

**Status:** CSP Fix Applied ✅ | Server Restart Required ⚠️ | Meeting Creation Required ⚠️
