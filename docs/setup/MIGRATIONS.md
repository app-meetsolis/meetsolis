# Database Migrations Tracking

This document tracks the status of all database migrations for the MeetSolis project.

## Migration Status

| Migration | File | Date Applied | Applied By | Status | Notes |
|-----------|------|--------------|------------|--------|-------|
| 001 | `001_create_users_table.sql` | Unknown | Unknown | ✅ Applied | Initial users table creation |
| 002 | `002_*.sql` | Unknown | Unknown | ✅ Applied | (Details unknown) |
| 003 | `003_*.sql` | Unknown | Unknown | ✅ Applied | (Details unknown) |
| 004 | `004_add_onboarding_fields.sql` | Unknown | Unknown | ✅ Applied | Added `onboarding_completed`, `onboarding_completed_at` |
| 005 | `005_add_profile_fields.sql` | Unknown | Unknown | ✅ Applied | Added `display_name`, `title`, `bio`, `timezone` |
| 006 | `006_add_onboarding_last_step.sql` | 2025-11-13 | User | ✅ Applied | Added `onboarding_last_step` column (Story 1.9) |

## Verification Queries

### Check All Columns Exist
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY column_name;
```

### Verify Onboarding Columns
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name IN (
    'onboarding_completed',
    'onboarding_completed_at',
    'onboarding_last_step',
    'display_name',
    'title',
    'bio',
    'timezone'
  )
ORDER BY column_name;
```

**Expected Result:** 7 rows

## Migration Files Location

All migration files are located in:
```
apps/web/migrations/
```

## How to Apply a Migration

1. Open the migration `.sql` file from `apps/web/migrations/`
2. Copy the entire SQL content
3. Go to Supabase Dashboard → SQL Editor
4. Paste the SQL and click "Run"
5. Verify success in the Messages tab
6. Update this document with the application date

## Known Issues

### Migration 006 Original Issue (FIXED)
- **Issue:** PostgreSQL `CREATE POLICY IF NOT EXISTS` syntax error
- **Fix:** Wrapped policy creation in `DO $$ ... END $$` block with existence check
- **Date Fixed:** 2025-11-13

### Type Casting Issue (FIXED)
- **Issue:** `auth.uid() = clerk_id` type mismatch (uuid vs text)
- **Fix:** Cast to text: `auth.uid()::text = clerk_id`
- **Date Fixed:** 2025-11-13

## Current Database Schema Status

### Users Table Columns (as of 2025-11-13)

✅ **Core Identity Fields:**
- `id` (primary key)
- `clerk_id` (text, unique)
- `email` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

✅ **Profile Fields (Migration 005):**
- `display_name` (text)
- `title` (text)
- `bio` (text)
- `timezone` (varchar)

✅ **Onboarding Fields (Migrations 004 & 006):**
- `onboarding_completed` (boolean)
- `onboarding_completed_at` (timestamp)
- `onboarding_last_step` (varchar 50)

### Indexes
- `idx_users_onboarding_last_step` - Performance index for onboarding queries

### RLS Policies
- ✅ "Users can view own onboarding status" (SELECT)
- ✅ "Users can update own onboarding status" (UPDATE)

## Next Steps

- [ ] Future: Implement automated migration tracking table
- [ ] Future: Set up migration CI/CD pipeline
- [ ] Future: Consider using Supabase CLI for migration management

## Story Dependencies

- **Story 1.3 & 1.4:** Migrations 001-003 (User authentication & profiles)
- **Story 1.8:** Migration 004 (Onboarding completed tracking)
- **Story 1.9:** Migration 006 (Onboarding last step for resume tracking)
