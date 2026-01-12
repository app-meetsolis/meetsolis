# Database Migrations

This directory contains SQL migration files for the MeetSolis database schema.

## How to Apply Migrations

### Option 1: Supabase CLI (Recommended for Development)
```bash
# Run all pending migrations
supabase db push

# Or apply specific migration
supabase db push --file 20260112193101_add_action_items_and_next_steps.sql
```

### Option 2: Supabase Dashboard (Manual)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Execute the SQL

### Option 3: Programmatic (via Supabase client)
```typescript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const sql = fs.readFileSync('./supabase/migrations/MIGRATION_FILE.sql', 'utf8');
await supabase.rpc('exec_sql', { sql });
```

## Migration Files

| File | Description | Story |
|------|-------------|-------|
| `20260112193101_add_action_items_and_next_steps.sql` | Creates action_items table and adds next_steps field to clients | Story 2.6 |

## Notes

- All migrations use `IF NOT EXISTS` to be idempotent
- RLS (Row Level Security) is enabled on all tables
- Each table has `updated_at` trigger for automatic timestamp updates
- Migration timestamps follow format: `YYYYMMDDHHMMSS`
