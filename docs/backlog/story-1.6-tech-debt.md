# Story 1.6 - Technical Debt from Story 1.5

**Source:** Story 1.5 QA Review (Quinn - Test Architect)
**Gate File:** `docs/qa/gates/1.5-basic-dashboard-with-meeting-management.yml`
**Priority:** Medium (should be addressed before Story 2.0)
**Total Estimated Effort:** 2.5 hours

---

## Overview

Story 1.5 was approved with a **CONCERNS** gate decision (Quality Score: 70/100). The implementation is production-ready, but contains coding standards violations and technical debt that should be addressed to maintain code quality.

**All items below are non-critical** - they are improvements for maintainability and adherence to coding standards.

## ✅ COMPLETION STATUS

**All technical debt items completed!**

- ✅ CODE-001: Centralized Environment Configuration - DONE
- ✅ CODE-001b: API Routes Refactoring - DONE
- ✅ CODE-002: User Lookup Helper Function - DONE
- ✅ TYPE-001: Error Type Interface - DONE
- ✅ TypeScript: No type errors
- ✅ ESLint: No warnings or errors
- ✅ Tests: 130 passed (2 pre-existing failures unrelated to refactoring)

**Completed Date:** October 5, 2025

---

## Technical Debt Items

### 1. Create Centralized Environment Configuration

**ID:** CODE-001
**Priority:** HIGH
**Effort:** 30 minutes
**Status:** ✅ DONE

**Problem:**
API routes directly access `process.env` which violates the coding standard: *"Access only through config objects, never process.env directly"*

**Current State:**
```typescript
// apps/web/src/app/api/meetings/route.ts:62-63, 154-155
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,  // ❌ Violates coding standard
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // ❌ Should use config object
);
```

**Required Action:**
Create centralized environment configuration module.

**Implementation:**
1. Create new file: `apps/web/src/lib/config/env.ts`
2. Define `EnvConfig` interface with all environment variables
3. Export validated `env` object
4. Add validation function to ensure required vars are present

**Code Template:**
```typescript
// apps/web/src/lib/config/env.ts
interface EnvConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  app: {
    url: string;
    env: 'development' | 'production' | 'test';
  };
  clerk: {
    secretKey: string;
    publishableKey: string;
    webhookSecret?: string;
  };
}

function validateEnv(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env: EnvConfig = {
  supabase: {
    url: validateEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: validateEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleKey: validateEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY),
  },
  app: {
    url: validateEnv('NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL),
    env: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  },
  clerk: {
    secretKey: validateEnv('CLERK_SECRET_KEY', process.env.CLERK_SECRET_KEY),
    publishableKey: validateEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET, // Optional in development
  },
};
```

**Files to Update:**
- `apps/web/src/app/api/meetings/route.ts`
- `apps/web/src/app/api/meetings/[id]/route.ts`
- `apps/web/src/app/api/webhooks/clerk/route.ts`
- Any other files accessing `process.env` directly

**Testing:**
- Run full test suite after refactoring
- Verify all environment variables load correctly
- Check error handling when env vars are missing

**Success Criteria:**
- ✅ No direct `process.env` access in application code (except in env.ts)
- ✅ All tests passing
- ✅ Application runs in dev/production
- ✅ Clear error messages when env vars missing

---

### 2. Refactor API Routes to Use Environment Config

**ID:** CODE-001b
**Priority:** HIGH (depends on CODE-001)
**Effort:** 1 hour
**Status:** ✅ DONE

**Problem:**
After creating centralized config, all API routes must be refactored to use it.

**Required Action:**
Replace all `process.env` access with imports from `@/lib/config/env`

**Before:**
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/meeting/${meetingId}`;
```

**After:**
```typescript
import { env } from '@/lib/config/env';

const supabase = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey
);

const inviteLink = `${env.app.url}/meeting/${meetingId}`;
```

**Files to Update:**
- `apps/web/src/app/api/meetings/route.ts` (lines 34, 62-63, 154-155)
- `apps/web/src/app/api/meetings/[id]/route.ts` (similar pattern)
- Any other API routes accessing environment variables

**Testing:**
- Verify GET /api/meetings returns 200
- Verify POST /api/meetings creates meeting successfully
- Verify invite links generated correctly
- Run full API route test suite

**Success Criteria:**
- ✅ All API routes use `env` config object
- ✅ No `process.env` access outside of env.ts
- ✅ All tests passing
- ✅ No functional regressions

---

### 3. Extract User Lookup Helper Function

**ID:** CODE-002
**Priority:** MEDIUM
**Effort:** 30 minutes
**Status:** ✅ DONE

**Problem:**
User lookup logic is duplicated in GET and POST handlers, violating DRY principle.

**Current Duplication:**
```typescript
// apps/web/src/app/api/meetings/route.ts:67-71
const { data: user } = await supabase
  .from('users')
  .select('id')
  .eq('clerk_id', userId)
  .single();

// apps/web/src/app/api/meetings/route.ts:159-163
const { data: user } = await supabase  // Same code repeated
  .from('users')
  .select('id')
  .eq('clerk_id', userId)
  .single();
```

**Required Action:**
Extract reusable helper function.

**Implementation:**
1. Create new file: `apps/web/src/lib/helpers/user.ts`
2. Define `getUserByClerkId()` function
3. Update API routes to use helper

**Code Template:**
```typescript
// apps/web/src/lib/helpers/user.ts
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get user's database ID from their Clerk ID
 * @param supabase - Supabase client instance
 * @param clerkId - User's Clerk authentication ID
 * @returns User database record with ID, or null if not found
 */
export async function getUserByClerkId(
  supabase: SupabaseClient,
  clerkId: string
): Promise<{ id: string } | null> {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  return data;
}
```

**Usage in API Routes:**
```typescript
import { getUserByClerkId } from '@/lib/helpers/user';

const user = await getUserByClerkId(supabase, userId);
if (!user) {
  return NextResponse.json(
    { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
    { status: 404 }
  );
}
```

**Files to Update:**
- `apps/web/src/app/api/meetings/route.ts` (2 occurrences)
- `apps/web/src/app/api/meetings/[id]/route.ts` (if similar pattern exists)

**Testing:**
- Create unit tests for `getUserByClerkId()` function
- Verify API routes still work correctly
- Test 404 response when user not found

**Success Criteria:**
- ✅ No duplicated user lookup logic
- ✅ Helper function has unit tests
- ✅ All API route tests passing
- ✅ Code more maintainable

---

### 4. Define Proper Error Type Interface

**ID:** TYPE-001
**Priority:** MEDIUM
**Effort:** 30 minutes
**Status:** ✅ DONE

**Problem:**
React Query hooks use `any` type for error handling, reducing type safety.

**Current State:**
```typescript
// apps/web/src/hooks/useMeetings.ts:55, 76, 95
onError: (error: any) => {  // ❌ Using 'any' type
  const message = error.response?.data?.error?.message || 'Failed to create meeting';
  toast.error(message);
}
```

**Required Action:**
Define proper error type interface for type-safe error handling.

**Implementation:**
1. Create new file: `packages/shared/src/types/errors.ts`
2. Define `ApiError` interface
3. Update hooks to use typed errors
4. Export from shared types package

**Code Template:**
```typescript
// packages/shared/src/types/errors.ts
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface ApiError extends Error {
  response?: {
    status: number;
    data: ApiErrorResponse;
  };
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
}
```

**Usage in Hooks:**
```typescript
import type { ApiError } from '@meetsolis/shared';
import { isApiError } from '@meetsolis/shared';

onError: (error: unknown) => {
  let message = 'Failed to create meeting';

  if (isApiError(error)) {
    message = error.response?.data?.error?.message || message;
  }

  toast.error(message);
}
```

**Files to Update:**
- `packages/shared/src/types/errors.ts` (new file)
- `packages/shared/src/types/index.ts` (export errors)
- `apps/web/src/hooks/useMeetings.ts` (all error handlers)
- Any other hooks with `any` typed errors

**Testing:**
- Verify error handling still works correctly
- Test error messages display properly
- Run TypeScript type checking

**Success Criteria:**
- ✅ No `any` types in error handling
- ✅ Type-safe error access
- ✅ Error handling functionality unchanged
- ✅ TypeScript compilation clean

---

## Implementation Plan

**Recommended Order:**
1. **CODE-001** - Create environment config (foundational)
2. **CODE-001b** - Refactor API routes to use config (depends on #1)
3. **CODE-002** - Extract user lookup helper (independent)
4. **TYPE-001** - Define error types (independent)

**Total Time:** ~2.5 hours

**Verification:**
After completing all items:
- ✅ Run full test suite: `npm test`
- ✅ Run TypeScript check: `npm run type-check`
- ✅ Run linter: `npm run lint`
- ✅ Manual testing of dashboard functionality
- ✅ Verify all acceptance criteria still pass

---

## References

- **Source Review:** Story 1.5 QA Results (lines 1568-2015)
- **Gate File:** `docs/qa/gates/1.5-basic-dashboard-with-meeting-management.yml`
- **Coding Standards:** `docs/architecture/coding-standards.md`

---

## Notes

**Why These Are Deferred:**
- None of these issues are critical for production
- All core functionality works correctly
- Deferring allows faster delivery of Story 1.5
- Addressing early in Story 1.6 establishes good patterns for future stories

**Risk Assessment:**
- **Production Risk:** LOW - Current implementation is stable
- **Technical Risk:** LOW - Refactorings are straightforward
- **Maintenance Risk:** MEDIUM - Debt will accumulate if not addressed

**Commitment:**
These items SHOULD be completed before Story 2.0 to maintain code quality and prevent debt accumulation.
