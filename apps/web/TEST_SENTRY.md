# Sentry Integration Test

## Quick Test Instructions

### 1. Start the Development Server

```bash
cd apps/web
npm run dev
```

### 2. Check Console for Sentry Initialization

When the server starts, you should see in your browser console (http://localhost:3000):

✅ **Expected Output**:

```
Sentry client-side monitoring is disabled. Set NEXT_PUBLIC_SENTRY_DSN to enable error tracking.
```

**OR if DSN is detected**:

```
[Sentry] Successfully initialized
```

### 3. Test Error Tracking (Option A - Browser Console)

Open browser console on any page and run:

```javascript
// Test client-side error tracking
import('@/lib/monitoring/sentry').then(({ logWebRTCError }) => {
  logWebRTCError(new Error('Test error from browser'), {
    meetingId: 'test-meeting-123',
    userId: 'test-user-456',
  });
  console.log('✅ Test error sent to Sentry!');
});
```

### 4. Test Error Tracking (Option B - Create Test Page)

Navigate to: `http://localhost:3000/test-sentry` (we'll create this)

This page will have a button to trigger test errors.

### 5. Verify in Sentry Dashboard

1. Go to https://sentry.io
2. Navigate to your project
3. Click "Issues" in the left sidebar
4. You should see your test error appear within ~30 seconds

---

## Expected Results

✅ **Success Indicators**:

- Dev server starts without errors
- No Sentry-related warnings in console
- Test error appears in Sentry dashboard
- Error includes WebRTC context (meetingId, userId)

❌ **Failure Indicators**:

- "Sentry DSN not found" warnings
- Network errors to Sentry
- Errors not appearing in dashboard

---

## Troubleshooting

### Issue: "Sentry client-side monitoring is disabled"

**Cause**: Environment variable not loaded
**Fix**:

1. Stop dev server (Ctrl+C)
2. Restart: `npm run dev`
3. Hard refresh browser (Ctrl+Shift+R)

### Issue: Errors not appearing in dashboard

**Cause**: Development mode suppresses some errors
**Fix**: Check Sentry project settings → "Development" environment should show errors

### Issue: Network errors to Sentry

**Cause**: Invalid DSN or firewall blocking
**Fix**: Verify DSN is correct in .env.local

---

## Next Steps

After verifying Sentry works:

1. ✅ Mark "Test Sentry integration" as complete
2. ✅ Update quality gate status
3. ✅ Mark Story 2.1 as complete
4. 🚀 Ready for production deployment

---

## Delete This File

Once testing is complete, you can safely delete this file:

```bash
rm apps/web/TEST_SENTRY.md
```
