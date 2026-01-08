# Stream SDK Migration Guide

## Overview

This guide explains how to migrate from the old mesh WebRTC implementation to the new Stream SDK (SFU architecture).

## Why Migrate?

**Problems with Mesh WebRTC:**
- ❌ Fails with 3+ participants (offer collision errors)
- ❌ High bandwidth usage (N-1 connections per participant)
- ❌ No built-in recording/transcription
- ❌ Poor mobile performance
- ❌ Complex signaling (Perfect Negotiation, signal buffering)

**Benefits of Stream SDK:**
- ✅ Supports 100+ participants
- ✅ Built-in recording & transcription
- ✅ 1x upload bandwidth (SFU routes all streams)
- ✅ Automatic quality adaptation
- ✅ Free tier: 33,000 minutes/month
- ✅ Vendor independence via abstraction layer

## Quick Start

### 1. Setup (Already Done ✅)

The following files have been created:
- `apps/web/src/services/video/VideoServiceInterface.ts` - Abstraction layer
- `apps/web/src/services/video/StreamVideoService.ts` - Stream implementation
- `apps/web/src/services/video/VideoServiceFactory.ts` - Provider selection
- `apps/web/src/lib/stream/client.ts` - Stream client utilities
- `apps/web/src/app/api/meetings/[id]/stream-token/route.ts` - Token generation API
- `apps/web/src/components/meeting/StreamVideoCallManager.tsx` - New video manager

### 2. Environment Variables (Already Configured ✅)

Your `.env.local` file has been updated with Stream API credentials:
```env
STREAM_API_KEY=ycaj9mfsu9ky
STREAM_API_SECRET=u27dc8c5arjdhvp7qfkwbfk2fx2mw6nfkddap39y3mfxtdnqc3kvdrrn2kgjz6yr
NEXT_PUBLIC_STREAM_API_KEY=ycaj9mfsu9ky
NEXT_PUBLIC_VIDEO_PROVIDER=stream
```

### 3. Using the New Component

Replace `VideoCallManager` with `StreamVideoCallManager` in your meeting page:

**Before (Old Mesh WebRTC):**
```tsx
import { VideoCallManager } from '@/components/meeting';

function MeetingPage() {
  return (
    <VideoCallManager
      meetingId={meetingCode}
      userId={userId}
      userName={userName}
      onStateChange={handleStateChange}
      onError={handleError}
    />
  );
}
```

**After (New Stream SDK):**
```tsx
import { StreamVideoCallManager } from '@/components/meeting';

function MeetingPage() {
  return (
    <StreamVideoCallManager
      meetingId={meetingCode}
      userId={userId}
      userName={userName}
      onStateChange={handleStateChange}
      onError={handleError}
    />
  );
}
```

The API is identical! Same props, same callbacks, same behavior.

## Architecture Changes

### Old Architecture (Mesh)
```
VideoCallManager
  ↓
WebRTCService + SignalingService
  ↓
simple-peer (P2P connections)
  ↓
STUN/TURN servers
```

**Problems:**
- Each participant creates N-1 peer connections
- Offer collisions with 3+ participants
- Complex Perfect Negotiation implementation
- Manual signaling via Supabase Realtime

### New Architecture (SFU)
```
StreamVideoCallManager
  ↓
VideoServiceFactory
  ↓
StreamVideoService (VideoServiceInterface)
  ↓
Stream SDK
  ↓
Stream SFU (managed infrastructure)
```

**Benefits:**
- Each participant creates 1 connection to SFU
- SFU handles all routing
- No offer collisions
- Built-in signaling

## Key Files

### Core Services

| File | Purpose |
|------|---------|
| `VideoServiceInterface.ts` | Abstract interface for all video providers |
| `StreamVideoService.ts` | Stream SDK wrapper |
| `VideoServiceFactory.ts` | Provider selection (Stream/LiveKit/etc) |
| `LiveKitVideoService.ts` | Future migration stub |

### Stream SDK Utilities

| File | Purpose |
|------|---------|
| `lib/stream/client.ts` | Client initialization, token generation |
| `lib/stream/utils.ts` | Helper functions |

### API Routes

| Route | Purpose |
|-------|---------|
| `/api/meetings/[id]/stream-token` | Generate Stream JWT tokens |

### Components

| Component | Purpose |
|-----------|---------|
| `StreamVideoCallManager` | New video manager using Stream SDK |
| `VideoCallManager` | Old mesh WebRTC (deprecated) |
| `VideoTile` | Works with both (no changes needed) |
| `ParticipantGrid` | Works with both (no changes needed) |

## Testing

### Test Plan

1. **Single Participant (Local Video)**
   - Join meeting alone
   - Verify local video appears
   - Toggle audio/video
   - Check mute indicators

2. **Two Participants**
   - User A joins
   - User B joins
   - Verify bidirectional audio/video
   - Toggle audio/video on both sides
   - Verify mute indicators sync

3. **Three+ Participants (The Real Test!)**
   - User A joins
   - User B joins
   - User C joins
   - **This should work now!** (Previously failed)
   - Verify all participants see each other
   - Toggle audio/video on all sides

4. **Join/Leave During Call**
   - Participant joins mid-call
   - Participant leaves mid-call
   - Verify UI updates correctly

### Testing Locally

```bash
# Start the dev server
npm run dev

# Open http://localhost:3000/meetings/[code]
# Open in multiple browser tabs/windows (use incognito for different users)
# Test the scenarios above
```

## Migration Checklist

### Phase 1: Setup & Authentication ✅
- [x] Install Stream SDK dependencies
- [x] Add Stream environment variables
- [x] Create VideoServiceInterface abstraction
- [x] Implement StreamVideoService
- [x] Create VideoServiceFactory
- [x] Add stream-token API endpoint

### Phase 2: Core Video Calling ✅
- [x] Create StreamVideoCallManager component
- [x] Export from components/meeting/index.ts
- [x] Verify VideoTile compatibility

### Phase 3: Integration & Testing (NEXT)
- [ ] Update meeting page to use StreamVideoCallManager
- [ ] Test 1 participant (local video)
- [ ] Test 2 participants (bidirectional)
- [ ] Test 3-4 participants (mesh limit broken!)
- [ ] Verify audio/video toggles
- [ ] Test join/leave during call

### Phase 4: Cleanup (LATER)
- [ ] Remove old VideoCallManager (after testing)
- [ ] Remove WebRTCService.ts
- [ ] Remove SignalingService.ts
- [ ] Remove config.ts (old)
- [ ] Remove simple-peer dependency
- [ ] Update documentation

## Rollback Plan

If you need to rollback to mesh WebRTC:

1. **Quick Rollback:**
   ```tsx
   // Change back to VideoCallManager
   import { VideoCallManager } from '@/components/meeting';
   ```

2. **Full Rollback:**
   ```bash
   git checkout main -- apps/web/src/components/meeting/VideoCallManager.tsx
   git checkout main -- apps/web/src/services/webrtc/
   ```

## Future: Switching Providers

The abstraction layer makes switching to LiveKit easy:

1. **Change env var:**
   ```env
   NEXT_PUBLIC_VIDEO_PROVIDER=livekit
   ```

2. **Implement LiveKitVideoService** (1-2 days):
   - Copy StreamVideoService.ts structure
   - Replace Stream SDK calls with LiveKit SDK
   - Same VideoServiceInterface methods

3. **Done!** Components don't need changes.

## Cost Analysis

### Stream Pricing
- **Free Tier:** 33,000 minutes/month
- **Paid Tier:** $0.004/minute after free tier

### Projected Costs
- **200 users:** 24,000 min/month → **$0** (free tier)
- **500 users:** 60,000 min/month → **$108/month**
- **1,000 users:** 120,000 min/month → **$348/month**

### Revenue vs Cost (1,000 users)
- **Revenue:** $10-15/user = $10,000-15,000/month
- **Stream Cost:** $348/month
- **Profit Margin:** 97.1% 💰

## Troubleshooting

### Token Generation Fails
```
Error: Failed to get Stream token: 401 Unauthorized
```

**Solution:**
- Verify Stream API keys in `.env.local`
- Check you're logged in with Clerk
- Ensure participant record exists in database

### Video Not Appearing
```
Error: Call not initialized
```

**Solution:**
- Check browser console for errors
- Verify camera/microphone permissions
- Check Stream dashboard for usage limits

### 3+ Participants Still Failing
```
Error: Connection failed
```

**Solution:**
- This shouldn't happen with Stream SFU!
- Check Stream dashboard for errors
- Verify all participants got tokens
- Check network connectivity

## Support

- **Stream Docs:** https://getstream.io/video/docs/
- **Stream Dashboard:** https://dashboard.getstream.io
- **GitHub Issues:** Report bugs in the project repo

## Next Steps

1. **Test the implementation** with multiple participants
2. **Update meeting page** to use StreamVideoCallManager
3. **Monitor Stream usage** in dashboard
4. **Report any issues** for fixing
5. **Remove old WebRTC code** after successful testing

---

**Migration Status:** Phase 2 Complete ✅

**Ready for Testing!** 🚀
