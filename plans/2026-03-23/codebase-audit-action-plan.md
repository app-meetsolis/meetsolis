# Codebase Audit — Issue Categorization & Action Plan

## Context
MeetSolis pivoted from a video conferencing platform (v1) to an executive coaching intelligence tool (v3). The codebase still contains ~100+ legacy meeting/video files that are completely orphaned — no current UI links to them, no current code imports from them. This audit categorized all 30 issues found and recommends actions.

---

## PART A: Legacy Meeting/Video Issues (CAN BE DELETED)

These issues exist only in old video conferencing code. **Recommendation: Delete all legacy files in one cleanup PR.** No current code depends on them.

| # | Issue | Legacy File(s) |
|---|-------|---------------|
| 1 | Host role privilege escalation | `api/meetings/[id]/join/route.ts` |
| 2 | Missing `await auth()` (mute routes) | `api/meetings/[id]/participants/mute/route.ts`, `mute-all/route.ts` |
| 6 | File upload path traversal | `api/meetings/[id]/files/upload/route.ts` |
| 11 | Files >500 lines | `StreamVideoCallManagerV2.tsx` (974), `StreamVideoService.ts` (607), `DeviceTestWizard.tsx` (554) |
| 13 | Direct fetch() bypassing services | `hooks/meeting/useChat.ts`, `useWaitingRoom.ts`, `useParticipantControls.ts`, `useMeeting.ts`, etc. |
| 15 | react-toastify usage | `hooks/useMeetings.ts` |
| 16 | Module-level Supabase singleton | `api/meetings/[id]/leave/`, `mute-all/`, `mute/`, `me/state/` |
| 17 | admitAll silent failure | `hooks/meeting/useWaitingRoom.ts` |
| 18 | AudioContext leak | `hooks/meeting/useAudioControls.ts` |
| 19 | useAudioLevel stale closure | `components/meeting/useAudioLevel.ts` |
| 30 | 35+ console.log statements | `StreamVideoCallManagerV2.tsx`, `MeetingRoomClient.tsx`, `StreamVideoService.ts` |

### Files/directories to delete:
```
apps/web/src/app/meeting/                          # meeting room pages
apps/web/src/app/api/meetings/                     # ~30 API route files
apps/web/src/hooks/meeting/                        # 11 hooks + 9 tests
apps/web/src/hooks/useMeeting.ts
apps/web/src/hooks/useMeetingRealtime.ts
apps/web/src/hooks/useMeetings.ts
apps/web/src/hooks/useMediaStream.ts
apps/web/src/hooks/useConnectionQuality.ts
apps/web/src/hooks/useReconnection.ts
apps/web/src/hooks/useLayoutConfig.ts              # dead import, unused
apps/web/src/components/meeting/                   # 25+ components + 15 tests
apps/web/src/components/dashboard/CreateMeetingButton.tsx
apps/web/src/components/dashboard/MeetingHistory.tsx
apps/web/src/services/meetings.ts
apps/web/src/services/video/                       # 5 files
apps/web/src/contexts/MeetingContext.tsx
apps/web/src/lib/stream/                           # Stream.io SDK wrappers
apps/web/src/types/layout.ts                       # meeting layout types
packages/shared/types/meeting.ts
packages/shared/types/webrtc.ts
packages/shared/types/realtime.ts
```

Also remove from `package.json`:
- `simple-peer`, `@types/simple-peer` — WebRTC, unused
- `webrtc-adapter` — WebRTC, unused
- `react-toastify` — only used in legacy `useMeetings.ts`
- `@react-three/fiber`, `three`, `@types/three` — only used by dead `Silk.tsx` component
- `twilio` — unused

---

## PART B: Current Platform Issues (NEED FIXING)

### CRITICAL — Security (fix immediately)

**3. Unauthenticated `/api/users/[id]/clerk-id`**
- Exposes Clerk IDs to anonymous callers
- **Fix:** Add `auth()` check, or delete if unused by current code

**4. `/admin/*` routes fully public**
- No auth in middleware or layout
- **Fix:** Remove from `publicRoutes` in middleware, add auth check

**10. Middleware misses `/clients`, `/intelligence`, `/settings`**
- These v3 dashboard routes aren't in `isProtectedRoute` check
- Clerk's default behavior may protect them, but onboarding enforcement is skipped
- **Fix:** Add these paths to `isProtectedRoute` regex

**2 (partial). Missing `await auth()` in `onboarding/status/route.ts`**
- Lines 69, 147 — `auth()` called without await
- **Fix:** Add `await`

### HIGH — Security

**5. GDPR `deleteUserData()` is a complete no-op**
- Returns success but deletes nothing — compliance risk
- **Fix:** Implement actual deletion or return 501 Not Implemented

**7. Session upload doesn't sanitize filename**
- `api/sessions/route.ts:171` — `file.name` used directly in storage path
- `sanitizeFileName()` exists at `lib/security/sanitization.ts:180` but isn't called
- **Fix:** Call `sanitizeFileName(file.name)` before building path

**8. Onboarding bypass via cookie**
- `middleware.ts:63-66` — client-supplied cookie trusted without DB check
- **Fix:** Remove cookie check or verify against DB

**9. Health endpoints leak config to unauthenticated callers**
- Expose service names, circuit-breaker states, DB errors
- **Fix:** Either add auth, or strip sensitive details from responses

**26. v3 RLS policies use `USING (true)` — no row-level access control**
- `sessions`, `action_items`, `solis_queries`, `usage_tracking`, `subscriptions`
- Service role key bypasses RLS anyway, but this is a defense-in-depth gap
- **Fix:** Add `USING (auth.uid() = user_id)` policies

**27. Debug/test routes still active in production**
- `api/debug/me`, `api/test-client`, `api/test-setup`, `test-api/diagnostics`
- `test-sentry/page.tsx` literally says "DELETE THIS FILE BEFORE PRODUCTION DEPLOYMENT"
- **Fix:** Delete all debug/test routes and pages

### MEDIUM — Bugs

**20. Broken routes in `UserProfile.tsx`**
- Lines 94, 98 link to `/dashboard/settings` and `/dashboard/profile`
- Should be `/settings` and `/profile` (no `/dashboard/` prefix due to route group)
- **Fix:** Remove `/dashboard` prefix from both links

**25. `sessions.user_id` FK may reference `auth.users` instead of `public.users`**
- Same pattern that was broken for `action_items` (fixed in migration 017)
- **Fix:** Create migration to explicitly set `REFERENCES public.users(id)` on `sessions`, `solis_queries`, `usage_tracking`, `subscriptions`

**21. `getInternalUserId` copy-pasted in 7 session/action-item route files**
- Shared version exists at `lib/helpers/user.ts` as `getUserByClerkId`
- **Fix:** Replace all 7 local copies with import from `lib/helpers/user.ts`

### MEDIUM — Code Quality

**12 (partial). `any` types in current code**
- `api/profile/route.ts:29,134`, `api/analytics/metrics/route.ts:74,102,106`
- `OnboardingIncompleteBanner.tsx:18,27,36,42`, `services/auth.ts:54,90,110,134`
- **Fix:** Replace with proper types

**14 (partial). Direct `process.env` in current code**
- `app/actions/waitlist.ts:41`, `lib/supabase/config.ts:9-11`, `middleware.ts:48`
- **Fix:** Route through config objects

**22. Two duplicate rate-limiting modules**
- `lib/rate-limit.ts` and `lib/security/rate-limiting.ts`
- Plus `onboarding/status` has a stub that always returns `true`
- **Fix:** Consolidate into one, wire into onboarding route

**23. Two duplicate Sentry modules**
- `lib/analytics/sentry.ts` and `lib/monitoring/sentry.ts`
- **Fix:** Keep one, delete the other

**24. Config inconsistency: `SUPABASE_ANON_KEY` vs `NEXT_PUBLIC_SUPABASE_ANON_KEY`**
- `lib/config/env.ts:13` reads wrong env var name (no `NEXT_PUBLIC_` prefix)
- **Fix:** Change to `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**29. No `error.tsx` in route segments**
- Only `global-error.tsx` exists
- Most important: add to `(dashboard)` and `clients/[id]/sessions/[sessionId]`

---

## PART C: Unresolved Questions — Recommendations

**Q1: `packages/shared/types/realtime.ts` and `webrtc.ts`?**
→ Delete them. Only imported by legacy code.

**Q2: Should `ServiceFactory` be removed?**
→ Keep AI/transcription factories. Delete unimplemented stubs that throw errors.

**Q3: `sessions.user_id` FK confirmed to resolve to `public.users`?**
→ Don't wait — create migration. Same fix as migration 017. Low risk, high safety.

**Q4: `react-toastify` in package.json?**
→ Yes. Delete with legacy cleanup.

---

## Execution Order

1. **PR 1 — Legacy cleanup** (removes ~100 files, resolves 14 of 30 issues)
2. **PR 2 — Critical security fixes** (issues 3, 4, 10, 2-partial)
3. **PR 3 — High security fixes** (issues 5, 7, 8, 9, 26, 27)
4. **PR 4 — Bug fixes** (issues 20, 25, 21)
5. **PR 5 — Code quality** (issues 12, 14, 22, 23, 24, 29)
