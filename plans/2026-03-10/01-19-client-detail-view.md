# Story 2.6 — Client Detail View (Full)
**Branch:** `story/2.6-client-detail-view` off `main`
**Status:** Ready for Dev

---

## Context

Story 2.7 shipped a minimal `/clients/[id]` stub (170-line page.tsx: name, goal, notes only). Story 2.6 expands this into the full executive-coach detail view defined in Epic 2 + Epic 3 of the PRD.

**Critical finding:** The paused branch `new-story2.6-development-starts` used a wrong v2 action_items schema (`completed BOOLEAN + due_date`). The official PRD Epic 3 defines a different schema (`status TEXT + assigned_to + completed_at + session_id`). Old branch DB migration and API routes are NOT reusable. Components are partially reusable with adaptation.

---

## Decisions & Recommendations

| Question | Recommendation | Reason |
|----------|---------------|--------|
| DB migration method | `supabase db push` locally | Consistent with all prior migrations in project |
| `last_session_at` | Already in DB (exists in `ClientSchema`) | No new column needed |
| Session stats display | `0` sessions, `—` last session | Cleaner than dual `—`, signals feature is coming |
| `assigned_to` in modal | Include Coach/Client toggle | Epic 3 schema requires it; avoids future data backfill |

---

## Page Layout (v3 — single column, max-w-3xl)

```
┌─────────────────────────────────────────────────────┐
│ ← Back to clients                                   │
│                                                     │
│  Client Name (h1)          [Ask Solis] (disabled)  │
│  "Coaching goal text" (secondary)                   │
│  📅 Coaching since Jan 2025                        │
│  ─────────────────────────────────────────────────  │
│  Total Sessions: 0  |  Pending: 2  |  Last: —      │
├─────────────────────────────────────────────────────┤
│  Sessions                           [Edit Client]  │
│  ┌───────────────────────────────────────────────┐ │
│  │  No sessions yet.                             │ │
│  │  Upload your first session transcript         │ │
│  │  [Upload Transcript] ← disabled stub          │ │
│  └───────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  Pending Actions                                    │
│  ┌───────────────────────────────────────────────┐ │
│  │ [ ] Follow up on leadership goal  [Coach]     │ │
│  │ [ ] Review notes                  [Client]   │ │
│  │ Empty: "No pending actions — great work!"     │ │
│  │ [+ Add Action Item]                           │ │
│  └───────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  Notes                                              │
│  [NotesEditor — from Story 2.7, unchanged]          │
└─────────────────────────────────────────────────────┘
```

---

## Correct `action_items` Schema (Epic 3 / Story 3.1)

```sql
CREATE TABLE action_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID REFERENCES sessions(id) ON DELETE CASCADE,  -- nullable; Story 3.1 populates
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL,  -- Clerk user ID
  description  TEXT NOT NULL,
  status       TEXT DEFAULT 'pending',  -- 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to  TEXT,                    -- 'coach' | 'client'
  created_at   TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP               -- set when status = 'completed'
);

CREATE INDEX idx_client_actions  ON action_items(client_id);
CREATE INDEX idx_pending_actions ON action_items(user_id, status) WHERE status = 'pending';

ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "action_items_all" ON action_items FOR ALL USING (true); -- enforced via user_id in API
```

Story 3.1 will add `sessions` table and link existing action items via `session_id` without conflict.

---

## Old Branch: Reuse Decision

| Old Branch Item | Reuse? | Action |
|----------------|--------|--------|
| `ActionItemCard.tsx` | ⚠️ Adapt | Schema: `completed` → `status`, remove `due_date`, add `assigned_to` badge |
| `ClientActionItemSidebar.tsx` | ⚠️ Adapt | Rename → `PendingActionsSection.tsx`, adapt to new schema |
| `ClientActionItemModal.tsx` | ⚠️ Adapt | Remove `due_date`, add `assigned_to` Coach/Client toggle |
| `checkbox.tsx` (Radix UI) | ✅ Port | Generic UI component, no schema dep |
| `alert-dialog.tsx` (Radix UI) | ✅ Port | Generic UI component, no schema dep |
| DB migration | ❌ Discard | Wrong schema |
| API routes | ❌ Discard | Wrong schema |
| `ClientDetailLayout.tsx` | ❌ Skip | v2 2-column tabs layout, not in v3 story |
| `ClientTabs.tsx` / `ClientOverview.tsx` | ❌ Skip | Old v2 fields (email, phone, tags) |
| `ClientNextSteps.tsx` | ❌ Skip | Not in official story; AI version in Epic 4 |
| Old `page.tsx` (293 lines) | ❌ Skip | Conflicts with 2.7 stub on main |

---

## Implementation Tasks

### Task 0 — Branch Setup
```bash
git checkout main && git pull
git checkout -b story/2.6-client-detail-view
```

---

### Task 1 — DB Migration
**File:** `supabase/migrations/[timestamp]_add_action_items.sql`

Creates `action_items` table per Epic 3 schema (above).

**Apply:**
```bash
supabase db push
```

---

### Task 2 — Shared Types
**File:** `packages/shared/src/types/database.ts`

Add:
```ts
export interface ClientActionItem {
  id: string;
  session_id: string | null;
  client_id: string;
  user_id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to: 'coach' | 'client' | null;
  created_at: string;
  completed_at: string | null;
}
export interface ClientActionItemInsert { client_id: string; description: string; assigned_to?: 'coach' | 'client' | null; status?: string; }
export interface ClientActionItemUpdate { description?: string; status?: string; assigned_to?: string | null; completed_at?: string | null; }
```

**File:** `packages/shared/src/index.ts` — export `ClientActionItem` types.

---

### Task 3 — Zod Validation
**File:** `apps/web/src/lib/validations/actionItems.ts`

```ts
actionItemCreateSchema: {
  client_id: z.string().uuid(),
  description: z.string().min(1).max(500),
  assigned_to: z.enum(['coach', 'client']).optional(),
  status: z.string().default('pending'),
}
actionItemUpdateSchema: (all fields optional)
```

---

### Task 4 — Action Items API Routes
**`apps/web/src/app/api/action-items/route.ts`**
- `GET ?client_id=[id]&status=pending` — list pending action items (auth + ownership check)
- `POST` — create action item (Zod validate)

**`apps/web/src/app/api/action-items/[id]/route.ts`**
- `PUT` — update (description, status, assigned_to, completed_at)
- `DELETE` — delete (ownership check)

Auth pattern: same as `/api/clients` (Clerk JWT → `userId` → service role Supabase).

When `status` is set to `'completed'` on PUT, auto-set `completed_at = NOW()`.

---

### Task 5 — Radix UI Components (port from old branch)
- `apps/web/src/components/ui/checkbox.tsx`
- `apps/web/src/components/ui/alert-dialog.tsx`

Check if they already exist on main first (`npx shadcn-ui add checkbox alert-dialog` if not).

---

### Task 6 — Action Item UI Components

**`apps/web/src/components/clients/ActionItemCard.tsx`** (adapt from old branch)
- Checkbox → PUT `/api/action-items/[id]` with `status: 'completed'`
- Description (strikethrough if completed)
- `assigned_to` badge: "Coach" (blue) | "Client" (green)
- Hover: Edit + Delete buttons
- Delete: AlertDialog confirmation

**`apps/web/src/components/clients/ClientActionItemModal.tsx`** (adapt from old branch)
- Fields: Description (required, max 500), Assigned To (Coach/Client toggle, default Coach)
- Zod validated form
- POST on create, PUT on edit
- Success/error toast

**`apps/web/src/components/clients/PendingActionsSection.tsx`** (new, adapted from old sidebar)
- Title: "Pending Actions" + count badge
- List of pending `ActionItemCard`s
- `+ Add Action Item` button → opens `ClientActionItemModal`
- Empty state: "No pending actions — great work!"
- React Query: `useQuery(['action-items', clientId])`
- On checkbox complete: optimistic update → `status: 'completed'`

---

### Task 7 — Session Timeline Stub
**`apps/web/src/components/clients/SessionTimelineStub.tsx`** (~40 lines, new)

```tsx
// Stub for Story 3.5 — SessionTimeline renders real data here
export function SessionTimelineStub() {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-200 bg-white p-8 text-center">
      <p className="text-sm text-[#6B7280]">No sessions yet.</p>
      <p className="mt-1 text-sm text-[#9CA3AF]">Upload your first session transcript to get started.</p>
      <Button variant="outline" size="sm" disabled className="mt-4" title="Coming in Story 3.2">
        Upload Session Transcript
      </Button>
    </div>
  );
}
```

---

### Task 8 — Expand `page.tsx`
**File:** `apps/web/src/app/(dashboard)/clients/[id]/page.tsx`

Expand from 170-line 2.7 stub. Key additions:

**Data fetching (parallel React Query):**
```ts
useQuery(['client', id], ...)               // existing
useQuery(['action-items', id], fetchPendingActionItems)  // NEW
```

**Stats row:**
- `Total Sessions: 0` (hardcoded stub, Story 3.5 wires real data)
- `Pending: actionItems.filter(a => a.status === 'pending').length`
- `Last Session: client.last_session_at ? format(...) : '—'`

**Solis placeholder button:**
```tsx
<Button variant="outline" size="sm" disabled title="Coming soon — Story 4.3">
  Ask Solis about {client.name}
</Button>
```

**Full section order:**
1. Header (name, goal, coaching since, stats row, Solis button, Edit button)
2. `<SessionTimelineStub />`
3. `<PendingActionsSection clientId={client.id} />`
4. `<NotesEditor ... />` (unchanged from 2.7)

Loading: skeleton for both client and action items queries.
Error: graceful error state per section.

---

### Task 9 — Story Doc Update
**File:** `docs/stories/2.6.story.md`
- Status: `Not Started` → `Done`
- Check all task boxes `[x]`
- Add Dev Agent Record section

---

## Critical Files

| Action | File |
|--------|------|
| NEW | `supabase/migrations/[ts]_add_action_items.sql` |
| MODIFY | `packages/shared/src/types/database.ts` |
| MODIFY | `packages/shared/src/index.ts` |
| NEW | `apps/web/src/lib/validations/actionItems.ts` |
| NEW | `apps/web/src/app/api/action-items/route.ts` |
| NEW | `apps/web/src/app/api/action-items/[id]/route.ts` |
| PORT (adapt) | `apps/web/src/components/ui/checkbox.tsx` |
| PORT (adapt) | `apps/web/src/components/ui/alert-dialog.tsx` |
| NEW (adapt) | `apps/web/src/components/clients/ActionItemCard.tsx` |
| NEW (adapt) | `apps/web/src/components/clients/ClientActionItemModal.tsx` |
| NEW | `apps/web/src/components/clients/PendingActionsSection.tsx` |
| NEW | `apps/web/src/components/clients/SessionTimelineStub.tsx` |
| EXPAND | `apps/web/src/app/(dashboard)/clients/[id]/page.tsx` |
| MODIFY | `docs/stories/2.6.story.md` |

---

## Acceptance Criteria Coverage

| AC | Coverage |
|----|----------|
| 1. Page at `/clients/[id]` | ✅ Exists from 2.7, now fully expanded |
| 2. Header: name, goal, coaching since, stats row | Task 8 |
| 3. Session Timeline + empty state + upload CTA | Task 7 (stub) |
| 4–6. Session cards (collapsed/expanded/processing) | Story 3.5 (stub only in 2.6) |
| 7. Pending Actions: list + quick-complete | Tasks 4, 6, 8 |
| 8. Ask Solis button | Task 8 (disabled placeholder) |
| 9. Loading skeleton | Task 8 |
| 10. Mobile responsive | Task 8 (Tailwind) |
| 11. Back navigation | ✅ Exists from 2.7 |

---

## Dependencies for Future Stories

| Stub | Wired in |
|------|----------|
| Session timeline (empty state) | Story 3.5 |
| Upload transcript button | Story 3.2 |
| Session stats row (real counts) | Story 3.5 |
| Ask Solis button | Story 4.3 |
| action_items.session_id FK | Story 3.1 |

---

## Verification Checklist (manual QA)

1. `npm run build` — zero type errors
2. Navigate to `/clients/[id]` — page loads, no blank screen
3. Stats row: pending count matches actual action items
4. Add action item → appears in list immediately (optimistic update)
5. Check checkbox → item disappears from Pending list
6. Edit action item → modal pre-fills, saves correctly
7. Delete action item → confirmation dialog, then removed
8. Session timeline shows empty state (not an error)
9. "Ask Solis" button visible but disabled (tooltip shows)
10. "Upload Transcript" button disabled (tooltip shows)
11. Notes editor still works (regression from 2.7)
12. Edit client (pencil) still opens modal
13. Back link → `/clients`
14. Mobile: layout stacks cleanly on small screen
