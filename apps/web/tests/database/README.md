# Database Tests

## Overview

The database test suite consists of **integration tests** that require a live Supabase database connection. These tests validate:

- Database connection and client initialization
- Row Level Security (RLS) policies
- Realtime subscriptions
- Clerk webhook user synchronization
- Database utility functions

## Test Types

### Integration Tests (Require Live Database)

All tests in this directory are integration tests that make actual HTTP calls to Supabase.

**Files:**

- `connection.test.ts` - Supabase client initialization
- `rls-policies.test.ts` - RLS policy enforcement
- `realtime.test.ts` - Realtime subscription patterns
- `user-sync.test.ts` - Clerk webhook database sync
- `utils.test.ts` - Database utility functions

## Running Tests

### Local Development with Real Database

Set up your `.env.local` with actual Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then run:

```bash
npm run test tests/database
```

### CI/CD Pipeline

For CI/CD, you have two options:

#### Option 1: Use Supabase Test Project

Create a dedicated test Supabase project and add credentials to CI environment variables.

#### Option 2: Skip Integration Tests in CI

Add to your CI configuration:

```bash
npm run test -- --testPathIgnorePatterns=tests/database
```

Or use environment variable:

```bash
export SKIP_INTEGRATION_TESTS=true
npm run test
```

## Test Database Setup

If using a test database, you need to:

1. **Run Migrations:**

   ```sql
   -- Execute all migration files in order:
   apps/web/migrations/001_create_schema.sql
   apps/web/migrations/002_enable_rls.sql
   apps/web/migrations/003_enable_realtime.sql
   ```

2. **Optional: Seed Test Data:**

   ```sql
   apps/web/seeds/001_test_users.sql
   apps/web/seeds/002_test_meetings.sql
   ```

3. **Configure RLS Bypass for Tests:**
   Tests use the `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS for admin operations.

## Test Data Cleanup

Integration tests create and clean up test data automatically:

- Each test suite uses unique identifiers (e.g., `test_clerk_sync_user`)
- `afterEach` hooks delete test data after each test
- Failed tests may leave orphaned data - manually clean if needed

## Troubleshooting

### Tests Fail with "getaddrinfo ENOTFOUND test.supabase.co"

This means tests are trying to connect to the mock URL. Ensure your `.env.local` has real Supabase credentials, or set them explicitly:

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
export SUPABASE_SERVICE_ROLE_KEY=your-key
npm run test tests/database
```

### Tests Fail with "Missing NEXT_PUBLIC_SUPABASE_URL"

The `tests/setup.ts` file should set default values. Verify that `jest.config.js` includes:

```javascript
setupFiles: ['<rootDir>/tests/setup.ts'],
```

### RLS Policy Tests Fail

RLS policy tests require:

1. RLS enabled on tables (migration 002)
2. Proper Clerk JWT simulation in tests
3. Test users created with clerk_id linkage

## Best Practices

1. **Isolation:** Each test should be independent
2. **Cleanup:** Always clean up test data in `afterEach`
3. **Unique IDs:** Use unique identifiers to avoid conflicts
4. **Service Role Key:** Use for setup/teardown, not for testing RLS enforcement
5. **Error Handling:** Tests should handle network failures gracefully

## Future Improvements

- [ ] Add mocked unit test versions for faster CI
- [ ] Implement test database reset script
- [ ] Add performance benchmarks for queries
- [ ] Create Docker Compose setup for local Supabase instance
- [ ] Add GitHub Actions workflow with Supabase test project
