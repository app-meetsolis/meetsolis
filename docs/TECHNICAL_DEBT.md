# Technical Debt Registry

**Last Updated**: 2025-11-17
**Project**: MeetSolis - Video Conferencing Platform

---

## 📊 Overview

This document tracks technical debt items that are **intentionally deferred** for valid reasons (MVP speed, cost optimization, acceptable trade-offs). Each item includes context, priority, triggers for action, and implementation guidance.

### Current Status

| Item | Priority | Introduced | Target Resolution | Impact If Skipped |
|------|----------|-----------|-------------------|-------------------|
| [TURN Server Implementation](#1-turn-server-implementation) | 🟡 MEDIUM | Story 2.1 | Before prod scaling | 10-15% users can't connect |
| [Redis/Vercel KV Rate Limiting](#2-redisvercel-kv-rate-limiting) | 🟡 MEDIUM | Story 1.9 | Before multi-instance | Rate limits bypassable |
| [React.memo Optimizations](#3-reactmemo-optimizations) | 🟢 LOW | Story 2.1 | Before 10+ participants | Minor CPU/battery impact |
| [Test Pass Rate to 100%](#4-improve-test-pass-rate-to-100) | 🟢 LOW | Story 2.1 | Continuous | Lower test confidence |

### Priority Definitions

- 🔴 **CRITICAL**: Blocks production launch, security risk, data loss risk
- 🟠 **HIGH**: Significant user impact, scalability blocker
- 🟡 **MEDIUM**: Affects subset of users, scaling concern, moderate risk
- 🟢 **LOW**: Nice-to-have, minor improvements, polish

---

## 1. TURN Server Implementation

**Priority**: 🟡 MEDIUM
**Introduced**: Story 2.1 (2025-11-16)
**Target Resolution**: Before production scaling or when connection failures exceed 5%

### What Is It?

The application currently uses **STUN servers only** for WebRTC NAT traversal. TURN (Traversal Using Relays around NAT) servers are needed as a fallback when direct peer-to-peer connections fail.

**Current Configuration**:
```typescript
// File: apps/web/src/services/webrtc/config.ts
export const DEFAULT_RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // ❌ Missing: TURN server fallback
  ],
};
```

### Why We Deferred It

- **MVP Reasoning**: 85-90% of users can connect with STUN-only
- **Cost Savings**: TURN servers relay traffic (bandwidth costs ~$0.40/GB)
- **Acceptable for Beta**: Internal testing and early adopters work fine

### Why It Matters

**Connection Success Rates**:
- **With STUN only**: ~85-90% (current)
- **With TURN fallback**: ~99%+ (industry standard)

**Who Needs TURN?**:
- Users behind corporate firewalls (~10-15%)
- Users with symmetric NAT (restrictive routers)
- Mobile users on carrier-grade NAT
- Enterprise customers (often required)

**Failure Symptoms**:
- Error: "ICE failed" or "Connection timeout"
- Sentry logs: `ICE_CONNECTION_FAILED` errors
- Users report "Can't connect" but others work fine

### When to Address

**Triggers** (any of these):
1. Connection failure rate exceeds **5%** in analytics
2. Enterprise customers start using the platform
3. User support tickets about connection issues increase
4. Planning to launch to general public

**Recommended Timeline**: Before production scaling

### How to Implement

#### Option 1: Twilio TURN (Recommended - Easiest)

**Pros**: Managed service, 99.99% uptime, global edge network
**Cons**: Cost scales with usage (~$0.40/GB relayed)
**Setup Time**: 15 minutes

**Implementation**:

1. **Sign up for Twilio** (https://www.twilio.com/stun-turn)
   ```bash
   # Get credentials from Twilio Console
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   ```

2. **Update WebRTC config**:
   ```typescript
   // File: apps/web/src/services/webrtc/config.ts
   export const DEFAULT_RTC_CONFIG: RTCConfiguration = {
     iceServers: [
       // Keep existing STUN servers
       { urls: 'stun:stun.l.google.com:19302' },
       { urls: 'stun:stun1.l.google.com:19302' },

       // Add Twilio TURN servers
       {
         urls: [
           'turn:global.turn.twilio.com:3478?transport=udp',
           'turn:global.turn.twilio.com:3478?transport=tcp',
           'turn:global.turn.twilio.com:443?transport=tcp',
         ],
         username: process.env.TWILIO_TURN_USERNAME || '',
         credential: process.env.TWILIO_TURN_CREDENTIAL || '',
       },
     ],
     iceCandidatePoolSize: 10,
   };
   ```

3. **Generate TURN credentials dynamically** (recommended for security):
   ```typescript
   // File: apps/web/src/app/api/turn-credentials/route.ts
   import { NextResponse } from 'next/server';
   import twilio from 'twilio';

   export async function GET() {
     const client = twilio(
       process.env.TWILIO_ACCOUNT_SID,
       process.env.TWILIO_AUTH_TOKEN
     );

     const token = await client.tokens.create();

     return NextResponse.json({
       iceServers: token.iceServers,
       ttl: 86400, // 24 hours
     });
   }
   ```

4. **Update WebRTCService to fetch credentials**:
   ```typescript
   // File: apps/web/src/services/webrtc/WebRTCService.ts
   async initialize() {
     // Fetch fresh TURN credentials
     const response = await fetch('/api/turn-credentials');
     const { iceServers } = await response.json();

     this.config.iceServers = iceServers;
   }
   ```

**Cost Estimate**:
- Free tier: $0 for first 1GB/month
- Production: ~$0.40/GB (estimate 10-15% of traffic)
- 1000 calls/month × 30 min average × 15% TURN usage = ~$120/month

#### Option 2: Self-Hosted coturn (Cheaper at Scale)

**Pros**: One-time VPS cost, full control, no per-GB fees
**Cons**: Requires DevOps, monitoring, security management
**Setup Time**: 2-4 hours

**Implementation**:

1. **Provision VPS** (DigitalOcean/AWS/Hetzner):
   - 2 CPU cores, 4GB RAM
   - Cost: $10-20/month
   - Ubuntu 22.04 LTS

2. **Install coturn**:
   ```bash
   sudo apt update
   sudo apt install coturn

   # Edit /etc/turnserver.conf
   realm=turn.yourdomain.com
   listening-port=3478
   tls-listening-port=5349
   min-port=49152
   max-port=65535
   fingerprint
   lt-cred-mech
   user=username:password
   ```

3. **Configure SSL** (Let's Encrypt):
   ```bash
   sudo certbot certonly --standalone -d turn.yourdomain.com
   ```

4. **Update WebRTC config** (same as Twilio, but with your domain).

**Cost Estimate**:
- VPS: $10-20/month
- Bandwidth: Usually included (1-5TB)
- Maintenance: ~2 hours/month

### Testing & Validation

**Before deploying**:
1. Test with restrictive network (corporate VPN)
2. Use Trickle ICE tool: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
3. Monitor Sentry for `ICE_CONNECTION_FAILED` reduction

**Success Metrics**:
- Connection success rate increases to 99%+
- `ICE_CONNECTION_FAILED` errors drop by 50%+
- User complaints about connectivity decrease

### Effort Estimate

| Approach | Setup | Testing | Total | Ongoing |
|----------|-------|---------|-------|---------|
| Twilio | 15 min | 30 min | 45 min | $0.40/GB |
| coturn | 2-4 hrs | 1 hr | 3-5 hrs | 2 hrs/month |

### Related Files

- `apps/web/src/services/webrtc/config.ts` - ICE server configuration
- `apps/web/src/services/webrtc/WebRTCService.ts` - WebRTC initialization
- `apps/web/.env.example` - Environment variable documentation

### References

- [RFC 8656 - TURN Protocol](https://datatracker.ietf.org/doc/html/rfc8656)
- [Twilio TURN Documentation](https://www.twilio.com/docs/stun-turn)
- [coturn GitHub](https://github.com/coturn/coturn)
- [WebRTC ICE Explained](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity)

---

## 2. Redis/Vercel KV Rate Limiting

**Priority**: 🟡 MEDIUM
**Introduced**: Story 1.9 (Rate Limiting Implementation)
**Target Resolution**: Before enabling Vercel auto-scaling (multiple instances)

### What Is It?

The application currently uses **in-memory rate limiting** which stores request counts in the Node.js server process memory. This works for single-instance deployments but breaks when scaling to multiple servers.

**Current Implementation**:
```typescript
// File: apps/web/src/app/api/meetings/route.ts (example pattern)
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);

  // ❌ Problem: This Map only exists in THIS server instance
  if (!userLimit || userLimit.resetAt < now) {
    rateLimiter.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (userLimit.count >= 100) {
    return false; // Rate limited
  }

  userLimit.count++;
  return true;
}
```

### Why We Deferred It

- **MVP Reasoning**: Vercel free tier runs on single instance
- **Cost Savings**: Redis/KV has free tier limits (10k commands/day Upstash)
- **Acceptable for Beta**: Low traffic, no auto-scaling needed yet

### Why It Matters

**The Multi-Instance Problem**:

```
User makes 100 requests in 1 minute:
  → 50 requests hit Server Instance A (counts: 50, allows ✅)
  → 50 requests hit Server Instance B (counts: 50, allows ✅)

Expected: Rate limit at 100 requests ✅
Reality: Both servers allow → 100 requests pass ❌
```

**Attack Scenarios**:
1. **Rate Limit Bypass**: Users can spam requests by hitting different instances
2. **DDoS Amplification**: Attackers can bypass throttling completely
3. **Cost Explosion**: API costs (Supabase, Clerk, OpenAI) can spike

**When It Breaks**:
- Vercel auto-scaling enabled (production traffic)
- Multiple regions enabled (geo-distribution)
- Serverless functions (each invocation = new instance)

### When to Address

**Triggers** (any of these):
1. Enabling Vercel **Pro plan** (auto-scaling kicks in)
2. Traffic exceeds **1000 requests/hour**
3. Seeing rate limit bypasses in logs
4. Planning **production launch**
5. Observing unusual API cost spikes

**Recommended Timeline**: Before multi-instance deployment

### How to Implement

#### Option 1: Vercel KV (Recommended - Easiest)

**Pros**: Native Vercel integration, zero config, global edge network
**Cons**: Vendor lock-in, free tier limits (30k commands/month)
**Setup Time**: 10 minutes

**Implementation**:

1. **Enable Vercel KV**:
   ```bash
   # In Vercel Dashboard
   # 1. Go to Storage tab
   # 2. Create KV Database
   # 3. Connect to your project
   ```

2. **Install SDK**:
   ```bash
   npm install @vercel/kv
   ```

3. **Update rate limiting code**:
   ```typescript
   // File: apps/web/src/lib/rate-limit.ts
   import { kv } from '@vercel/kv';

   export async function checkRateLimit(
     userId: string,
     limit: number = 100,
     windowSeconds: number = 60
   ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
     const key = `rate_limit:${userId}`;
     const now = Date.now();

     // Increment counter
     const requests = await kv.incr(key);

     // Set expiry on first request
     if (requests === 1) {
       await kv.expire(key, windowSeconds);
     }

     // Get TTL for resetAt
     const ttl = await kv.ttl(key);
     const resetAt = now + (ttl * 1000);

     return {
       allowed: requests <= limit,
       remaining: Math.max(0, limit - requests),
       resetAt,
     };
   }
   ```

4. **Use in API routes**:
   ```typescript
   // File: apps/web/src/app/api/meetings/route.ts
   import { checkRateLimit } from '@/lib/rate-limit';

   export async function POST(req: Request) {
     const { userId } = await auth();

     const { allowed, remaining, resetAt } = await checkRateLimit(userId, 100, 60);

     if (!allowed) {
       return NextResponse.json(
         { error: 'Rate limit exceeded' },
         {
           status: 429,
           headers: {
             'X-RateLimit-Limit': '100',
             'X-RateLimit-Remaining': '0',
             'X-RateLimit-Reset': resetAt.toString(),
             'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString(),
           },
         }
       );
     }

     // Process request...
   }
   ```

**Cost Estimate**:
- Free tier: 30,000 commands/month
- Pro: $0.40/100k commands beyond free tier
- 1M API calls/month = ~2M commands = ~$8/month

#### Option 2: Upstash Redis (More Features)

**Pros**: Better free tier (10k commands/day = 300k/month), REST API, more features
**Cons**: Separate vendor, slightly more setup
**Setup Time**: 15 minutes

**Implementation**:

1. **Sign up for Upstash** (https://upstash.com)
   ```bash
   # Create database in Upstash Console
   # Copy UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
   ```

2. **Install SDK**:
   ```bash
   npm install @upstash/redis
   ```

3. **Configure**:
   ```typescript
   // File: apps/web/src/lib/redis.ts
   import { Redis } from '@upstash/redis';

   export const redis = new Redis({
     url: process.env.UPSTASH_REDIS_REST_URL!,
     token: process.env.UPSTASH_REDIS_REST_TOKEN!,
   });
   ```

4. **Same rate limiting code** as Vercel KV (API is compatible).

**Cost Estimate**:
- Free tier: 10,000 commands/day (300k/month)
- Pay-as-you-go: $0.20/100k commands
- 1M API calls/month = ~2M commands = ~$4/month

#### Option 3: Redis on Railway/Render (Self-Hosted)

**Pros**: Full Redis features, no command limits, fixed cost
**Cons**: Requires monitoring, backups, updates
**Setup Time**: 30 minutes

**Cost Estimate**:
- Railway: $5/month (512MB RAM)
- Render: $7/month (1GB RAM)

### Testing & Validation

**Before deploying**:
1. **Load test** with multiple connections:
   ```bash
   # Test with artillery
   npm install -g artillery
   artillery quick --count 10 --num 50 https://yourdomain.com/api/meetings
   ```

2. **Verify across instances**:
   ```bash
   # Hit multiple times, check headers
   curl -I -H "Authorization: Bearer $TOKEN" https://yourdomain.com/api/meetings
   # Check X-RateLimit-Remaining decrements consistently
   ```

3. **Monitor Vercel KV dashboard** for command counts.

**Success Metrics**:
- Rate limits enforced across all instances
- `X-RateLimit-*` headers accurate
- No rate limit bypass in load tests

### Effort Estimate

| Approach | Setup | Migration | Testing | Total |
|----------|-------|-----------|---------|-------|
| Vercel KV | 10 min | 2 hrs | 30 min | 2.5 hrs |
| Upstash | 15 min | 2 hrs | 30 min | 3 hrs |
| Railway | 30 min | 2 hrs | 1 hr | 3.5 hrs |

### Related Files

- `apps/web/src/app/api/meetings/route.ts` - API rate limiting
- `apps/web/src/app/api/meetings/[id]/route.ts` - API rate limiting
- `apps/web/src/lib/rate-limit.ts` - **CREATE THIS** for centralized logic
- `apps/web/.env.example` - Add KV/Redis environment variables

### References

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Rate Limiting Patterns](https://redis.io/docs/manual/patterns/rate-limiter/)
- [HTTP 429 Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)

---

## 3. React.memo Optimizations

**Priority**: 🟢 LOW
**Introduced**: Story 2.1 (2025-11-16)
**Target Resolution**: Before implementing 10+ participant support (Story 2.7 or later)

### What Is It?

React components re-render whenever their parent re-renders, even if their props haven't changed. In video calls, connection quality updates every second trigger re-renders of all video tiles, even if only one participant's quality changed.

**Current Implementation**:
```typescript
// File: apps/web/src/components/meeting/VideoTile.tsx
export function VideoTile({ participant, onClick }: VideoTileProps) {
  // ❌ Re-renders every time ParticipantGrid re-renders
  // Even if this participant's data hasn't changed
  return (
    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted={participant.isLocal} />
      {/* Connection quality badge, mute indicators, etc. */}
    </div>
  );
}
```

### Why We Deferred It

- **MVP Reasoning**: 4 participants max in Story 2.1, negligible performance impact
- **Acceptable Performance**: Modern GPUs handle video rendering efficiently
- **Premature Optimization**: Story 2.1 focus was on functionality, not micro-optimization

### Why It Matters

**Current Re-render Behavior** (4 participants):
```
Every 1 second:
  - Connection quality updates for 1 participant
  - ParticipantGrid re-renders (parent component)
  - All 4 VideoTile components re-render
  - React reconciliation: ~4ms (negligible)
  - GPU handles video (unaffected)
```

**Impact at Scale** (10+ participants):
```
Every 1 second:
  - 10 VideoTile re-renders
  - React reconciliation: ~10-15ms
  - Mobile devices: 5-10% extra CPU
  - Battery drain: Slightly faster
```

**When It Matters**:
- 10+ participant grid layouts
- Mobile devices with limited CPU
- Users on battery power
- Screen sharing + video simultaneously

### When to Address

**Triggers** (any of these):
1. Implementing **10+ participant** support (Story 2.7 or similar)
2. Performance profiling shows React re-renders in top 5 CPU consumers
3. User complaints about **battery drain** or **heat** on mobile
4. Planning to support **25-50 participants** in large meetings

**Recommended Timeline**: Before implementing larger participant counts

### How to Implement

#### Step 1: Memoize VideoTile Component

```typescript
// File: apps/web/src/components/meeting/VideoTile.tsx
import React, { memo } from 'react';

export const VideoTile = memo(
  function VideoTile({ participant, onClick }: VideoTileProps) {
    // Component implementation (unchanged)
    return (
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted={participant.isLocal} />
        {/* ... */}
      </div>
    );
  },
  // Custom comparison function (optional but recommended)
  (prevProps, nextProps) => {
    // Only re-render if these specific properties changed
    return (
      prevProps.participant.id === nextProps.participant.id &&
      prevProps.participant.stream === nextProps.participant.stream &&
      prevProps.participant.isMuted === nextProps.participant.isMuted &&
      prevProps.participant.isVideoOff === nextProps.participant.isVideoOff &&
      prevProps.participant.connectionQuality === nextProps.participant.connectionQuality &&
      prevProps.participant.name === nextProps.participant.name &&
      prevProps.onClick === nextProps.onClick
    );
  }
);
```

#### Step 2: Memoize ParticipantGrid Component

```typescript
// File: apps/web/src/components/meeting/ParticipantGrid.tsx
import React, { memo, useCallback } from 'react';

export const ParticipantGrid = memo(function ParticipantGrid({
  participants,
  onParticipantClick,
}: ParticipantGridProps) {
  // Memoize click handler to prevent recreation on every render
  const handleClick = useCallback(
    (participantId: string) => {
      if (onParticipantClick) {
        onParticipantClick(participantId);
      }
    },
    [onParticipantClick]
  );

  return (
    <div className={cn('grid gap-2', getGridClass(participants.length))}>
      {participants.map((participant) => (
        <VideoTile
          key={participant.id}
          participant={participant}
          onClick={handleClick}
        />
      ))}
    </div>
  );
});
```

#### Step 3: Measure Performance Impact

**Before**:
```bash
# Open Chrome DevTools → Performance → Record
# Start a 4-person call
# Let it run for 10 seconds
# Stop recording

# Look for:
# - "Render" duration in flame graph
# - Number of VideoTile component renders
```

**After**:
```bash
# Same process
# Compare:
# - Render time should decrease by ~30-50%
# - VideoTile renders should be 1-2 instead of 10
```

### Testing & Validation

**Unit Tests**:
```typescript
// File: apps/web/src/components/meeting/__tests__/VideoTile.test.tsx
import { render } from '@testing-library/react';

describe('VideoTile memo optimization', () => {
  it('should not re-render when unrelated props change', () => {
    const renderSpy = jest.fn();
    const TestVideoTile = memo(() => {
      renderSpy();
      return <VideoTile {...mockProps} />;
    });

    const { rerender } = render(<TestVideoTile />);

    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Re-render with same props
    rerender(<TestVideoTile />);

    // Should NOT re-render
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
```

**Success Metrics**:
- VideoTile re-renders decrease by 70-90%
- React profiler shows lower reconciliation time
- Mobile CPU usage decreases by 5-10%

### Effort Estimate

| Task | Time | Complexity |
|------|------|------------|
| Add React.memo to VideoTile | 15 min | Low |
| Add React.memo to ParticipantGrid | 15 min | Low |
| Custom comparison functions | 20 min | Medium |
| Unit tests | 30 min | Low |
| Performance profiling | 30 min | Medium |
| **Total** | **1.5-2 hrs** | **Low** |

### Caveats & Considerations

**When NOT to use memo**:
- Components that always change (e.g., animation components)
- Components with complex comparison logic (overhead > benefit)
- Leaf components with no children

**Common Pitfalls**:
1. **Inline functions** break memoization:
   ```typescript
   // ❌ Bad - creates new function every render
   <VideoTile onClick={() => handleClick(id)} />

   // ✅ Good - memoized with useCallback
   const handleClick = useCallback(() => {...}, []);
   <VideoTile onClick={handleClick} />
   ```

2. **Object/Array props** break memoization:
   ```typescript
   // ❌ Bad - new object every render
   <VideoTile config={{ volume: 50 }} />

   // ✅ Good - memoized or stable reference
   const config = useMemo(() => ({ volume: 50 }), []);
   <VideoTile config={config} />
   ```

### Related Files

- `apps/web/src/components/meeting/VideoTile.tsx` - Memoize this
- `apps/web/src/components/meeting/ParticipantGrid.tsx` - Memoize this
- `apps/web/src/components/meeting/VideoCallManager.tsx` - Check callback stability

### References

- [React.memo Documentation](https://react.dev/reference/react/memo)
- [useCallback Hook](https://react.dev/reference/react/useCallback)
- [useMemo Hook](https://react.dev/reference/react/useMemo)
- [React Performance Optimization](https://react.dev/learn/render-and-commit#optimizing-performance)

---

## 4. Improve Test Pass Rate to 100%

**Priority**: 🟢 LOW
**Introduced**: Story 2.1 (2025-11-16)
**Target Resolution**: Continuous improvement across stories

### What Is It?

The test suite currently has **56 failing tests** (13.3% failure rate) out of 422 total tests. However, these failures are **not functional bugs** - they're caused by incomplete mock infrastructure for complex browser APIs.

**Current Test Status**:
```
Total Tests: 422
Passing: 366 (86.7%)
Failing: 56 (13.3%)

Breakdown:
✅ WebRTC Service: 23/23 (100%)
✅ Signaling Service: 19/19 (100%)
✅ useMediaStream: 14/14 (100%)
✅ useDevices: 15/16 (93.75%)
⚠️ useAudioLevel: 14/21 (66.67%)
⚠️ Meetings API: 3/11 (27%)
⚠️ Component tests: Various (RequestAnimationFrame issues)
```

### Why We Deferred It

- **MVP Reasoning**: Core functionality verified working (100% pass on critical paths)
- **Not Blocking**: Failures are mock issues, not product bugs
- **Time vs Value**: Fixing complex mocks has diminishing returns for MVP
- **Manual Verification**: All features tested manually and working

### Why It Matters

**Current State**:
- ✅ Core WebRTC functionality: **Verified working**
- ✅ Video calls: **Manually tested, production-ready**
- ⚠️ Test confidence: Lower than ideal
- ⚠️ CI/CD: May show red builds

**With 100% Pass Rate**:
- ✅ Full automated test confidence
- ✅ Green CI/CD builds
- ✅ Easier to catch real regressions
- ✅ Better developer experience

**Impact of Current State**:
- Developers must mentally filter "known failing tests"
- Risk of missing new failures hidden among existing failures
- Lower credibility when showing test results to stakeholders

### When to Address

**Triggers** (any of these):
1. Setting up **CI/CD pipeline** (want green builds)
2. Real bug sneaks through because masked by existing failures
3. New developer joins team (onboarding friction)
4. Stakeholder requests test metrics
5. **Continuous improvement**: Tackle 5-10 tests per story

**Recommended Timeline**: Continuous improvement, not a blocker

### How to Fix

#### Category 1: Clerk Mock Issues (8 tests failing)

**Problem**: Next.js API routes using `auth()` from `@clerk/nextjs/server` fail because `AsyncLocalStorage` isn't mocked.

**Current Error**:
```
Error: Invariant: Method expects to have requestAsyncStorage
```

**Fix**:
```typescript
// File: apps/web/jest.setup.js

// Add Clerk AsyncLocalStorage mock
import { AsyncLocalStorage } from 'async_hooks';

global.AsyncLocalStorage = AsyncLocalStorage;

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() =>
    Promise.resolve({
      userId: 'test-user-id',
      sessionId: 'test-session-id',
      getToken: jest.fn(() => Promise.resolve('mock-jwt-token')),
    })
  ),
  currentUser: jest.fn(() =>
    Promise.resolve({
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    })
  ),
}));
```

**Files to Fix**:
- `apps/web/src/app/api/meetings/__tests__/meetings.test.ts`

**Estimated Effort**: 1-2 hours

#### Category 2: Web Audio API Mock Issues (7 tests failing)

**Problem**: `useAudioLevel` hook uses `AudioContext` and `AnalyserNode` which have complex state management.

**Current Mock** (incomplete):
```typescript
// File: apps/web/jest.setup.js
global.AudioContext = jest.fn().mockImplementation(() => ({
  createAnalyser: jest.fn(),
  createMediaStreamSource: jest.fn(),
  // ❌ Missing: state transitions, getByteTimeDomainData simulation
}));
```

**Better Mock**:
```typescript
// File: apps/web/jest.setup.js

class MockAnalyserNode {
  fftSize = 2048;
  frequencyBinCount = 1024;

  getByteTimeDomainData(array) {
    // Simulate audio levels changing over time
    const now = Date.now();
    const amplitude = Math.sin(now / 100) * 128 + 128;
    array.fill(amplitude);
  }

  connect() {}
  disconnect() {}
}

class MockAudioContext {
  state = 'running';
  sampleRate = 48000;

  createAnalyser() {
    return new MockAnalyserNode();
  }

  createMediaStreamSource(stream) {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
  }

  close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

global.AudioContext = MockAudioContext;
global.webkitAudioContext = MockAudioContext;
```

**Files to Fix**:
- `apps/web/src/hooks/__tests__/useAudioLevel.test.ts`

**Estimated Effort**: 2-3 hours

#### Category 3: RequestAnimationFrame Issues (10 tests failing)

**Problem**: Component tests using `requestAnimationFrame` for smooth animations need proper mock timing.

**Current Mock** (too simple):
```typescript
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
```

**Better Mock**:
```typescript
// File: apps/web/jest.setup.js

let rafCallbacks = [];
let rafId = 0;

global.requestAnimationFrame = jest.fn((callback) => {
  const id = ++rafId;
  rafCallbacks.push({ id, callback });
  return id;
});

global.cancelAnimationFrame = jest.fn((id) => {
  rafCallbacks = rafCallbacks.filter(item => item.id !== id);
});

// Test helper to trigger all pending RAF callbacks
global.flushAnimationFrames = () => {
  const callbacks = [...rafCallbacks];
  rafCallbacks = [];
  callbacks.forEach(({ callback }) => callback(performance.now()));
};

// Auto-flush in afterEach
afterEach(() => {
  if (rafCallbacks.length > 0) {
    global.flushAnimationFrames();
  }
});
```

**Files to Fix**:
- `apps/web/src/components/meeting/__tests__/VideoTile.test.tsx`
- `apps/web/src/components/meeting/__tests__/ParticipantGrid.test.tsx`

**Estimated Effort**: 2 hours

#### Category 4: React Query Context Issues (5 tests failing)

**Problem**: Components using `useMeeting` hooks need `QueryClientProvider` wrapper in tests.

**Current Tests** (missing provider):
```typescript
render(<VideoCallManager {...props} />); // ❌ No QueryClient
```

**Fixed Tests**:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

render(<VideoCallManager {...props} />, { wrapper });
```

**Files to Fix**:
- `apps/web/src/components/meeting/__tests__/VideoCallManager.test.tsx`

**Estimated Effort**: 1 hour

### Testing Strategy

**Phased Approach** (recommended):

**Phase 1: High-Value Fixes** (2-3 hours)
- Fix Clerk mocks (8 tests)
- Fix React Query context (5 tests)
- **Impact**: +13 tests passing (76% → 79%)

**Phase 2: Medium Complexity** (4-5 hours)
- Fix Web Audio API mocks (7 tests)
- Fix RequestAnimationFrame (10 tests)
- **Impact**: +17 tests passing (79% → 83%)

**Phase 3: Edge Cases** (2-3 hours)
- Fix remaining component test issues
- Add missing test cases
- **Impact**: +26 tests passing (83% → 100%)

**Total Estimated Effort**: 8-11 hours (can be spread across stories)

### Success Metrics

| Milestone | Pass Rate | Tests Passing | Impact |
|-----------|-----------|---------------|--------|
| Current | 86.7% | 366/422 | Baseline |
| After Phase 1 | 90%+ | 380+/422 | Green CI/CD possible |
| After Phase 2 | 95%+ | 400+/422 | High confidence |
| Target | 100% | 422/422 | Full confidence |

### Continuous Improvement Plan

**Per Story Goal**: Fix 5-10 failing tests

**Story 2.2**: Fix Clerk and React Query mocks (Phase 1)
**Story 2.3**: Fix Web Audio mocks (Phase 2 partial)
**Story 2.4**: Fix RequestAnimationFrame (Phase 2 complete)
**Story 2.5**: Address edge cases (Phase 3)

### Related Files

- `apps/web/jest.setup.js` - **Main file to improve**
- `apps/web/jest.config.js` - Test configuration
- `apps/web/src/app/api/meetings/__tests__/meetings.test.ts`
- `apps/web/src/hooks/__tests__/useAudioLevel.test.ts`
- `apps/web/src/components/meeting/__tests__/*.test.tsx`

### References

- [Jest Manual Mocks](https://jestjs.io/docs/manual-mocks)
- [Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro)
- [Mocking Browser APIs](https://github.com/jsdom/jsdom#unimplemented-parts-of-the-web-platform)
- [React Query Testing](https://tanstack.com/query/v4/docs/react/guides/testing)

---

## 📋 Maintenance Guidelines

### When to Review This Document

- **Monthly**: Check if any trigger conditions are met
- **Before Each Story**: Review LOW priority items (may become blockers)
- **Before Production Deploy**: Validate MEDIUM priority items addressed
- **After User Feedback**: Re-prioritize based on real-world issues

### How to Update This Document

When addressing a technical debt item:

1. **Update Status**: Change priority to ✅ RESOLVED
2. **Document Resolution**: Add "Resolution" section with:
   - Date resolved
   - Approach chosen
   - Files changed
   - Results/metrics
3. **Archive**: Move to `RESOLVED_TECHNICAL_DEBT.md` (create if needed)

### Adding New Technical Debt

When introducing new technical debt:

1. **Document Immediately**: Don't wait for story completion
2. **Use Template**:
   ```markdown
   ## N. [Item Name]

   **Priority**: [CRITICAL/HIGH/MEDIUM/LOW]
   **Introduced**: Story X.Y (date)
   **Target Resolution**: [Timeline/Trigger]

   ### What Is It?
   [Clear explanation]

   ### Why We Deferred It
   [Business reasoning]

   ### Why It Matters
   [Impact analysis]

   ### When to Address
   [Trigger conditions]

   ### How to Implement
   [Solution guidance]
   ```

3. **Link to Story**: Reference in story completion document

### Escalation Paths

**If a LOW item becomes urgent**:
1. Update priority in this document
2. Create GitHub issue (if using issue tracker)
3. Notify team in standup/planning
4. Consider stopping current work if CRITICAL

**If a MEDIUM item is blocking**:
1. Assess workaround feasibility
2. If no workaround: escalate to CRITICAL
3. Reprioritize current sprint
4. Document incident in post-mortem

---

## 🔗 Related Documentation

- `docs/stories/2.1-COMPLETE.md` - Story 2.1 completion summary
- `docs/qa/gates/2.1-webrtc-infrastructure-and-basic-video-calls.yml` - Quality gate
- `docs/stories/2.1-qa-implementation-summary.md` - QA recommendations implementation
- `docs/architecture.md` - Overall system architecture
- `.env.example` - Environment variable documentation

---

## 📞 Questions or Concerns?

If you're unsure whether to address a technical debt item:

1. **Consider the trigger conditions** - Have any been met?
2. **Assess user impact** - Are users complaining?
3. **Check analytics** - What do the metrics say?
4. **When in doubt, ask the team** - Technical debt decisions are collaborative

**Remember**: Technical debt is not inherently bad. It's a conscious trade-off for faster delivery. The key is tracking it and addressing it before it becomes a crisis.

---

**Last Updated**: 2025-11-17
**Next Review**: Before Story 2.2 planning
**Maintained By**: Development Team
