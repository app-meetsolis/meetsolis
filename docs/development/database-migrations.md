# Database Migrations Guide

## Overview

This guide explains how to manage database schema changes using Supabase migrations for the MeetSolis project.

## Migration Philosophy

- **Version Control**: All schema changes are tracked in migration files
- **Immutable**: Never edit existing migration files - create new ones
- **Sequential**: Migrations run in numeric order (001, 002, 003...)
- **Idempotent**: Migrations can be re-run safely (use IF NOT EXISTS)

## Migration Files

### Current Migrations

| File | Description | Tables Affected |
|------|-------------|-----------------|
| 001_create_schema.sql | Initial schema creation | All core tables, indexes, triggers |
| 002_enable_rls.sql | Row Level Security policies | users, meetings, participants, messages, reactions, files, meeting_summaries |
| 003_enable_realtime.sql | Enable Realtime replication | participants, messages, reactions |

## Running Migrations

### Using Supabase CLI

**Prerequisites**:
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Or use project's local installation
npx supabase --help
```

### Initial Setup

```bash
# 1. Link to Supabase project
npx supabase link --project-ref your-project-ref

# 2. Initialize local development database (optional)
npx supabase init
npx supabase start
```

### Apply Migrations

```bash
# Apply all pending migrations to remote database
npx supabase db push

# Apply specific migration file
psql -h db.your-project.supabase.co \
     -U postgres \
     -d postgres \
     < apps/web/migrations/001_create_schema.sql
```

### Migration Status

```bash
# Check migration history
npx supabase migration list

# Generate migration from database diff
npx supabase db diff --schema public > apps/web/migrations/004_new_change.sql
```

## Creating New Migrations

### Naming Convention

```
{sequential_number}_{description}.sql

Examples:
001_create_schema.sql
002_enable_rls.sql
003_enable_realtime.sql
004_add_user_avatar.sql
005_create_recordings_table.sql
```

### Migration Template

```sql
-- Migration: 00X_description.sql
-- Description: Brief description of changes
-- Author: Your Name
-- Date: YYYY-MM-DD

-- =============================================================================
-- SCHEMA CHANGES
-- =============================================================================

-- Add new column (use IF EXISTS to be idempotent)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create new table
CREATE TABLE IF NOT EXISTS recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_recordings_meeting_id ON recordings(meeting_id);

-- =============================================================================
-- UPDATE RLS POLICIES (if needed)
-- =============================================================================

CREATE POLICY "Participants can view recordings"
ON recordings FOR SELECT
USING (
    meeting_id IN (
        SELECT p.meeting_id FROM participants p
        JOIN users u ON u.id = p.user_id
        WHERE u.clerk_id = auth.uid()::text
    )
);

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 00X_description.sql completed successfully';
    RAISE NOTICE 'Summary of changes...';
END $$;
```

### Best Practices

1. **Test Locally First**: Run migrations on local development database before production
2. **Backup Before Migration**: Always backup production database before applying migrations
3. **Check Constraints**: Validate data integrity after migration
4. **Rollback Plan**: Document how to rollback if migration fails

## Seeding Data

### Seed Files

| File | Description | Data Created |
|------|-------------|--------------|
| 001_test_users.sql | Test user accounts | 5 test users (Alice, Bob, Charlie, Diana, Eve) |
| 002_test_meetings.sql | Test meetings & participants | 3 meetings with participants, messages, reactions |

### Running Seed Files

```bash
# Run seed files manually
psql -h db.your-project.supabase.co \
     -U postgres \
     -d postgres \
     < apps/web/seeds/001_test_users.sql

psql -h db.your-project.supabase.co \
     -U postgres \
     -d postgres \
     < apps/web/seeds/002_test_meetings.sql

# Or use npm script (when configured)
npm run db:seed
```

### Seed Data Guidelines

- **Development Only**: Seed data is for development/testing, not production
- **Reset Friendly**: Seed scripts use `ON CONFLICT DO NOTHING` for re-runnability
- **Test Coverage**: Include data that covers all major use cases

## Database Reset

**WARNING**: This will delete ALL data and re-run migrations.

```bash
# Reset local development database
npx supabase db reset

# Reset remote database (DANGEROUS - only in development)
# 1. Backup database first
npx supabase db dump -f backup.sql

# 2. Drop all tables (use Supabase dashboard or SQL)
# 3. Re-run migrations
npx supabase db push
```

## Migration Workflow

### For New Features

```bash
# 1. Create feature branch
git checkout -b feature/add-recordings

# 2. Create migration file
touch apps/web/migrations/004_add_recordings_table.sql

# 3. Write migration SQL
nano apps/web/migrations/004_add_recordings_table.sql

# 4. Test migration locally
npx supabase db reset  # Start fresh
npx supabase db push   # Apply all migrations

# 5. Verify schema
psql -h localhost -U postgres -d postgres -c "\d recordings"

# 6. Commit migration file
git add apps/web/migrations/004_add_recordings_table.sql
git commit -m "feat: Add recordings table for meeting playback"

# 7. Apply to production (after merge)
npx supabase db push
```

### For Schema Changes

```bash
# 1. Make schema change in Supabase dashboard (development project)

# 2. Generate migration from diff
npx supabase db diff --schema public > apps/web/migrations/005_alter_users.sql

# 3. Review and edit migration file
nano apps/web/migrations/005_alter_users.sql

# 4. Test and commit
npx supabase db reset
npx supabase db push
git add apps/web/migrations/005_alter_users.sql
git commit -m "feat: Add avatar_url to users table"
```

## Troubleshooting

### Migration Fails

```bash
# Check current schema state
psql -h db.your-project.supabase.co -U postgres -d postgres -c "\dt"

# Check migration history
npx supabase migration list

# Manually fix issue, then create repair migration
touch apps/web/migrations/00X_fix_issue.sql
```

### RLS Policy Conflicts

```sql
-- Drop existing policy before recreating
DROP POLICY IF EXISTS "Policy name" ON table_name;
CREATE POLICY "Policy name" ON table_name ...;
```

### Type Errors

```bash
# Regenerate TypeScript types after migration
npm run db:types

# Or manually
npx supabase gen types typescript --project-id your-project-id > packages/shared/src/types/supabase.ts
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/db-migration.yml
name: Database Migration

on:
  push:
    branches: [main]
    paths:
      - 'apps/web/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Apply migrations
        run: npx supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

## Migration Checklist

Before applying migrations to production:

- [ ] Migration tested in local development
- [ ] Database backup created
- [ ] Migration is idempotent (can be re-run safely)
- [ ] RLS policies updated (if schema changes)
- [ ] TypeScript types regenerated
- [ ] Tests updated for schema changes
- [ ] Documentation updated (if public-facing changes)
- [ ] Team notified of schema changes

## Resources

- **Supabase CLI Docs**: https://supabase.com/docs/guides/cli
- **Migration Best Practices**: https://supabase.com/docs/guides/database/migrations
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-01 | 1.0 | Initial database migrations guide | Dev Agent |
