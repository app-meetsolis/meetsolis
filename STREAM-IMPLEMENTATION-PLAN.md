# Stream SDK Implementation Plan

## Executive Summary

**Decision:** Replace mesh WebRTC with Stream SDK (SFU architecture)

**Why:**
- ✅ Solves 3+ participant failures (current mesh limitation: 2-4 max)
- ✅ Built-in recording & transcription
- ✅ Scales to 100+ participants
- ✅ Free tier: 33,000 minutes/month
- ✅ Abstraction layer enables future migration to LiveKit/self-hosted (1-2 days)

**Timeline:** 3-5 days

**Cost:** Free tier sufficient for MVP, $348/month at 1,000 users (97% profit margin)

---

## Current Issues (Mesh Topology)

❌ **Fails with 3+ participants** - Offer collision errors persist despite fixes (PRs #16-#20)
❌ **High bandwidth usage** - Each participant uploads N-1 streams
❌ **No recording/transcription** - Missing core features
❌ **Poor mobile performance** - Mobile devices struggle with multiple peer connections
❌ **Complex signaling** - Perfect Negotiation, offer collision handling, signal buffering

---

## Stream SDK Benefits (SFU Architecture)

✅ **Supports 100+ participants** - Server handles routing, no P2P complexity
✅ **1x upload bandwidth** - Participants send one stream to SFU
✅ **Built-in recording** - `call.startRecording()` with cloud storage
✅ **Built-in transcription** - Multi-language support
✅ **Automatic quality adaptation** - Stream optimizes based on network
✅ **Professional UI components** - Pre-built React components

---

## Architecture Overview

### New Architecture

```
VideoCallManager.tsx
         ↓
┌─────────────────────────────────────┐
│   ABSTRACTION LAYER (NEW)           │
│   VideoServiceInterface             │
│   - initialize()                    │
│   - joinCall() / leaveCall()        │
│   - toggleAudio() / toggleVideo()   │
│   - getParticipants()               │
├──────────────┬──────────────────────┤
│ StreamVideo  │  LiveKitVideoService │
│ Service      │  (future)            │
└──────────────┴──────────────────────┘
         ↓
    Stream SFU
```

**Key Point:** Abstraction layer allows switching from Stream to LiveKit with just env var change + 1-2 days implementation

### What Stays the Same

✅ **Database schema** - meetings, participants tables unchanged
✅ **Clerk authentication** - User auth flow identical
✅ **Supabase** - Still used for metadata, chat, presence
✅ **API routes** - join/leave/state endpoints preserved
✅ **UI components** - ParticipantGrid, VideoTile mostly unchanged

### What Changes

❌ **WebRTCService.ts** (825 lines) → StreamVideoService.ts (350 lines)
❌ **SignalingService.ts** (329 lines) → Stream handles internally
❌ **config.ts** (STUN/TURN) → Stream provides infrastructure

---

## Files to Create/Modify

### Files to DELETE (3 files)

```
D:\meetsolis\apps\web\src\services\webrtc\WebRTCService.ts
D:\meetsolis\apps\web\src\services\webrtc\SignalingService.ts
D:\meetsolis\apps\web\src\services\webrtc\config.ts
```

### Files to CREATE (8 files)

1. **`apps/web/src/services/video/VideoServiceInterface.ts`** (~120 lines)
   - Abstract interface for all video providers
   - Types: VideoParticipant, CallConfig, RecordingState

2. **`apps/web/src/services/video/StreamVideoService.ts`** (~350 lines)
   - Stream SDK wrapper implementing VideoServiceInterface
   - Event mapping, participant state management

3. **`apps/web/src/services/video/LiveKitVideoService.ts`** (~80 lines)
   - Stub for future migration (copy StreamVideoService structure)

4. **`apps/web/src/services/video/VideoServiceFactory.ts`** (~60 lines)
   - Provider selection via env var

5. **`apps/web/src/services/video/config.ts`** (~40 lines)
   - Stream SDK configuration

6. **`apps/web/src/app/api/meetings/[id]/stream-token/route.ts`** (~120 lines)
   - Server-side token generation
   - Validates Clerk JWT, generates Stream JWT

7. **`apps/web/src/lib/stream/client.ts`** (~50 lines)
   - Stream client initialization (server + client)

8. **`apps/web/src/lib/stream/utils.ts`** (~80 lines)
   - Helper functions for Stream SDK

### Files to MODIFY (8 files)

1. **`apps/web/src/components/meeting/VideoCallManager.tsx`** (~250 lines changed)
   - Replace WebRTC services with VideoServiceFactory
   - Update initialization flow
   - Remove Perfect Negotiation code

2. **`apps/web/src/components/meeting/VideoTile.tsx`** (~20 lines changed)
   - Handle Stream MediaStream (minor)

3. **`apps/web/src/components/meeting/ParticipantGrid.tsx`** (no changes)
   - Interface remains compatible

4. **`apps/web/src/hooks/useMediaStream.ts`** (~50 lines changed)
   - Adapt for Stream or use Stream's hooks

5. **`apps/web/src/app/api/meetings/[id]/join/route.ts`** (~30 lines added)
   - Create Stream user after participant creation

6. **`apps/web/src/app/api/meetings/[id]/leave/route.ts`** (~20 lines added)
   - Cleanup Stream resources

7. **`.env.local`** (3 lines added)
   - Stream API keys

8. **`package.json`** (2 dependencies)
   - Stream SDK packages

---

## Implementation Phases (3-5 Days)

### Phase 1: Setup & Authentication (Day 1, 4-6 hours)

**Goal:** Stream SDK installed, token generation working, abstraction defined

**Tasks:**

1. **Install dependencies:**
   ```bash
   npm install @stream-io/video-react-sdk @stream-io/video-react-bindings
   ```

2. **Create Stream account:**
   - Go to `dashboard.getstream.io`
   - Create new app
   - Note API key and secret

3. **Add environment variables to `.env.local`:**
   ```env
   STREAM_API_KEY=your_key_here
   STREAM_API_SECRET=your_secret_here
   NEXT_PUBLIC_STREAM_API_KEY=your_key_here
   NEXT_PUBLIC_VIDEO_PROVIDER=stream
   ```

4. **Create `lib/stream/client.ts`:**
   ```typescript
   import { StreamClient } from '@stream-io/node-sdk';
   import { StreamVideoClient } from '@stream-io/video-react-sdk';

   // Server-side client
   export const getStreamServerClient = () => {
     return new StreamClient(
       process.env.STREAM_API_KEY!,
       process.env.STREAM_API_SECRET!
     );
   };

   // Client-side initialization (called with token)
   export const createStreamVideoClient = (
     userId: string,
     userName: string,
     token: string
   ) => {
     return new StreamVideoClient({
       apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
       user: { id: userId, name: userName },
       token,
     });
   };
   ```

5. **Create token generation API:**
   - File: `apps/web/src/app/api/meetings/[id]/stream-token/route.ts`
   - Validate Clerk JWT
   - Query participant from database
   - Generate Stream JWT (1-hour expiry)
   - Return: `{ token, user_id, user_name, call_id, api_key }`

6. **Create abstraction layer:**
   - File: `services/video/VideoServiceInterface.ts`
   - Define all methods as abstract
   - Define types: VideoParticipant, CallConfig, VideoServiceEvents

**Acceptance Criteria:**
- ✅ Can request Stream token with Clerk JWT
- ✅ Token validates with Stream SDK
- ✅ VideoServiceInterface compiles

---

### Phase 2: Core Video Calling (Day 2-3, 12-16 hours)

**Goal:** 3+ participant calls working, audio/video toggles functional

**Tasks:**

1. **Implement `StreamVideoService.ts`:**
   - Wrap StreamVideoClient and Call
   - Map Stream events → VideoServiceInterface events
   - Implement all abstract methods
   - Handle participant state (muted, video off, quality)

2. **Create `VideoServiceFactory.ts`:**
   ```typescript
   export class VideoServiceFactory {
     static create(provider?: 'stream' | 'livekit') {
       const selected = provider ||
                        process.env.NEXT_PUBLIC_VIDEO_PROVIDER ||
                        'stream';

       switch (selected) {
         case 'stream':
           return new StreamVideoService();
         case 'livekit':
           return new LiveKitVideoService();
         default:
           throw new Error(`Unknown provider: ${selected}`);
       }
     }
   }
   ```

3. **Update `VideoCallManager.tsx`:**
   - Remove WebRTCService/SignalingService imports
   - Use VideoServiceFactory.create()
   - Update initialization flow:
     1. Join meeting (existing API)
     2. Get Stream token (new API)
     3. Initialize video service
     4. Join call
   - Remove Perfect Negotiation code
   - Remove signal buffering
   - Update participant state management

4. **Update `VideoTile.tsx`:**
   - Stream provides `participant.videoStream` or `participant.audioStream`
   - Update useEffect to attach MediaStream
   - Handle Stream track states

5. **Update `join/route.ts`:**
   - After creating participant, create Stream user:
     ```typescript
     await streamClient.upsertUsers([{
       id: clerkUserId,
       name: userName,
       role: 'user'
     }]);
     ```

**Testing:**
- 1 participant (local video)
- 2 participants (bidirectional)
- 3-4 participants (mesh limit broken!)
- Audio/video toggles
- Participant join/leave during call

**Acceptance Criteria:**
- ✅ 3+ participants see/hear each other
- ✅ Audio/video toggles work
- ✅ Mute states sync across participants
- ✅ No console errors
- ✅ Connection indicators accurate

---

### Phase 3: Recording & Transcription (Day 3-4, 6-8 hours)

**Goal:** Recording functional, integrated with summaries

**Tasks:**

1. **Create recording API routes:**
   - `POST /api/meetings/[id]/recording/start`
   - `POST /api/meetings/[id]/recording/stop`
   - `GET /api/meetings/[id]/recordings`

2. **Implement recording in StreamVideoService:**
   ```typescript
   async startRecording() {
     await this.call.startRecording();
   }

   async stopRecording() {
     await this.call.stopRecording();
   }

   isRecording() {
     return this.call?.state.recording || false;
   }
   ```

3. **Add recording UI:**
   - Record button (red dot when active)
   - Duration timer
   - Stop button (host only)
   - Recording indicator for all participants

4. **(Optional) Stream webhook:**
   - File: `api/webhooks/stream/route.ts`
   - Verify webhook signature
   - Download recording
   - Trigger AI summary
   - Store recording URL in database

**Acceptance Criteria:**
- ✅ Host can start/stop recording
- ✅ All participants see recording indicator
- ✅ Recordings accessible post-call

---

### Phase 4: Testing & Deployment (Day 4-5, 4-6 hours)

**Tasks:**

1. **Cross-browser testing:**
   - Chrome, Firefox, Safari
   - Edge (Windows)

2. **Mobile testing:**
   - iOS Safari
   - Android Chrome

3. **Network testing:**
   - Poor connection simulation
   - Network disruption recovery

4. **Load testing:**
   - 4-6 participants simultaneously

5. **Cleanup:**
   - Delete old WebRTC files
   - Remove `simple-peer` dependency
   - Update documentation
   - Remove debug logs

6. **Deployment:**
   - Merge to main
   - Deploy to Vercel
   - Verify production env vars
   - Monitor Stream dashboard

---

## Code Examples

### VideoServiceInterface (Abstraction Layer)

```typescript
// apps/web/src/services/video/VideoServiceInterface.ts

export interface VideoParticipant {
  id: string;                    // Clerk ID
  name: string;
  stream: MediaStream | null;
  isLocal: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
  isSpeaking?: boolean;
}

export interface CallConfig {
  meetingId: string;      // Meeting code
  userId: string;         // Clerk ID
  userName: string;
  audio?: boolean;
  video?: boolean;
  token?: string;         // Stream JWT
}

export interface VideoServiceEvents {
  onParticipantJoined?: (participant: VideoParticipant) => void;
  onParticipantLeft?: (participantId: string) => void;
  onStreamUpdate?: (participantId: string, stream: MediaStream) => void;
  onConnectionStateChange?: (state: 'connecting' | 'connected' | 'failed') => void;
  onError?: (error: Error) => void;
}

export abstract class VideoServiceInterface {
  abstract initialize(config: CallConfig): Promise<void>;
  abstract joinCall(): Promise<void>;
  abstract leaveCall(): Promise<void>;
  abstract toggleAudio(): Promise<void>;
  abstract toggleVideo(): Promise<void>;
  abstract getParticipants(): VideoParticipant[];
  abstract startRecording(): Promise<void>;
  abstract stopRecording(): Promise<void>;
  abstract isRecording(): boolean;
  abstract destroy(): void;

  protected events: VideoServiceEvents = {};

  on(events: VideoServiceEvents): void {
    this.events = { ...this.events, ...events };
  }
}
```

### StreamVideoService Implementation

```typescript
// apps/web/src/services/video/StreamVideoService.ts

import { StreamVideoClient, Call } from '@stream-io/video-react-sdk';
import { VideoServiceInterface, VideoParticipant, CallConfig } from './VideoServiceInterface';

export class StreamVideoService extends VideoServiceInterface {
  private client: StreamVideoClient | null = null;
  private call: Call | null = null;
  private participants: Map<string, VideoParticipant> = new Map();

  async initialize(config: CallConfig): Promise<void> {
    this.client = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      user: {
        id: config.userId,
        name: config.userName
      },
      token: config.token!,
    });

    this.call = this.client.call('default', config.meetingId);
    this.setupEventListeners();

    if (config.audio) await this.call.microphone.enable();
    if (config.video) await this.call.camera.enable();
  }

  async joinCall(): Promise<void> {
    if (!this.call) throw new Error('Call not initialized');
    await this.call.join({ create: true });
    this.events.onConnectionStateChange?.('connected');
  }

  async leaveCall(): Promise<void> {
    if (!this.call) return;
    await this.call.leave();
    this.events.onConnectionStateChange?.('closed');
  }

  async toggleAudio(): Promise<void> {
    if (!this.call) return;
    await this.call.microphone.toggle();
  }

  async toggleVideo(): Promise<void> {
    if (!this.call) return;
    await this.call.camera.toggle();
  }

  getParticipants(): VideoParticipant[] {
    return Array.from(this.participants.values());
  }

  async startRecording(): Promise<void> {
    if (!this.call) throw new Error('Call not initialized');
    await this.call.startRecording();
  }

  async stopRecording(): Promise<void> {
    if (!this.call) throw new Error('Call not initialized');
    await this.call.stopRecording();
  }

  isRecording(): boolean {
    return this.call?.state.recording || false;
  }

  destroy(): void {
    this.call?.leave().catch(console.error);
    this.client = null;
    this.call = null;
    this.participants.clear();
  }

  private setupEventListeners(): void {
    if (!this.call) return;

    // Subscribe to participant changes
    this.call.state.participants$.subscribe(participants => {
      participants.forEach(p => {
        const participant: VideoParticipant = {
          id: p.userId,
          name: p.name || p.userId,
          stream: p.videoStream || p.audioStream || null,
          isLocal: p.isLocalParticipant,
          isMuted: !p.publishedTracks.includes('audio'),
          isVideoOff: !p.publishedTracks.includes('video'),
          connectionQuality: this.mapQuality(p.connectionQuality),
          isSpeaking: p.isSpeaking,
        };

        const existing = this.participants.get(p.userId);
        this.participants.set(p.userId, participant);

        if (!existing) {
          this.events.onParticipantJoined?.(participant);
        } else if (existing.stream !== participant.stream) {
          this.events.onStreamUpdate?.(p.userId, participant.stream!);
        }
      });

      // Check for left participants
      const currentIds = new Set(participants.map(p => p.userId));
      this.participants.forEach((_, id) => {
        if (!currentIds.has(id)) {
          this.participants.delete(id);
          this.events.onParticipantLeft?.(id);
        }
      });
    });

    // Subscribe to connection state
    this.call.state.connection$.subscribe(state => {
      const mapped = state === 'connected' ? 'connected' :
                     state === 'connecting' ? 'connecting' : 'failed';
      this.events.onConnectionStateChange?.(mapped);
    });
  }

  private mapQuality(quality: string | undefined): 'excellent' | 'good' | 'poor' {
    if (!quality) return 'good';
    if (quality === 'excellent') return 'excellent';
    if (quality === 'poor') return 'poor';
    return 'good';
  }
}
```

### Stream Token Generation API

```typescript
// apps/web/src/app/api/meetings/[id]/stream-token/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getStreamServerClient } from '@/lib/stream/client';
import { getSupabaseClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Validate Clerk JWT
    const { userId: clerkUserId } = auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meetingCode = params.id;
    const supabase = getSupabaseClient();

    // 2. Query meeting
    const { data: meeting } = await supabase
      .from('meetings')
      .select('id, meeting_code')
      .eq('meeting_code', meetingCode)
      .single();

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // 3. Verify participant exists
    const { data: participant } = await supabase
      .from('participants')
      .select('*, users!inner(name, clerk_id)')
      .eq('meeting_id', meeting.id)
      .eq('users.clerk_id', clerkUserId)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 403 });
    }

    // 4. Generate Stream JWT (1-hour expiry)
    const streamClient = getStreamServerClient();
    const token = streamClient.generateUserToken({
      user_id: clerkUserId,
      validity_in_seconds: 3600,
    });

    // 5. Return token + metadata
    return NextResponse.json({
      token,
      user_id: clerkUserId,
      user_name: participant.users.name,
      call_id: meetingCode,
      api_key: process.env.NEXT_PUBLIC_STREAM_API_KEY,
    });

  } catch (error) {
    console.error('[stream-token] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Migration Checklist

### Pre-Migration
- [ ] Create Stream account at dashboard.getstream.io
- [ ] Note API key and secret
- [ ] Add Stream keys to `.env.local`
- [ ] Review pricing (33k free minutes)
- [ ] Create git backup: `git tag pre-stream-migration`

### Phase 1: Setup
- [ ] Install Stream SDK
- [ ] Create `lib/stream/client.ts`
- [ ] Create token generation API
- [ ] Test token generation
- [ ] Create VideoServiceInterface
- [ ] Create VideoServiceFactory

### Phase 2: Core Video
- [ ] Implement StreamVideoService
- [ ] Update VideoCallManager
- [ ] Remove WebRTC/Signaling services
- [ ] Update VideoTile
- [ ] Test 1-4 participants
- [ ] Verify audio/video toggles

### Phase 3: Recording
- [ ] Create recording API routes
- [ ] Implement recording in StreamVideoService
- [ ] Add recording UI
- [ ] Test recording

### Phase 4: Testing & Cleanup
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Delete old WebRTC files
- [ ] Remove simple-peer dependency
- [ ] Deploy to production

---

## Cost Analysis

### Free Tier: 33,000 minutes/month
- Current usage: ~24,000 min/month
- **Margin**: 37% buffer

### Paid Tier (if exceeded):
- **200 users**: 24,000 min/month → **$0** (free)
- **500 users**: 60,000 min/month → **$108/month**
- **1,000 users**: 120,000 min/month → **$348/month**

### Revenue vs Cost (1,000 users):
- **Revenue**: $10-15/user = $10,000-15,000/month
- **Stream cost**: $348/month
- **Profit margin**: 97.1%

---

## Vendor Lock-in Mitigation

**Risk:** Stream pricing increases or service issues

**Mitigation:**
1. **Abstraction layer** - VideoServiceInterface allows 1-2 day provider swap
2. **Supabase for metadata** - Only video routing uses Stream
3. **Usage monitoring** - Alert at 80% of free tier
4. **Budget cap** - Emergency threshold at $500/month
5. **Exit plan** - LiveKitVideoService ready for implementation

**Future Migration:**
1. Change `.env`: `NEXT_PUBLIC_VIDEO_PROVIDER=livekit`
2. Implement LiveKitVideoService (copy StreamVideoService pattern)
3. Test and deploy
4. **Total time: 1-2 days**

---

## Rollback Strategy

If migration fails:

```bash
# Immediate rollback
git reset --hard pre-stream-migration
git push --force origin main
```

- Database unchanged (no schema migrations)
- Old code in git history
- Time to rollback: 5 minutes

---

## Success Criteria

### Must Have (MVP):
- ✅ 3+ participants see/hear each other
- ✅ NO offer collision errors
- ✅ Audio/video toggles work
- ✅ Recording functional

### Should Have (Post-MVP):
- ✅ Transcription integration
- ✅ AI summary from recordings
- ✅ Adaptive quality

### Nice to Have (Future):
- ✅ Stream Chat integration
- ✅ Screen sharing
- ✅ Virtual backgrounds

---

## Next Steps

1. **Review this plan** with team
2. **Set up Stream account** and get API keys
3. **Start Phase 1** (Setup & Authentication)
4. **Test incrementally** after each phase
5. **Deploy after Phase 2** success

**This migration solves the root cause (mesh topology) and enables future scalability.**
