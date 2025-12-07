# File Investigation Guide

**Created:** 2025-12-07
**Status:** Post-Deployment Investigation Required
**Related:** Story 2.2 WebRTC to Stream SDK Migration Cleanup

---

## Purpose

This document lists files that were identified during the Story 2.2 cleanup but require further investigation before deletion. These files are currently being kept to avoid breaking functionality, but they may become obsolete once we verify they are no longer needed.

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

**Document Status:** Active - In Use
**Last Updated:** 2025-12-07
**Next Review:** After Story 2.2 production deployment
