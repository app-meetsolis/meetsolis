# Epic 1 Test Failure Fixes

**Purpose:** Document and fix existing test failures before v2.0 migration
**Status:** To be implemented
**Last Updated:** January 7, 2026

---

## Overview

Before establishing Epic 1 baseline, **3 known test failures** must be fixed. These failures are in Epic 1 test suite and will block migration if not resolved.

**Failure Summary:**

| # | File | Error | Priority | ETA |
|---|------|-------|----------|-----|
| 1 | `route.test.ts` (messages) | Mock initialization error | P0 | 30 min |
| 2 | `meetings.test.ts` | Request.json() not a function | P0 | 20 min |
| 3 | `meetings.test.ts` | Invalid URL error | P0 | 10 min |

**Total Fix Time:** ~1 hour

---

## Failure #1: Mock Initialization Error

### Error Details

**File:** `apps/web/src/app/api/meetings/[id]/messages/__tests__/route.test.ts`

**Error:**
```
ReferenceError: Cannot access 'supabase' before initialization
    at Object.<anonymous> (route.test.ts:15:10)
```

**Root Cause:**
`jest.mock()` calls placed AFTER imports, causing hoisting issues. Jest hoists mocks, but the import already executed.

**Code (Before Fix):**
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// ❌ Mock called AFTER import - too late!
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Messages API', () => {
  // Tests...
});
```

---

### Fix

**Move `jest.mock()` to TOP of file, before all imports:**

```typescript
// ✅ Mock called FIRST - before any imports
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: '123', content: 'test' },
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

// NOW imports work correctly
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

describe('Messages API', () => {
  it('should fetch messages', async () => {
    const request = new NextRequest('http://localhost:3000/api/meetings/123/messages');
    const response = await GET(request, { params: { id: '123' } });
    const data = await response.json();

    expect(data).toEqual([]);
  });
});
```

---

### Verification

```bash
# Run the specific test file
npm test -- apps/web/src/app/api/meetings/[id]/messages/__tests__/route.test.ts

# Expected output:
# PASS  apps/web/src/app/api/meetings/[id]/messages/__tests__/route.test.ts
#  Messages API
#    ✓ should fetch messages (45 ms)
#    ✓ should create message (32 ms)
```

---

## Failure #2: Request.json() Not a Function

### Error Details

**File:** `apps/web/src/app/api/meetings/__tests__/meetings.test.ts`

**Error:**
```
TypeError: request.json is not a function
    at POST (route.ts:25:30)
    at Object.<anonymous> (meetings.test.ts:42:18)
```

**Root Cause:**
Mock `NextRequest` object missing `json()` method. The actual `NextRequest` has this method, but our mock doesn't.

**Code (Before Fix):**
```typescript
it('should create meeting', async () => {
  const request = {
    method: 'POST',
    url: 'http://localhost:3000/api/meetings',
    // ❌ Missing json() method
  } as NextRequest;

  const response = await POST(request);
  // Throws: request.json is not a function
});
```

---

### Fix

**Add `json()` method to mock Request:**

```typescript
import { NextRequest, NextResponse } from 'next/server';

describe('Meetings API', () => {
  it('should create meeting', async () => {
    // ✅ Properly mock NextRequest with json() method
    const mockBody = {
      title: 'Test Meeting',
      scheduled_for: '2026-01-10T10:00:00Z',
    };

    const request = new NextRequest('http://localhost:3000/api/meetings', {
      method: 'POST',
      body: JSON.stringify(mockBody),
    });

    // Mock Supabase insert
    const mockInsert = jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({
          data: { id: 'meeting_123', ...mockBody },
          error: null,
        })),
      })),
    }));

    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn(() => ({
        insert: mockInsert,
      })),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.id).toBe('meeting_123');
    expect(data.title).toBe('Test Meeting');
  });
});
```

---

### Alternative Fix (If Using Custom Mock)

```typescript
// If you're creating custom mock (not using NextRequest constructor)
const mockRequest = {
  method: 'POST',
  url: 'http://localhost:3000/api/meetings',
  // ✅ Add json() method
  json: jest.fn().mockResolvedValue({
    title: 'Test Meeting',
    scheduled_for: '2026-01-10T10:00:00Z',
  }),
  headers: new Headers(),
} as unknown as NextRequest;
```

---

### Verification

```bash
# Run the specific test
npm test -- apps/web/src/app/api/meetings/__tests__/meetings.test.ts

# Expected output:
# PASS  apps/web/src/app/api/meetings/__tests__/meetings.test.ts
#  Meetings API
#    ✓ should create meeting (38 ms)
```

---

## Failure #3: Invalid URL Error

### Error Details

**File:** `apps/web/src/app/api/meetings/__tests__/meetings.test.ts`

**Error:**
```
TypeError: Failed to parse URL from /api/meetings
    at new Request (node:internal/deps/undici/undici:11390:19)
    at new NextRequest (next/dist/server/web/spec-extension/request.js:28:9)
```

**Root Cause:**
`NextRequest` constructor requires **full URL** (with protocol + host), not relative path.

**Code (Before Fix):**
```typescript
it('should fetch meetings', async () => {
  // ❌ Relative path not allowed
  const request = new NextRequest('/api/meetings');

  const response = await GET(request);
  // Throws: Failed to parse URL
});
```

---

### Fix

**Use full URL with protocol and host:**

```typescript
describe('Meetings API', () => {
  it('should fetch meetings', async () => {
    // ✅ Full URL with http://localhost:3000
    const request = new NextRequest('http://localhost:3000/api/meetings', {
      method: 'GET',
    });

    // Mock Supabase query
    const mockSelect = jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [
            { id: 'meeting_1', title: 'Meeting 1' },
            { id: 'meeting_2', title: 'Meeting 2' },
          ],
          error: null,
        })),
      })),
    }));

    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn(() => ({
        select: mockSelect,
      })),
    });

    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveLength(2);
    expect(data[0].title).toBe('Meeting 1');
  });

  it('should handle query parameters', async () => {
    // ✅ Full URL with query params
    const request = new NextRequest(
      'http://localhost:3000/api/meetings?status=upcoming',
      { method: 'GET' }
    );

    const response = await GET(request);
    const data = await response.json();

    // Verify query param used in filter
    expect(data.every(m => m.status === 'upcoming')).toBe(true);
  });
});
```

---

### Best Practice: Test Helper

Create a helper to reduce boilerplate:

```typescript
// apps/web/tests/helpers/request.ts

import { NextRequest } from 'next/server';

export function createTestRequest(
  path: string,
  options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  }
): NextRequest {
  const url = `http://localhost:3000${path}`;

  const init: RequestInit = {
    method: options?.method || 'GET',
    headers: new Headers(options?.headers),
  };

  if (options?.body) {
    init.body = JSON.stringify(options.body);
  }

  return new NextRequest(url, init);
}
```

**Usage:**

```typescript
import { createTestRequest } from '@/tests/helpers/request';

it('should create meeting', async () => {
  // ✅ Clean and readable
  const request = createTestRequest('/api/meetings', {
    method: 'POST',
    body: { title: 'Test Meeting' },
  });

  const response = await POST(request);
  // ...
});
```

---

### Verification

```bash
# Run the test
npm test -- apps/web/src/app/api/meetings/__tests__/meetings.test.ts

# Expected output:
# PASS  apps/web/src/app/api/meetings/__tests__/meetings.test.ts
#  Meetings API
#    ✓ should fetch meetings (42 ms)
#    ✓ should handle query parameters (35 ms)
```

---

## Implementation Checklist

### Step 1: Fix Failure #1 (Mock Initialization)

- [ ] Open `apps/web/src/app/api/meetings/[id]/messages/__tests__/route.test.ts`
- [ ] Move `jest.mock()` calls to TOP of file (before imports)
- [ ] Run test: `npm test -- route.test.ts`
- [ ] Verify: All tests pass

### Step 2: Fix Failure #2 (Request.json())

- [ ] Open `apps/web/src/app/api/meetings/__tests__/meetings.test.ts`
- [ ] Update POST test to use `NextRequest` constructor with body
- [ ] OR add `json()` method to custom mock
- [ ] Run test: `npm test -- meetings.test.ts`
- [ ] Verify: POST test passes

### Step 3: Fix Failure #3 (Invalid URL)

- [ ] Same file: `apps/web/src/app/api/meetings/__tests__/meetings.test.ts`
- [ ] Replace all relative paths with full URLs (`http://localhost:3000/...`)
- [ ] Run test: `npm test -- meetings.test.ts`
- [ ] Verify: GET tests pass

### Step 4: Create Test Helper (Optional)

- [ ] Create `apps/web/tests/helpers/request.ts`
- [ ] Implement `createTestRequest()` helper
- [ ] Refactor tests to use helper (reduces duplication)
- [ ] Run all tests: `npm test`

### Step 5: Verify All Tests Pass

- [ ] Run full Epic 1 test suite:
  ```bash
  npm run test:integration -- --testPathPattern="tests/integration/(auth|database|rate-limiting|security)"
  ```
- [ ] Verify: 100% pass rate
- [ ] Document results in `test-results/test-fixes-verification.txt`

---

## After Fixes Applied

### Expected Test Results

```bash
$ npm run test:integration -- --testPathPattern="tests/integration"

PASS  apps/web/src/app/api/meetings/[id]/messages/__tests__/route.test.ts
  Messages API
    ✓ should fetch messages (45 ms)
    ✓ should create message (32 ms)

PASS  apps/web/src/app/api/meetings/__tests__/meetings.test.ts
  Meetings API
    ✓ should fetch meetings (42 ms)
    ✓ should handle query parameters (35 ms)
    ✓ should create meeting (38 ms)

Test Suites: 2 passed, 2 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        3.245 s
```

---

### Next Steps After Fixes

1. **Establish baseline:**
   ```bash
   bash scripts/testing/run-epic1-tests.sh baseline
   ```

2. **Verify baseline saved:**
   ```bash
   cat test-results/epic1-baseline-latest.json | jq '.numPassedTests'
   # Expected: 23 (all Epic 1 tests)
   ```

3. **Proceed with migration:**
   ```bash
   bash scripts/testing/pre-migration-checklist.sh
   ```

---

## Common Issues & Debugging

### Issue: Mock still not working after moving to top

**Symptom:**
```
Error: Cannot access 'X' before initialization
```

**Solution:**
- Ensure mock is ABOVE all imports (including relative imports)
- Check for circular dependencies
- Try `jest.mock()` with factory function:
  ```typescript
  jest.mock('@/lib/supabase/server', () => {
    return {
      createClient: jest.fn(() => ({ /* mock */ })),
    };
  });
  ```

---

### Issue: NextRequest constructor still failing

**Symptom:**
```
TypeError: Failed to construct 'NextRequest': 1 argument required, but only 0 present
```

**Solution:**
- Always pass URL as first argument
- Use full URL with protocol: `http://localhost:3000/api/...`
- If using `Request` instead of `NextRequest`, ensure proper instantiation

---

### Issue: Tests pass locally but fail in CI

**Symptom:**
- Tests pass on local machine
- Same tests fail in GitHub Actions / CI pipeline

**Possible Causes:**
1. **Environment variables missing in CI:**
   - Add to `.github/workflows/test.yml`
   - Use GitHub Secrets for sensitive vars

2. **Database not available in CI:**
   - Use Docker service for PostgreSQL
   - OR mock all database calls

3. **Timezone differences:**
   - Use UTC in tests
   - Mock `Date.now()` for consistency

---

## Appendix: Full Test File Templates

### Template: API Route Test

```typescript
// apps/web/src/app/api/example/__tests__/route.test.ts

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        data: [],
        error: null,
      })),
    })),
  })),
}));

import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { GET } from '../route';

describe('Example API', () => {
  it('should fetch data', async () => {
    const request = new NextRequest('http://localhost:3000/api/example');
    const response = await GET(request);
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
  });
});
```

---

**Document Status:** Ready for implementation
**Estimated Fix Time:** 1 hour
**Blocking:** Yes - must fix before migration baseline
