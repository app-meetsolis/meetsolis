# MeetSolis v2.0 Feature Flag Implementation

**Version:** 1.0
**Last Updated:** January 7, 2026
**Status:** Production-ready

---

## Overview

Feature flags enable gradual rollout of v2.0 features (client memory assistant) while preserving Epic 1 stability. If issues arise post-migration, flags can be disabled instantly without database rollback.

**Key Benefits:**
- **Instant rollback** - Disable features without database changes
- **Gradual rollout** - Test with internal users before 100% release
- **Risk mitigation** - Isolate v2.0 failures from Epic 1 functionality
- **A/B testing** - Compare user engagement across versions

---

## Feature Flags

### Environment Variables

**Default state (pre-migration):**

```env
# .env.production
NEXT_PUBLIC_ENABLE_CLIENT_CARDS=false
NEXT_PUBLIC_ENABLE_NEW_MEETINGS=false
ENABLE_PGVECTOR=false
```

**Flag descriptions:**

| Flag | Description | Impact |
|------|-------------|--------|
| `NEXT_PUBLIC_ENABLE_CLIENT_CARDS` | Client management UI (Epic 2) | Hides /clients routes + client card components |
| `NEXT_PUBLIC_ENABLE_NEW_MEETINGS` | Meeting logging UI (Epic 3) | Uses legacy meeting structure if disabled |
| `ENABLE_PGVECTOR` | RAG vector search (Epic 4) | Falls back to text search if disabled |

### Setting Flags

**Vercel (production):**

```bash
# Enable client cards
vercel env add NEXT_PUBLIC_ENABLE_CLIENT_CARDS true production

# Enable new meetings
vercel env add NEXT_PUBLIC_ENABLE_NEW_MEETINGS true production

# Enable pgvector
vercel env add ENABLE_PGVECTOR true production

# Redeploy to apply changes
vercel --prod
```

**Local development:**

```bash
# .env.local
NEXT_PUBLIC_ENABLE_CLIENT_CARDS=true
NEXT_PUBLIC_ENABLE_NEW_MEETINGS=true
ENABLE_PGVECTOR=true
```

**Staging:**

```bash
vercel env add NEXT_PUBLIC_ENABLE_CLIENT_CARDS true preview
vercel env add NEXT_PUBLIC_ENABLE_NEW_MEETINGS true preview
vercel env add ENABLE_PGVECTOR true preview
```

---

## Implementation

### 1. Middleware Guards

**Purpose:** Redirect users from disabled features

**File:** `apps/web/src/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Feature flag: Client cards
  if (pathname.startsWith('/clients')) {
    const clientCardsEnabled = process.env.NEXT_PUBLIC_ENABLE_CLIENT_CARDS === 'true';

    if (!clientCardsEnabled) {
      // Redirect to dashboard with message
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('message', 'feature_disabled');
      return NextResponse.redirect(url);
    }
  }

  // Feature flag: New meetings
  if (pathname.startsWith('/meetings/log')) {
    const newMeetingsEnabled = process.env.NEXT_PUBLIC_ENABLE_NEW_MEETINGS === 'true';

    if (!newMeetingsEnabled) {
      const url = request.nextUrl.clone();
      url.pathname = '/meetings'; // Legacy meetings page
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/clients/:path*', '/meetings/:path*'],
};
```

---

### 2. API Route Guards

**Purpose:** Return 503 Service Unavailable for disabled features

**Pattern:**

```typescript
// apps/web/src/app/api/clients/route.ts

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Feature flag check
  if (process.env.NEXT_PUBLIC_ENABLE_CLIENT_CARDS !== 'true') {
    return NextResponse.json(
      {
        error: 'Feature not enabled',
        message: 'Client cards are currently disabled',
        code: 'FEATURE_DISABLED',
      },
      { status: 503 }
    );
  }

  // Normal API logic
  const clients = await fetchClients();
  return NextResponse.json(clients);
}
```

**Apply to all v2.0 routes:**

- `/api/clients` (GET, POST)
- `/api/clients/[id]` (GET, PUT, DELETE)
- `/api/meetings` (POST) - new meeting structure
- `/api/meetings/[id]/upload-recording`
- `/api/meetings/[id]/ai-summary`
- `/api/action-items`
- `/api/assistant/chat`
- `/api/assistant/prepare`

---

### 3. UI Component Guards

**Purpose:** Conditionally render v2.0 components

**Pattern 1: Hide component completely**

```typescript
// apps/web/src/components/ClientCard.tsx

export function ClientCard({ client }: { client: Client }) {
  // Feature flag check
  if (process.env.NEXT_PUBLIC_ENABLE_CLIENT_CARDS !== 'true') {
    return null; // Hide component
  }

  return (
    <div className="client-card">
      {/* Client card UI */}
    </div>
  );
}
```

**Pattern 2: Show fallback UI**

```typescript
// apps/web/src/app/dashboard/page.tsx

export default function DashboardPage() {
  const clientCardsEnabled = process.env.NEXT_PUBLIC_ENABLE_CLIENT_CARDS === 'true';

  return (
    <div>
      <h1>Dashboard</h1>

      {clientCardsEnabled ? (
        <ClientCardList />
      ) : (
        <LegacyMeetingsList /> // Show old UI
      )}
    </div>
  );
}
```

**Pattern 3: Show "Coming Soon" message**

```typescript
// apps/web/src/app/clients/page.tsx

export default function ClientsPage() {
  const clientCardsEnabled = process.env.NEXT_PUBLIC_ENABLE_CLIENT_CARDS === 'true';

  if (!clientCardsEnabled) {
    return (
      <div className="text-center py-12">
        <h2>Client Management Coming Soon</h2>
        <p>This feature is currently being rolled out.</p>
        <Button href="/dashboard">Back to Dashboard</Button>
      </div>
    );
  }

  return <ClientCardList />;
}
```

---

### 4. Database Query Guards

**Purpose:** Gracefully handle missing v2.0 tables

**Pattern:**

```typescript
// apps/web/src/services/clients.ts

import { supabase } from '@/lib/supabase';

export async function getClients(userId: string) {
  // Feature flag check
  if (process.env.NEXT_PUBLIC_ENABLE_CLIENT_CARDS !== 'true') {
    return []; // Return empty array (safe fallback)
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      // Check if error is due to missing table
      if (error.message.includes('relation "clients" does not exist')) {
        console.warn('clients table not found - feature may be disabled');
        return [];
      }
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error fetching clients:', err);
    return [];
  }
}
```

---

### 5. pgvector Fallback

**Purpose:** Use text search if pgvector disabled

**Pattern:**

```typescript
// apps/web/src/services/assistant.ts

export async function searchSimilarMeetings(query: string, userId: string) {
  const pgvectorEnabled = process.env.ENABLE_PGVECTOR === 'true';

  if (pgvectorEnabled) {
    // Use vector similarity search
    const embedding = await generateEmbedding(query);
    const { data } = await supabase.rpc('search_embeddings', {
      query_embedding: embedding,
      match_count: 5,
      user_id: userId,
    });
    return data;
  } else {
    // Fallback: Text search on meeting transcripts
    const { data } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', userId)
      .ilike('transcript', `%${query}%`)
      .limit(5);
    return data;
  }
}
```

---

## Gradual Rollout Strategy

### Phase 1: Internal Testing (Day 1)

**Audience:** Dev team only (5 users)

**Actions:**
```bash
# Enable for specific user IDs (custom implementation)
vercel env add FEATURE_FLAG_WHITELIST "user_abc123,user_def456" production
vercel --prod
```

**Monitoring:**
- Error rate <1%
- No Sentry alerts
- Manual testing of all workflows

**Success Criteria:** All features work for internal users

---

### Phase 2: Beta Users (Days 2-3)

**Audience:** Beta testers (20 users)

**Actions:**
```bash
# Expand whitelist
vercel env add FEATURE_FLAG_WHITELIST "user_abc123,user_def456,..." production
vercel --prod
```

**Monitoring:**
- Error rate <2%
- User feedback via in-app surveys
- Support ticket volume

**Success Criteria:** Positive feedback, <5 support tickets

---

### Phase 3: Limited Rollout (Days 4-7)

**Audience:** 10% of users (random selection)

**Actions:**
```typescript
// Percentage-based rollout
export function isFeatureEnabled(userId: string, flagName: string): boolean {
  const hash = hashUserId(userId); // Consistent hash
  const percentage = hash % 100;

  const rolloutPercentage = parseInt(process.env.ROLLOUT_PERCENTAGE || '0');
  return percentage < rolloutPercentage;
}
```

```bash
vercel env add ROLLOUT_PERCENTAGE 10 production
vercel --prod
```

**Monitoring:**
- A/B test metrics (engagement, retention)
- Error rate comparison (v1.0 vs v2.0 users)
- Performance metrics (latency, throughput)

**Success Criteria:** v2.0 metrics ≥ v1.0 metrics

---

### Phase 4: Full Rollout (Day 8+)

**Audience:** All users (100%)

**Actions:**
```bash
# Enable globally
vercel env add NEXT_PUBLIC_ENABLE_CLIENT_CARDS true production
vercel env add NEXT_PUBLIC_ENABLE_NEW_MEETINGS true production
vercel env add ENABLE_PGVECTOR true production
vercel --prod
```

**Monitoring:**
- Error rate <1% sustained for 7 days
- User complaints <10/week
- Performance SLA met (p95 latency <200ms)

**Success Criteria:** Stable for 7 days, no rollbacks

---

## Emergency Disable

### Instant Rollback

**Trigger:** Error rate >5% for 5+ minutes

**Actions:**

```bash
# 1. Disable all v2.0 features (fastest mitigation)
vercel env rm NEXT_PUBLIC_ENABLE_CLIENT_CARDS production
vercel env rm NEXT_PUBLIC_ENABLE_NEW_MEETINGS production
vercel env rm ENABLE_PGVECTOR production

# 2. Redeploy (takes ~30 seconds)
vercel --prod

# 3. Verify error rate dropped
# Check Vercel logs or Sentry dashboard
```

**Expected Result:**
- Users redirected to legacy UI
- API routes return 503 (graceful degradation)
- Error rate drops to <1% within 2 minutes

**No database changes required** - this is a code-only rollback.

---

## Monitoring

### Metrics to Track

**Per-feature metrics:**

| Metric | Alert Threshold | Dashboard |
|--------|-----------------|-----------|
| Error rate (v2.0 routes) | >2% | Sentry |
| Latency (p95) | >300ms | Vercel Analytics |
| 503 responses | >10/min | Vercel Logs |
| Feature flag checks | - | Custom (Posthog) |

**User behavior metrics:**

| Metric | Success Target | Dashboard |
|--------|----------------|-----------|
| Client creation rate | >5/day | Posthog |
| Meeting uploads | >10/day | Posthog |
| AI queries | >20/day | Posthog |
| Engagement (DAU) | +10% vs v1.0 | Posthog |

### Alerts

**Slack notification on:**
- Error rate >5% for v2.0 routes
- Feature flag disabled in production
- Database migration rollback triggered

**Template:**

```
🚨 Feature Flag Alert

Feature: Client Cards
Action: DISABLED
Reason: Error rate exceeded threshold (8.3%)
Environment: Production
Timestamp: 2026-01-07 14:23 UTC

Impact:
- Users redirected to legacy dashboard
- /api/clients routes returning 503
- No data loss

Next steps:
1. Check Sentry for error details
2. Review deploy logs
3. Run Epic 1 verification
4. Schedule post-mortem
```

---

## Testing Feature Flags

### Unit Tests

```typescript
// apps/web/src/components/__tests__/ClientCard.test.tsx

describe('ClientCard with feature flags', () => {
  it('should render when flag enabled', () => {
    process.env.NEXT_PUBLIC_ENABLE_CLIENT_CARDS = 'true';
    const { getByText } = render(<ClientCard client={mockClient} />);
    expect(getByText('Acme Corp')).toBeInTheDocument();
  });

  it('should hide when flag disabled', () => {
    process.env.NEXT_PUBLIC_ENABLE_CLIENT_CARDS = 'false';
    const { container } = render(<ClientCard client={mockClient} />);
    expect(container.firstChild).toBeNull();
  });
});
```

### Integration Tests

```bash
# Test middleware redirects
curl https://meetsolis.com/clients
# Expected: 302 redirect to /dashboard (if flag disabled)

# Test API guard
curl https://meetsolis.com/api/clients
# Expected: 503 Service Unavailable (if flag disabled)
```

---

## Cleanup (Post-Rollout)

**After 30 days of stable v2.0:**

1. Remove feature flag checks from code
2. Delete legacy UI components
3. Remove env vars from Vercel
4. Update documentation

```bash
# Remove deprecated flags
vercel env rm NEXT_PUBLIC_ENABLE_CLIENT_CARDS production
vercel env rm NEXT_PUBLIC_ENABLE_NEW_MEETINGS production
vercel env rm ENABLE_PGVECTOR production
```

**Code cleanup:**

```typescript
// Before (with feature flag)
if (process.env.NEXT_PUBLIC_ENABLE_CLIENT_CARDS === 'true') {
  return <ClientCardList />;
} else {
  return <LegacyMeetingsList />;
}

// After (flag removed)
return <ClientCardList />;
```

---

## Appendix: Quick Reference

| Action | Command | Effect |
|--------|---------|--------|
| Enable client cards | `vercel env add NEXT_PUBLIC_ENABLE_CLIENT_CARDS true production && vercel --prod` | Show client UI |
| Disable client cards | `vercel env rm NEXT_PUBLIC_ENABLE_CLIENT_CARDS production && vercel --prod` | Hide client UI |
| Check flag status | `vercel env ls production` | List all flags |
| Test flag locally | `.env.local: NEXT_PUBLIC_ENABLE_CLIENT_CARDS=true` | Dev testing |

---

**Last Updated:** January 7, 2026
**Owner:** @dev team
**Review Date:** After Phase 4 rollout complete
