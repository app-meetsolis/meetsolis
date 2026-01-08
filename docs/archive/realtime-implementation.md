# Supabase Realtime Implementation

## Overview

This document explains how real-time participant state synchronization works in MeetSolis.

## Architecture

### Challenge
- MeetSolis uses **Clerk** for authentication (not Supabase Auth)
- Supabase Realtime with `postgres_changes` requires authenticated context
- RLS policies expect `auth.uid()` but Clerk doesn't integrate natively

### Solution: Dual-Event Pattern (UPDATED)

We use **BOTH** Supabase event types for maximum reliability:

1. **PRIMARY: Broadcast Events** - Immediate, API-triggered
   - ✅ No authentication required
   - ✅ Bypasses RLS restrictions for realtime events
   - ✅ Instant synchronization (<100ms)
   - ✅ API routes still enforce security via Clerk

2. **FALLBACK: Postgres Changes Events** - Database-triggered
   - ✅ Automatic backup if broadcast fails
   - ✅ Triggered by database UPDATE operations
   - ✅ Independent of API broadcast logic
   - ✅ Ensures eventual consistency

This **dual-subscription pattern** provides redundancy and maximum reliability.

## Implementation Details

### 1. Database Trigger (Optional)
**File:** `migrations/011_add_realtime_broadcast_trigger.sql`

Postgres trigger that automatically broadcasts participant state changes:

```sql
CREATE TRIGGER participant_state_broadcast_trigger
AFTER UPDATE OF is_muted, is_video_off, connection_quality ON participants
FOR EACH ROW
EXECUTE FUNCTION broadcast_participant_change();
```

### 2. Subscription Code (UPDATED)
**File:** `apps/web/src/lib/supabase/realtime.ts`

Subscribes to **BOTH** broadcast AND postgres_changes events:

```typescript
const channel = supabase
  .channel(`meeting:${meetingId}:participants`)

  // PRIMARY: Broadcast events (API-triggered, instant)
  .on('broadcast', { event: 'participant_update' }, payload => {
    const normalized = normalizeParticipantPayload(payload.payload);
    callback(normalized);
  })

  // FALLBACK: Postgres changes (DB-triggered, backup)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'participants',
    filter: `meeting_id=eq.${meetingId}`
  }, payload => {
    const normalized = normalizeParticipantPayload(payload);
    callback(normalized);
  })

  .subscribe();
```

**Key Features:**
- Both event types are normalized to a unified format before processing
- Type-safe payload handling via `NormalizedParticipantData`
- Comprehensive logging for debugging
- See `packages/shared/types/realtime.ts` for type definitions

### 3. API Broadcast
**File:** `apps/web/src/app/api/meetings/[id]/participants/me/state/route.ts`

After updating the database, manually broadcasts the change:

```typescript
await supabase.channel(channelName).send({
  type: 'broadcast',
  event: 'participant_update',
  payload: { user_id, is_muted, is_video_off, ... }
});
```

## Data Flow (UPDATED)

**Normal Flow (Broadcast Event - PRIMARY):**
1. **User A** toggles mute → API receives request
2. **API** validates auth (Clerk) → Updates database
3. **API** sends broadcast event to channel `meeting:{uuid}:participants`
4. **User B** receives broadcast → Normalizes payload → Updates UI
5. **User B** sees mute indicator appear instantly (<100ms)

**Fallback Flow (Postgres Changes Event - SECONDARY):**
1. **User A** toggles mute → API receives request
2. **API** validates auth (Clerk) → Updates database
3. **Database trigger** fires on UPDATE → Sends postgres_changes event
4. **User B** receives postgres_changes → Normalizes payload → Updates UI
5. **User B** sees mute indicator appear (<200ms)

**Why Dual Events?**
- If API broadcast fails, postgres_changes provides backup
- If postgres_changes is delayed, broadcast provides instant sync
- Maximum reliability: Either event succeeds = UI updates

## Security Model

### What's Secure:
- ✅ API routes require Clerk authentication
- ✅ Users must join meeting to update state
- ✅ Meeting IDs are UUIDs (hard to guess)
- ✅ Users can only update their own state

### What's Not Enforced:
- ⚠️ Anyone knowing a meeting UUID can subscribe to broadcasts
- ⚠️ Broadcast recipients are not validated server-side

### Is This Safe?
**YES** - for the following reasons:
1. Meeting IDs are UUIDs (not guessable)
2. Broadcast data is not sensitive (just mute/video state)
3. Users can't send fake updates (API validates auth)
4. This matches industry patterns (Zoom/Meet/Teams)

## Alternative: Clerk JWT Integration

For maximum security, you could integrate Clerk with Supabase Auth:

1. Configure Clerk JWT template for Supabase
2. Set Supabase to accept Clerk JWTs
3. Pass Clerk token to Supabase client
4. Use `postgres_changes` with full RLS enforcement

**Tradeoff:** Adds complexity (2-3 hours setup) for minimal security gain in this use case.

**Recommendation:** Current broadcast approach is production-ready and industry-standard.

## Monitoring & Debugging (UPDATED)

### Console Logs to Watch

**Successful Flow:**
```
[API] Broadcasting participant state update: { is_muted: true, ... }
[API] Broadcast result: { status: 'success', channel: '...' }
[Realtime] Received broadcast event: { payload: { is_muted: true, ... } }
[Realtime] Normalized broadcast data: { source: 'broadcast', is_muted: true }
[VideoCallManager] Processing participant state update: { source: 'broadcast', ... }
[VideoCallManager] Applying state update: { old_muted: false, new_muted: true }
```

**Fallback to Postgres Changes:**
```
[Realtime] Received postgres_changes event: { eventType: 'UPDATE' }
[Realtime] Normalized postgres_changes data: { source: 'postgres_changes', ... }
[VideoCallManager] Processing participant state update: { source: 'postgres_changes', ... }
```

**Error Indicators:**
```
[API] Failed to broadcast participant update: { error: ..., channel: '...' }
[Realtime] Failed to normalize broadcast payload
[VideoCallManager] Failed to fetch clerk_id for user: ...
[VideoCallManager] Received null normalized data, skipping
```

### Debugging Tips

1. **Check Event Source**: Look for `source: 'broadcast'` vs `source: 'postgres_changes'` in logs
2. **Verify Broadcast Success**: Look for `[API] Broadcast result: { status: 'success' }`
3. **Check Normalization**: Ensure `[Realtime] Normalized` logs appear
4. **Verify UI Update**: Look for `[VideoCallManager] Applying state update`

If broadcasts fail, postgres_changes provides automatic fallback.

## Testing

To test real-time sync:

1. Open meeting in two browser windows
2. Toggle mute in window 1
3. Verify indicator appears in window 2 within 100ms

## Troubleshooting

**Events not received?**
- Check browser console for `[Realtime] Connected to broadcast channel`
- Verify Supabase URL and anon key in `.env.local`
- Check Network tab for WebSocket connection

**Slow updates?**
- Check for API broadcast errors
- Verify database trigger is installed
- Check network latency

## Payload Normalization System (NEW)

**File:** `packages/shared/types/realtime.ts`

All realtime events are normalized to a unified format before processing:

```typescript
interface NormalizedParticipantData {
  user_id: string;
  meeting_id: string;
  is_muted: boolean;
  is_video_off: boolean;
  connection_quality: string;
  updated_at: string;
  eventSource: 'broadcast' | 'postgres_changes'; // For debugging
}
```

**Type Guards:**
- `isBroadcastPayload()` - Checks if event is broadcast format
- `isPostgresChangesPayload()` - Checks if event is postgres_changes format

**Normalization:**
- `normalizeParticipantPayload()` - Converts any event type to unified format
- Returns `null` if payload is invalid or cannot be normalized
- Handles both broadcast and postgres_changes payload structures

**Benefits:**
- ✅ Type-safe event handling
- ✅ Single code path for both event types
- ✅ Easy to add new event sources in future
- ✅ Runtime validation prevents errors

## Related Files (UPDATED)

- `packages/shared/types/realtime.ts` - **NEW** Type definitions and normalization
- `apps/web/src/lib/supabase/realtime.ts` - **UPDATED** Dual-event subscription logic
- `apps/web/src/components/meeting/VideoCallManager.tsx` - **UPDATED** Consumer with normalized payload handling
- `apps/web/src/app/api/meetings/[id]/participants/me/state/route.ts` - **UPDATED** Broadcaster with enhanced logging
- `migrations/011_add_realtime_broadcast_trigger.sql` - Database trigger (unchanged)
