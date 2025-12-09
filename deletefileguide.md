# File Investigation Guide

**Created:** 2025-12-07
**Updated:** 2025-12-08
**Status:** ✅ DEFERRED - Moved to Future Cleanup Sprint
**Related:** Story 2.2 WebRTC to Stream SDK Migration Cleanup

---

## Purpose

This document lists files that were identified during the Story 2.2 cleanup but require further investigation before deletion. These files are currently being kept to avoid breaking functionality.

**Current Decision:** Cleanup tasks have been deferred to a future story/arc. Story 2.2 migration is complete and stable in production. These non-urgent cleanup tasks will be addressed in a dedicated cleanup sprint (Story 3.x or Arc 3).

---

## Cleanup Status

**Deployment Status:** ✅ Production deployment successful (2025-12-08)
**Monitoring Period:** Ongoing - No issues observed
**Cleanup Schedule:** Deferred to future sprint (no immediate action required)

**Why Deferred:**
- Migration to Stream SDK is complete and stable
- All critical functionality working in production
- Old code is not causing issues by remaining
- Focus prioritized on new features over cleanup
- Safe to remove after extended monitoring period

---

## Files Requiring Investigation

### 1. `apps/web/package.json` - simple-peer Dependency

**File:** `apps/web/package.json` (line 78)

**Current Status:**
- Dependency: `"simple-peer": "^9.11.1"`
- **NOT imported anywhere** in current codebase

**Investigation Required:**
- [ ] Run `npm run build` to verify build succeeds without it
- [ ] Search for any dynamic imports or runtime dependencies
- [ ] Check if any third-party libraries depend on it
- [ ] Verify no breaking changes in production

**Recommended Action:**
```bash
# Test removal locally
npm uninstall simple-peer
npm run build
npm run type-check
# If successful, commit the change
```

**Risk Level:** 🟡 LOW - Not imported, but verify build doesn't break

---

### 2. `apps/web/src/hooks/useConnectionQuality.ts`

**File:** `apps/web/src/hooks/useConnectionQuality.ts`

**Current Status:**
- Monitors `RTCPeerConnection.getStats()` for connection quality
- **NOT imported anywhere** in current codebase
- Specific to WebRTC P2P connections

**Investigation Required:**
- [ ] Verify Stream SDK provides its own connection quality monitoring
- [ ] Check if Stream SDK uses RTCPeerConnection internally
- [ ] Review if connection quality indicator is still needed in UI
- [ ] Test if deleting breaks any Stream SDK features

**Questions to Answer:**
1. Does Stream SDK expose connection quality metrics via hooks?
2. Do we need custom connection monitoring, or does Stream handle it?
3. Is the connection quality UI indicator still functional?

**Recommended Action:**
```bash
# Check Stream SDK documentation for connection quality
# Search Stream SDK hooks: useCallStateHooks for quality metrics
# If Stream provides this, delete the hook
# If not, keep it but adapt for Stream SDK usage
```

**Risk Level:** 🟡 MEDIUM - Not used, but connection quality is a feature

---

### 3. `packages/shared/types/webrtc.ts`

**File:** `packages/shared/types/webrtc.ts`

**Current Status:**
- Contains `ConnectionQuality` type - **ACTIVELY USED** by Stream components
- Contains other WebRTC-specific types that may be obsolete

**Investigation Required:**
- [ ] Identify which types are still in use
- [ ] Determine if types should be renamed (webrtc.ts → connection.ts)
- [ ] Remove unused WebRTC-specific types
- [ ] Keep only generic connection types

**Types in File:**
```typescript
export type ConnectionQuality = 'excellent' | 'good' | 'poor';  // ✅ IN USE
export type ConnectionState = ...;  // ❓ VERIFY
// Other WebRTC-specific types  // ❓ VERIFY
```

**Recommended Action:**
1. Read the file and list all exported types
2. Search codebase for usage of each type
3. Keep used types, remove unused types
4. Consider renaming file to `connection.ts` (more generic)

**Risk Level:** 🔴 HIGH - File is actively used, don't delete

---

### 4. `apps/web/migrations/007_add_webrtc_fields.sql`

**File:** `apps/web/migrations/007_add_webrtc_fields.sql`

**Current Status:**
- Adds database fields: `is_muted`, `is_video_off`, `connection_quality`
- These fields are **ACTIVELY USED** by Stream SDK implementation
- Field renames: `join_time`, `leave_time` - **ACTIVELY USED**

**Investigation Required:**
- [ ] Confirm all fields in migration are still used
- [ ] Verify no orphaned columns in database
- [ ] Check if migration name is misleading (contains "webrtc" but fields are generic)

**Recommended Action:**
- **KEEP THIS MIGRATION** - Fields are actively used
- Consider renaming migration file to reflect actual purpose
- No code changes needed, just documentation

**Risk Level:** 🔴 CRITICAL - Database schema, DO NOT DELETE

---

## Investigation Workflow

### After Production Deployment:

1. **Verify Production Stability**
   - [ ] Monitor Sentry for errors
   - [ ] Check connection quality indicators work
   - [ ] Verify participant state sync works
   - [ ] Test with multiple participants

2. **Run Investigations**
   - [ ] For each file above, follow "Investigation Required" steps
   - [ ] Test changes on feature branch first
   - [ ] Create PR for each cleanup change

3. **Update This Document**
   - [ ] Mark items as VERIFIED (safe to delete) or KEEP
   - [ ] Document reasons for decisions
   - [ ] Update risk levels based on findings

---

## Cleanup History

### Phase 1: Completed (2025-12-07)

**Deleted Files:**
- ✅ `apps/web/src/services/webrtc/` (entire directory)
  - WebRTCService.ts
  - SignalingService.ts
  - config.ts
  - index.ts
  - __tests__/ directory
- ✅ `apps/web/src/components/meeting/VideoCallManager.tsx`
- ✅ `apps/web/src/components/meeting/StreamVideoCallManager.tsx`
- ✅ `apps/web/src/components/meeting/ParticipantGrid.tsx`
- ✅ `apps/web/src/components/meeting/VideoTile.tsx`
- ✅ `apps/web/src/components/meeting/__tests__/VideoCallManager.test.tsx`
- ✅ `apps/web/src/components/meeting/__tests__/ParticipantGrid.test.tsx`
- ✅ `apps/web/src/components/meeting/__tests__/VideoTile.test.tsx`

**Updated Files:**
- ✅ `apps/web/src/components/meeting/index.ts` (removed obsolete exports)

**Status:** No build errors, type checks pass

---

### Phase 2: Pending Investigation (Post-Deployment)

**Files to Investigate:**
1. simple-peer npm dependency (apps/web/package.json)
2. useConnectionQuality hook (apps/web/src/hooks/)
3. webrtc.ts types file (packages/shared/types/)
4. 007_add_webrtc_fields.sql migration (documentation only)

**Status:** Awaiting production deployment and monitoring

---

## TypeScript Errors - ✅ RESOLVED

**Status:** ✅ ALL FIXED (2025-12-08)
**Original Count:** 13 errors identified (2025-12-07)
**Fixed Count:** 11 errors fixed
**Current Status:** 0 TypeScript errors - build passes cleanly

### Error Summary

All Stream SDK type definition errors have been resolved. The fixes were completed as part of PR #23.

**Commits:**
- `fix: Resolve all TypeScript build errors (11 errors fixed)`
- `fix: Replace TrackType imports with Stream SDK helper functions`

---

### Error Category 1: Stream SDK TrackType Issues (6 errors)

**Files Affected:**
- `src/components/meeting/StreamVideoTile.tsx` (lines 74, 79)
- `src/services/video/StreamVideoService.ts` (lines 543, 549, 584, 585)

**Error Type:**
```typescript
error TS2345: Argument of type '"audio"' is not assignable to parameter of type 'TrackType'.
error TS2345: Argument of type '"video"' is not assignable to parameter of type 'TrackType'.
```

**Root Cause:**
Stream SDK's `TrackType` enum expects specific enum values, but code is passing string literals `"audio"` and `"video"`.

**Investigation Required:**
- [ ] Check Stream SDK version - newer versions may have changed TrackType definition
- [ ] Review Stream SDK documentation for correct TrackType usage
- [ ] Check if TrackType is an enum or string union type
- [ ] Verify if `participant.publishedTracks.includes('audio')` needs type casting

**Recommended Fix:**
```typescript
// Option 1: Import and use enum
import { TrackType } from '@stream-io/video-react-sdk';
participant.publishedTracks?.includes(TrackType.AUDIO);

// Option 2: Type assertion
participant.publishedTracks?.includes('audio' as TrackType);

// Option 3: Check SDK docs for correct usage
```

**Risk Level:** 🟡 LOW - Type error only, functionality works in runtime

---

### Error Category 2: CallingState Enum Mismatch (2 errors)

**Files Affected:**
- `src/components/meeting/StreamVideoCallManagerV2.tsx` (lines 231, 232)

**Error Type:**
```typescript
error TS2367: This comparison appears to be unintentional because the types 'CallingState.JOINED' and '"joining"' have no overlap.
error TS2367: This comparison appears to be unintentional because the types 'CallingState.JOINED' and '"left"' have no overlap.
```

**Root Cause:**
Code is comparing `CallingState.JOINED` enum with string literals `"joining"` and `"left"`.

**Current Code (line 218-221):**
```typescript
{callingState === 'joined' && 'Connected to video call'}
{callingState === 'joining' && 'Joining video call...'}
{callingState === 'left' && 'Left video call'}
```

**Investigation Required:**
- [ ] Check if `callingState` returns enum or string
- [ ] Review `useCallCallingState()` return type
- [ ] Verify correct CallingState enum usage

**Recommended Fix:**
```typescript
import { CallingState } from '@stream-io/video-react-sdk';

{callingState === CallingState.JOINED && 'Connected to video call'}
{callingState === CallingState.JOINING && 'Joining video call...'}
{callingState === CallingState.LEFT && 'Left video call'}
```

**Risk Level:** 🟡 LOW - Comparison may never match, but doesn't break functionality

---

### Error Category 3: API Route Type Issues (2 errors)

**Files Affected:**
- `src/app/api/meetings/[id]/stream-token/route.ts` (lines 103, 133)

**Error Type:**
```typescript
error TS2339: Property 'name' does not exist on type '{ id: string; }'.
```

**Root Cause:**
Database query returns minimal user object with only `id` field, but code tries to access `name` property.

**Current Code:**
```typescript
const { data: user } = await supabase
  .from('users')
  .select('id')  // Only selecting 'id'
  .eq('clerk_id', userId)
  .single();

// Later trying to access:
user.name  // Error: 'name' doesn't exist
```

**Investigation Required:**
- [ ] Update SELECT query to include 'name' field
- [ ] Verify if 'name' is needed or can be removed
- [ ] Check if name is used in Stream SDK user creation

**Recommended Fix:**
```typescript
// Option 1: Add 'name' to SELECT
const { data: user } = await supabase
  .from('users')
  .select('id, name')  // Add name
  .eq('clerk_id', userId)
  .single();

// Option 2: Remove usage of user.name if not needed
```

**Risk Level:** 🟡 MEDIUM - May cause runtime error if name is accessed

---

### Error Category 4: Stream SDK UserRequest Type (1 error)

**Files Affected:**
- `src/lib/stream/client.ts` (line 105)

**Error Type:**
```typescript
error TS2353: Object literal may only specify known properties, and 'users' does not exist in type 'UserRequest[]'.
```

**Root Cause:**
Passing incorrect property name to Stream SDK user creation API.

**Investigation Required:**
- [ ] Check Stream SDK documentation for UserRequest interface
- [ ] Verify correct property name for batch user creation
- [ ] Review Stream SDK version compatibility

**Recommended Fix:**
```typescript
// Check Stream SDK docs for correct property name
// May need to be 'user_id' or different format
```

**Risk Level:** 🔴 HIGH - May prevent user creation in Stream SDK

---

### Error Category 5: Type Assignment Issues (2 errors)

**Files Affected:**
- `src/services/video/StreamVideoService.ts` (lines 167, 583)

**Error Type:**
```typescript
error TS2367: This comparison appears to be unintentional because the types 'boolean' and 'string' have no overlap.
error TS2322: Type 'boolean | undefined' is not assignable to type 'boolean'.
```

**Root Cause:**
Type mismatches in conditional logic and undefined handling.

**Investigation Required:**
- [ ] Review logic at line 167 - comparing boolean to string
- [ ] Add proper undefined checks or default values
- [ ] Review if optional chaining (?.) is needed

**Recommended Fix:**
```typescript
// Line 583: Handle undefined
const value: boolean = someValue ?? false;

// Line 167: Fix comparison logic
if (typeof value === 'string' && value === 'expected') {
  // ...
}
```

**Risk Level:** 🟡 MEDIUM - May cause unexpected behavior

---

## TypeScript Error Fix Plan

### Phase 1: Immediate (Post-Deployment)
1. **Verify errors don't affect production** - Monitor Sentry for runtime errors
2. **Create tracking issue** in GitHub for TypeScript error fixes
3. **Prioritize by risk level**:
   - 🔴 HIGH: Stream SDK UserRequest (line 105)
   - 🟡 MEDIUM: API route type issues, Type assignments
   - 🟡 LOW: TrackType, CallingState, comparison issues

### Phase 2: Fix Implementation (Separate PR)
1. **Branch:** `fix/typescript-errors-stream-sdk`
2. **Fix in order of priority** (HIGH → MEDIUM → LOW)
3. **Test each fix** with `npm run type-check`
4. **Verify no runtime regressions** with `npm run build`
5. **Test in preview deployment** before merging

### Phase 3: Documentation
1. **Update this document** with fix results
2. **Document any Stream SDK version upgrades** if needed
3. **Add type safety guidelines** to prevent future issues

---

## Next Steps

1. **Deploy Story 2.2 to production**
2. **Monitor for 24-48 hours**
3. **Run investigations** for files 1-4 above
4. **Create cleanup PR** for any files verified as safe to delete
5. **Update this document** with findings

---

## Contact

If you have questions about this cleanup:
- Review this document first
- Check Story 2.2 completion in `docs/stories/2.2.story.md`
- Review migration history in `STREAM-SDK-COMPLETE.md`

---

---

## Summary & Next Steps

### ✅ Completed Tasks
- All TypeScript errors fixed (11 errors)
- Stream SDK migration deployed to production
- Token generation working locally and in production
- Users can successfully join video meetings
- All builds passing in CI/CD

### ⏳ Deferred Cleanup Tasks
1. Remove `simple-peer` dependency (Risk: Low)
2. Delete `useConnectionQuality.ts` hook (Risk: Medium)
3. Clean up `webrtc.ts` types file (Risk: High - requires careful audit)
4. Database migration 007 - **KEEP** (fields actively used)

### 📅 When to Revisit
- **Recommended:** After Story 2.3 or 3.x completion
- **Minimum Wait:** 1-2 weeks of stable production usage
- **Trigger:** Dedicated cleanup sprint or low-priority backlog item

### 🎯 Action Required
**None** - Focus on next story/features. This cleanup is non-urgent.

---

**Document Status:** Reference - Deferred to Future Sprint
**Last Updated:** 2025-12-08
**Next Review:** Story 3.x or dedicated cleanup sprint
