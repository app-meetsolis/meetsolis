# Story 3.6 — Action Item Tracking UI: Implementation Plan

## Context

SessionCard (expanded view) has a `{/* TODO Story 3.6 — ActionItemList */}` placeholder at line 157. The backend (API routes, DB schema, types) is fully built. This story is purely frontend + one additive API filter. Goal: coaches can view, complete, change status, and add action items scoped to a session, inline inside the expanded SessionCard.

---

## Critical Files

| Action | File |
|--------|------|
| MODIFY | `packages/shared/src/schemas/actionItem.ts` |
| MODIFY | `apps/web/src/app/api/action-items/route.ts` |
| CREATE | `apps/web/src/components/sessions/ActionItemRow.tsx` |
| CREATE | `apps/web/src/components/sessions/ActionItemList.tsx` |
| MODIFY | `apps/web/src/components/sessions/SessionCard.tsx` |
| CREATE | `apps/web/tests/components/sessions/ActionItemList.test.tsx` |

---

## Execution Order

### 1. Schema — `packages/shared/src/schemas/actionItem.ts`
Add optional `session_id` to `ActionItemCreateSchema`:
```ts
session_id: z.string().uuid().optional().nullable(),
```

### 2. API — `apps/web/src/app/api/action-items/route.ts`

**GET handler:** after `const status = searchParams.get('status')`, add:
```ts
const sessionId = searchParams.get('session_id');
```
After the existing `if (status)` filter block, add:
```ts
if (sessionId) {
  query = query.eq('session_id', sessionId);
}
```
`client_id` remains required — component sends both params.

**POST handler:** extract `session_id` from `validation.data`, add to insert:
```ts
session_id: session_id || null,
```

### 3. Create `ActionItemRow.tsx` (~80 lines)
**Path:** `apps/web/src/components/sessions/ActionItemRow.tsx`

Props: `{ item: ClientActionItem; onCheckboxChange(id, checked): void; onStatusChange(id, status): void }`

Row layout (`flex items-center gap-2 py-1.5`):
- shadcn `Checkbox` — `checked={item.status === 'completed'}`, calls `onCheckboxChange`
- Description `<span>` — `text-sm`, add `line-through opacity-50` when completed
- Assignee badge — inline `<span>`:
  - coach → `bg-blue-100 text-blue-700`
  - client → `bg-green-100 text-green-700`
  - Classes: `rounded-full px-1.5 py-0.5 text-xs font-medium shrink-0`
- shadcn `Select` — `value={item.status}`, `onValueChange` calls `onStatusChange`
  - All 4 statuses: Pending / In Progress / Completed / Cancelled
  - `SelectTrigger className="h-7 w-32 text-xs"`

### 4. Create `ActionItemList.tsx` (~150 lines)
**Path:** `apps/web/src/components/sessions/ActionItemList.tsx`

Props: `{ sessionId: string; clientId: string }`

**Query key** (session-scoped, avoids overwriting PendingActionsSection cache):
```ts
['action-items', clientId, 'session', sessionId]
```
Fetch: `GET /api/action-items?client_id=${clientId}&session_id=${sessionId}` — returns all statuses.

**Invalidation helper** (invalidate both keys to keep Client Detail header count in sync):
```ts
queryClient.invalidateQueries({ queryKey: ['action-items', clientId, 'session', sessionId] });
queryClient.invalidateQueries({ queryKey: ['action-items', clientId] });
```

**`handleCheckboxChange(id, checked)`** — optimistic pattern from `PendingActionsSection.tsx:48–67`:
```ts
queryClient.setQueryData(['action-items', clientId, 'session', sessionId], prev =>
  prev.map(i => i.id === id ? { ...i, status: checked ? 'completed' : 'pending' } : i)
);
// PUT /api/action-items/[id] { status }
// on error: toast.error + invalidateAll()
```

**`handleStatusChange(id, status)`** — same pattern, maps to update single item status.

**Add form state:** `newDesc`, `newAssignee` ('coach'|'client'), `isAdding`
- Input: `onKeyDown Enter` → `handleAdd()`
- Toggle buttons: mirror `ClientActionItemModal` coach/client UI
- POST body: `{ client_id, description, assignee, session_id }`, `due_date` omitted (null)
- On success: `toast.success` + `invalidateAll()` + clear `newDesc`

**Render structure:**
```
<div className="mt-3">
  <p className="mb-2 text-xs font-medium text-[#6B7280] uppercase tracking-wide">Action Items</p>
  {/* loading skeleton | error | empty state */}
  {items.map(item => <ActionItemRow ... />)}
  {/* inline add form: input + Coach/Client toggles */}
</div>
```

### 5. Modify `SessionCard.tsx` — line 157
Replace TODO comment:
```tsx
import { ActionItemList } from '@/components/sessions/ActionItemList';
// ...
<ActionItemList sessionId={session.id} clientId={clientId} />
```

### 6. Tests — `ActionItemList.test.tsx`
Follow `renderWithQueryClient` pattern from existing tests.

Test cases:
1. Loading skeleton renders
2. Items render with description, badge, status select
3. Empty state text shown
4. Error state text shown
5. Checkbox click → optimistic `line-through` applied immediately
6. PUT failure → `invalidateQueries` called (revert)
7. Enter key in input → POST called with correct body (`{ client_id, description, assignee, session_id }`)
8. Input + buttons disabled while `isAdding`

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Separate query key `[..., 'session', sessionId]` | Prevents overwriting `PendingActionsSection`'s client-level pending-only cache |
| Split into `ActionItemRow` + `ActionItemList` | Keeps each file ≤200 lines (project file size rule) |
| Inline row UI, not `ActionItemCard` | `ActionItemCard` is modal-based; session rows need denser inline layout |
| `due_date` null on create | Reduces friction; set later from Client Detail |
| `session_id` filter: server-side `.eq()` | Clients can have 100+ items across sessions — never filter client-side |
| No `useActionItems` hook | Inline fetch sufficient; one use site; premature abstraction |

---

## Verification

1. `npm run build` — no type errors
2. `npm test -- ActionItemList` — all 8 test cases pass
3. Manual: open Client Detail → expand a session → verify ActionItemList renders
4. Check checkbox → item shows strikethrough before server responds (optimistic)
5. Change status via dropdown → item updates immediately
6. Type description + Enter → item appended to list
7. Complete an item → Client Detail header "Pending Actions" count decrements
8. `PendingActionsSection` on Client Detail still shows correct pending items (regression)
