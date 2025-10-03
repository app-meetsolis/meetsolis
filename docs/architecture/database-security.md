## Database Security Model

## Overview

MeetSolis implements a comprehensive security model using Supabase Row Level Security (RLS) to ensure multi-tenant data isolation and role-based access control. This document describes the security architecture and RLS policy design.

## Authentication Integration

### Clerk + Supabase Architecture

```
User Authentication Flow:
1. User authenticates via Clerk (Google, Apple, Email)
2. Clerk issues JWT with user ID (clerk_id)
3. Frontend passes JWT to Supabase client
4. Supabase validates JWT using auth.uid()
5. RLS policies match auth.uid() to users.clerk_id
6. Query returns only authorized data
```

### User Identity Linkage

- **Clerk ID**: Primary authentication identifier (stored in users.clerk_id)
- **Supabase ID**: Internal UUID (users.id) for foreign key relationships
- **Helper Function**: get_current_user_id() converts auth.uid() to users.id

```sql
CREATE FUNCTION get_current_user_id() RETURNS UUID AS $$
    SELECT id FROM users WHERE clerk_id = auth.uid()::text;
$$ LANGUAGE SQL SECURITY DEFINER;
```

## Row Level Security (RLS) Policies

### Users Table

**Security Goal**: Users can only view and modify their own profile, but can see other users in shared meetings.

| Policy | Operation | Rule |
|--------|-----------|------|
| View own profile | SELECT | clerk_id = auth.uid() |
| Update own profile | UPDATE | clerk_id = auth.uid() |
| View meeting participants | SELECT | User is in same meeting |
| Insert users | INSERT | Service role only (Clerk webhook) |

**Example Policy**:
```sql
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (clerk_id = auth.uid()::text);
```

### Meetings Table

**Security Goal**: Hosts control their meetings, participants can view meetings they joined.

| Policy | Operation | Rule |
|--------|-----------|------|
| Host full access | ALL | user is meeting host |
| Participant view access | SELECT | user is in participants table |
| Public view (invite link) | SELECT | invite_link IS NOT NULL |

**Key Policy**:
```sql
CREATE POLICY "Hosts can manage own meetings"
ON meetings FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = meetings.host_id
        AND users.clerk_id = auth.uid()::text
    )
);
```

### Participants Table

**Security Goal**: Meeting participants can view each other, hosts can manage all participants.

| Policy | Operation | Rule |
|--------|-----------|------|
| View participants | SELECT | User is in same meeting |
| Join meeting | INSERT | User joining as themselves |
| Update own status | UPDATE | user_id = current_user_id |
| Host manages | ALL | User is host/co-host |

**Example Policy**:
```sql
CREATE POLICY "Users can join meetings as participants"
ON participants FOR INSERT
WITH CHECK (user_id = get_current_user_id());
```

### Messages Table

**Security Goal**: Only meeting participants can view and send messages.

| Policy | Operation | Rule |
|--------|-----------|------|
| View messages | SELECT | User is meeting participant |
| Send messages | INSERT | User is joined participant (status='joined') |
| Delete own messages | DELETE | user_id = current_user_id |

**Security Feature**: Messages must pass through sanitization before INSERT (application layer).

### Reactions Table

**Security Goal**: Participants can add and view reactions in their meetings.

| Policy | Operation | Rule |
|--------|-----------|------|
| View reactions | SELECT | User is meeting participant |
| Add reactions | INSERT | User is joined participant |

### Files Table

**Security Goal**: Participants can upload/view files, hosts have full control.

| Policy | Operation | Rule |
|--------|-----------|------|
| View files | SELECT | User is meeting participant |
| Upload files | INSERT | User is joined participant |
| Delete own files | DELETE | user_id = current_user_id |
| Host manages | ALL | User is meeting host |

**Additional Security**: File expiration enforced via cleanup_expired_files() function.

### Meeting Summaries Table

**Security Goal**: Participants can view summaries, only service role can create (AI-generated).

| Policy | Operation | Rule |
|--------|-----------|------|
| View summaries | SELECT | User is meeting participant |
| Create summaries | INSERT | Service role only (API routes) |

## Security Testing Strategy

### Test Scenarios

1. **Cross-Tenant Isolation**
   - User A should not see User B's meetings
   - User A should not access User B's profile

2. **Role-Based Access**
   - Participants can view but not modify meeting settings
   - Hosts can promote participants to co-hosts
   - Co-hosts can manage participants but not end meeting

3. **Unauthorized Access**
   - Non-participants should not view meeting messages
   - Deleted users should lose all access

### Testing Queries

```sql
-- Test 1: User can only see own meetings as host
SET request.jwt.claim.sub = 'clerk_user_123';
SELECT * FROM meetings; -- Should only return user_123's meetings

-- Test 2: Participant can view meeting
SET request.jwt.claim.sub = 'clerk_user_456';
SELECT * FROM meetings WHERE invite_link = 'abc123'; -- Should succeed

-- Test 3: Non-participant blocked
SET request.jwt.claim.sub = 'clerk_user_789';
SELECT * FROM messages WHERE meeting_id = 'meeting_abc'; -- Should return empty
```

## Service Role Key Usage

**CRITICAL**: The service role key bypasses ALL RLS policies.

### Allowed Use Cases
- ✅ Clerk webhook user sync (INSERT/UPDATE users table)
- ✅ AI-generated summaries (INSERT meeting_summaries)
- ✅ Scheduled cleanup jobs (cleanup_expired_files)
- ✅ Admin operations (usage alerts, monitoring)

### Prohibited Use Cases
- ❌ Direct user data queries (use anon key + RLS)
- ❌ Client-side operations
- ❌ Unvalidated API routes

**Code Pattern**:
```typescript
// CORRECT: Server-side API route with service role
import { getSupabaseServerClient } from '@/lib/supabase/server';
const supabase = getSupabaseServerClient(); // Uses service role key

// INCORRECT: Client-side with service role
// Never do this - exposes service role key to browser!
```

## Data Encryption

### Field-Level Encryption

**Encrypted Fields**:
- users.name (using pgcrypto)

**Encryption Method**:
```sql
-- Encrypt on insert
INSERT INTO users (name) VALUES (pgp_sym_encrypt('John Doe', 'encryption_key'));

-- Decrypt on select
SELECT pgp_sym_decrypt(name::bytea, 'encryption_key') FROM users;
```

**Note**: Encryption key must be stored in environment variables, never in code.

### Connection Encryption

- All database connections use SSL/TLS (enforced by Supabase)
- Certificate validation enabled
- No plaintext database traffic

## Audit Logging

### Security-Sensitive Operations

All critical operations are logged to the `usage_alerts` table:

| Event Type | Logged Information |
|------------|-------------------|
| user.created | Clerk user sync to database |
| user.deleted | User account deletion |
| file_cleanup | Expired files removed |
| security_event | Unauthorized access attempts |
| backup_failure | Database backup failures |

**Example Audit Log**:
```sql
INSERT INTO usage_alerts (alert_type, message, severity, metadata)
VALUES (
    'security_event',
    'Unauthorized meeting access attempt',
    'warning',
    jsonb_build_object(
        'user_id', 'clerk_user_123',
        'meeting_id', 'meeting_abc',
        'timestamp', NOW()
    )
);
```

## Security Best Practices

### Application Layer

1. **Input Validation**: Use Zod schemas for all API inputs
2. **Content Sanitization**: Sanitize all user content with sanitize-html before INSERT
3. **Rate Limiting**: Implement rate limiting on API routes (Upstash Redis)
4. **CSRF Protection**: Use Next.js CSRF tokens for state-changing operations
5. **Content Security Policy**: Enforce CSP headers (configured in next.config.js)

### Database Layer

1. **Principle of Least Privilege**: Use anon key for client operations
2. **Check Constraints**: Enforce data validity at database level
3. **Foreign Key Cascade**: Proper cleanup on user/meeting deletion
4. **Index Optimization**: Avoid exposing internal IDs in URLs (use invite_link instead)

### Monitoring

1. **Failed Query Alerts**: Monitor RLS policy violations
2. **Usage Alerts**: Track suspicious patterns (high file uploads, excessive AI usage)
3. **Error Logging**: Sentry integration for security exceptions

## Compliance and Privacy

### GDPR Compliance

- **Right to Access**: Users can export their data via API
- **Right to Deletion**: Cascade deletes remove all user data
- **Right to Portability**: JSON export of user meetings and messages
- **Data Retention**: Files auto-expire after 7 days

### Data Minimization

- Only store essential user data (email, name, preferences)
- No tracking of user behavior beyond usage quotas
- Meeting recordings not stored (P2P only)

## Security Incident Response

### Steps

1. **Detection**: Monitor usage_alerts for security events
2. **Containment**: Revoke compromised API keys, block suspicious IPs
3. **Investigation**: Query audit logs for incident scope
4. **Recovery**: Restore from backup if data corruption
5. **Documentation**: Post-mortem report for future prevention

### Emergency Contacts

- **Supabase Support**: support@supabase.io
- **Security Team**: [TBD]
- **Incident Commander**: [TBD]

## Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-01 | 1.0 | Initial database security model documentation | Dev Agent |
