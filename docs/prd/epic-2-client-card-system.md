# Epic 2: Client Card System & Management

**Version:** 2.4
**Status:** In Progress (Stories 2.1-2.5 Complete)
**Priority:** P0 (Critical - MVP Foundation)
**Target Timeline:** Week 2 (Jan 13-19, 2026)
**Dependencies:** Epic 1 (Complete)

---

## Epic Overview

Build the core client management system with client cards as the central organizing principle. Users can add clients, view client details, and organize their professional relationships.

**Goal:** Enable users to manage up to 50 clients (Pro) or 3 clients (Free) with all essential information accessible at a glance.

**Architecture Note:** Stories 2.1-2.2 implemented with top horizontal navigation for rapid MVP delivery. Reference UI shows left sidebar navigation. Navigation refactor documented in Story 2.9 to align with reference design while maintaining backward compatibility.

---

## User Stories

### Story 2.1: Client CRUD & Database Schema

**STATUS:** ✅ COMPLETE

**As a** user
**I want to** create, view, edit, and delete client profiles
**So that** I can organize my professional relationships

**Acceptance Criteria:**
- [x] Database schema created (clients table with RLS)
- [x] API routes: POST /api/clients (create), GET /api/clients (list), GET /api/clients/[id] (detail), PUT /api/clients/[id] (update), DELETE /api/clients/[id] (delete)
- [x] Zod validation schemas for client data
- [x] Client fields: id, user_id, name, company, role, email, phone, website, linkedin_url, created_at, updated_at
- [x] Free tier: max 3 clients enforced, Pro tier: max 50 clients
- [x] Soft delete with confirmation dialog
- [x] Error handling for duplicate clients (same email)

**Technical Notes:**
- Use Supabase RLS: `user_id = auth.uid()`
- Index on user_id + created_at for fast queries
- Store LinkedIn/website URLs for future research feature

**Estimated Effort:** 1 day

---

### Story 2.2: Client Dashboard UI (Grid View)

**STATUS:** ✅ COMPLETE (with top nav, sidebar refactor in Story 2.9)

**As a** user
**I want to** see all my clients in a clean grid layout
**So that** I can quickly find and access client information

**Acceptance Criteria:**
- [x] Dashboard page matches reference design (3-column grid)
- [x] Client cards display: Name, Role/Company, Last Meeting date, Active Projects count
- [x] "+ Add Client" button (top-right)
- [x] Empty state: "No clients yet. Add your first client to get started."
- [x] Loading state: Skeleton cards (shimmer effect)
- [x] Error state: Error message with retry button
- [x] Card hover effect: Lift (translateY -4px), shadow increase
- [x] Click card → Navigate to client detail page
- [x] Responsive: 3 cols (desktop), 2 cols (tablet), 1 col (mobile)

**Design Specs:**
- Background: #E8E4DD (light beige)
- Cards: White, 8px border radius, subtle shadow
- Client name: 20px bold, #1A1A1A
- Role/Company: 14px regular, #6B7280
- Badge: #F3F4F6 background, 11px uppercase

**Navigation Architecture Note:**
Story 2.2 implemented with top horizontal navigation (Dashboard, Clients, Meetings, Settings in header). Reference UI shows left sidebar navigation. This is intentional for rapid MVP delivery. Navigation will be refactored in Story 2.9 to match reference design.

**Estimated Effort:** 1 day

---

### Story 2.3: Add/Edit Client Modal

**STATUS:** ✅ COMPLETE

**As a** user
**I want to** add new clients and edit existing ones via a simple form
**So that** I can maintain accurate client information

**Acceptance Criteria:**
- [x] "+ Add Client" opens modal with form
- [x] Form fields: Name*, Company, Role, Email, Phone, Website, LinkedIn URL (* = required)
- [x] Real-time validation (Zod)
- [x] Error messages inline (e.g., "Invalid email format")
- [x] "Save" button disabled until form valid
- [x] Cancel button closes modal (confirm if changes made)
- [x] Edit mode: Pre-fill form with existing data
- [x] Success toast: "Client added successfully"
- [x] Auto-close modal on save
- [x] Free tier warning: "You've reached your client limit (3/3). Upgrade to Pro for 50 clients."

**Form Validation:**
- Name: 2-100 characters, required
- Email: Valid email format (optional)
- Website/LinkedIn: Valid URL format (optional)

**Estimated Effort:** 1 day

---

### Story 2.4: Client Search & Filter

**As a** user
**I want to** search and filter my clients
**So that** I can quickly find specific clients

**Acceptance Criteria:**
- [ ] Search bar above client grid
- [ ] Search by: Client name, Company name (case-insensitive)
- [ ] Debounced search (300ms delay)
- [ ] Filter by tags (if tags exist)
- [ ] Sort options: Name (A-Z), Last Meeting (recent first), Date Added (newest first)
- [ ] Empty search result: "No clients found matching '[query]'"
- [ ] Clear search button (X icon)
- [ ] Search persists in URL query params (shareable)

**Performance:**
- Client-side search for <50 clients
- Server-side search if >50 clients (future)

**Estimated Effort:** 0.5 days

---

### Story 2.5: Client Tags & Labels

**STATUS:** ✅ COMPLETE

**As a** user
**I want to** add tags to clients (e.g., VIP, Active, On Hold)
**So that** I can categorize and filter clients

**Acceptance Criteria:**
- [x] Tags stored as TEXT[] array in clients table (PostgreSQL array type)
- [x] Add tag input on client edit form
- [x] Tag autocomplete (suggest existing tags)
- [x] Tag pills displayed on client card
- [x] Free tier: Max 3 tags per client
- [x] Pro tier: Max 50 tags per client
- [x] Predefined tags: "VIP", "High Priority", "On Hold", "Active", "Inactive"
- [x] Custom tags allowed (user-generated)
- [x] Click tag on client card → Filter by that tag
- [x] Tag colors: Auto-assigned from palette
- [x] XSS prevention: Sanitize all tag input
- [x] Accessibility: Keyboard navigation, ARIA labels

**Tag Design:**
- Pill shape (border-radius: 12px)
- Small text (11px)
- Subtle background colors

**Estimated Effort:** 1 day (updated from 0.5 days due to accessibility + security requirements)

**Validation Notes:**
- Database schema corrected: TEXT[] (not JSONB)
- Security requirements added (XSS prevention)
- Accessibility requirements added
- Comprehensive testing plan included
- Task 0 added for database migration verification

---

### Story 2.6: Client Detail View (Enhanced)

**As a** user
**I want to** view detailed client information with action items tracking
**So that** I can see all context and follow-ups for specific client

**Acceptance Criteria:**
- [ ] Client detail page: `/clients/[id]`
- [ ] Header: Back button, Client name, Role/Company, Tags, Action buttons (Prep for Meeting, Edit, Delete)
- [ ] **Main Content (Left 2/3):**
  - [ ] Tabbed interface: Overview | Meeting History | Notes & Decisions
  - [ ] Overview tab: Client info + AI overview placeholder
  - [ ] Meeting History tab: Empty state ("No meetings yet")
  - [ ] Notes & Decisions tab: Rich text editor (Story 2.7)
- [ ] **Action Items Sidebar (Right 1/3):**
  - [ ] Title: "Action Items" with count badge
  - [ ] List with checkboxes (check → strikethrough + gray)
  - [ ] Each item: Description, due date badge
  - [ ] Empty state: "No action items yet"
  - [ ] "+ Add Action Item" button (manual creation)
- [ ] **Next Steps Section (Below Action Items):**
  - [ ] Title: "Next Steps"
  - [ ] Bulleted list (manual entry initially, AI in Epic 4)
  - [ ] Placeholder: "Next steps will appear after logging meetings"
- [ ] **Responsive:** Desktop 2-column, tablet/mobile stacked
- [ ] 404 handling, RLS access control

**Layout:**
```
┌─────────────────────────────────┬──────────────────┐
│ ← Back   Client Name            │  ACTION ITEMS (3)│
│ Tabs: Overview | Meeting        │  [ ] Task 1      │
│       History | Notes            │  [✓] Task 2      │
│                                  │  + Add Item      │
│ [Tab Content]                    ├──────────────────┤
│                                  │  NEXT STEPS      │
│                                  │  • Step 1        │
└──────────────────────────────────┴──────────────────┘
```

**Technical Notes:**
- Action items: Manual CRUD, stored in `action_items` table
- Next steps: Stored in `clients.next_steps` JSONB field
- Epic 3 will populate meeting history tab
- Epic 4 will add AI-generated next steps

**Estimated Effort:** 2 days (up from 1 day)

---

### Story 2.7: Manual Notes (Rich Text)

**As a** user
**I want to** add manual notes to client cards
**So that** I can capture information not from meetings

**Acceptance Criteria:**
- [ ] Notes field in clients table (TEXT, nullable)
- [ ] Notes tab on client detail page
- [ ] Rich text editor: Bold, italic, lists, links (using Tiptap or similar)
- [ ] Auto-save every 5 seconds (debounced)
- [ ] Save indicator: "Saving...", "Saved", "Error saving"
- [ ] Character limit: 50,000 characters
- [ ] Markdown export option
- [ ] Notes searchable via client search

**Editor Features:**
- Bold, Italic, Underline
- Bullet lists, Numbered lists
- Links
- Headings (H1-H3)
- No images (to keep simple)

**Estimated Effort:** 0.5 days

---

### Story 2.8: Client Deletion & Cascading

**As a** user
**I want to** delete clients I no longer work with
**So that** I can keep my client list clean

**Acceptance Criteria:**
- [ ] Delete button in client detail dropdown menu
- [ ] Confirmation dialog: "Are you sure? This will delete [Client Name] and all associated meetings, notes, and action items. This action cannot be undone."
- [ ] Checkbox: "I understand this is permanent"
- [ ] Delete button enabled only after checkbox checked
- [ ] Cascade delete: meetings, action_items, embeddings (vector data), notes
- [ ] Success toast: "Client deleted successfully"
- [ ] Redirect to clients dashboard
- [ ] Undo option (30-second window before hard delete - future enhancement)

**Database:**
- Cascade delete enforced at DB level (ON DELETE CASCADE)
- Also delete vector embeddings from pgvector

**Estimated Effort:** 0.5 days

---

### Story 2.9: Navigation Refactor (Left Sidebar)

**As a** user
**I want** a left sidebar navigation matching reference design
**So that** navigation is consistent with modern SaaS patterns

**Acceptance Criteria:**
- [ ] Left sidebar replaces top horizontal nav
- [ ] Sidebar layout (desktop ≥1024px):
  - Fixed left, 240px width
  - MeetSolis logo at top
  - Vertical nav: Clients, Meetings, Assistant, Settings (icons + labels)
  - Active state: #001F3F background, white text
  - User profile at bottom
- [ ] Mobile (<1024px):
  - Hamburger menu opens overlay sidebar
  - Backdrop dismisses overlay
  - Auto-close on route change
- [ ] Main content adjusts: `margin-left: 240px` on desktop
- [ ] Keyboard shortcuts maintained (Ctrl+Shift+C, Ctrl+M, etc)
- [ ] Smooth transition: No broken states, all pages work

**Migration Strategy:**
1. Create `LeftSidebar.tsx` component
2. Update `DashboardLayout.tsx` to use sidebar
3. Add nav items: Clients, Meetings (Epic 3), Assistant (Epic 4), Settings
4. Deprecate `Navigation.tsx` (don't delete yet)
5. Test all pages

**Design Specs:**
- Width: 240px (desktop), 280px (mobile overlay)
- Active item: #001F3F bg, 4px left orange accent
- Icon: 20px, Label: 14px medium
- Padding: 12px vertical, 16px horizontal

**Estimated Effort:** 1.5 days

**Priority:** P1 (Nice to have, not MVP blocker)

---

## Epic Success Criteria

**Functional:**
- [ ] Users can create, view, edit, delete clients
- [ ] Free tier: 3 clients max enforced
- [ ] Pro tier: 50 clients max enforced
- [ ] Client dashboard loads <500ms (50 clients)
- [ ] Search returns results <200ms
- [ ] Mobile responsive (works on iPhone/Android)

**Technical:**
- [ ] All API routes have error handling
- [ ] RLS policies prevent cross-user access
- [ ] Input validation prevents SQL injection
- [ ] All UI states handled (loading, empty, error)

**User Experience:**
- [ ] New user can add first client in <1 minute
- [ ] Dashboard feels fast and responsive
- [ ] No confusing error messages
- [ ] Clear upgrade prompts for free tier limits

---

## Technical Architecture

### Database Schema

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  linkedin_url TEXT,

  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  notes TEXT,

  -- AI-Generated (Epic 4)
  ai_overview TEXT,
  ai_generated_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  INDEX idx_clients_user_id (user_id),
  INDEX idx_clients_created_at (created_at DESC),

  -- Constraints
  CONSTRAINT clients_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own clients"
  ON clients
  FOR ALL
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### API Routes

```
/api/clients
  GET    - List all clients (with pagination, search, filters)
  POST   - Create new client

/api/clients/[id]
  GET    - Get client details
  PUT    - Update client
  DELETE - Delete client (with cascade)

/api/clients/[id]/notes
  PUT    - Update notes (auto-save endpoint)
```

### Components

```
/components/clients/
  ClientCard.tsx                  - Single client card
  ClientGrid.tsx                  - Grid layout of cards
  ClientAddModal.tsx              - Add/Edit client modal
  ClientDetail.tsx                - Client detail page layout
  ClientDetailLayout.tsx          - 2-column responsive wrapper (Story 2.6)
  ClientActionItemsSidebar.tsx    - Action items sidebar (Story 2.6)
  ActionItemCard.tsx              - Individual action item checkbox (Story 2.6)
  ClientNextSteps.tsx             - Next steps section (Story 2.6)
  MeetingHistoryTab.tsx           - Meeting history empty state (Story 2.6)
  ClientNotes.tsx                 - Rich text notes editor
  ClientTags.tsx                  - Tag management component
  ClientSearch.tsx                - Search & filter bar

/components/dashboard/
  Navigation.tsx                  - Top nav (deprecated in Story 2.9)
  LeftSidebar.tsx                 - Left sidebar nav (Story 2.9)
```

---

## Testing Checklist

**Unit Tests:**
- [ ] Client validation schemas (Zod)
- [ ] API route handlers (create, update, delete)
- [ ] Tag manipulation functions

**Integration Tests:**
- [ ] Create client → appears in list
- [ ] Edit client → changes saved
- [ ] Delete client → removed from list
- [ ] Free tier limit enforced (can't create 4th client)

**E2E Tests (Playwright):**
- [ ] User journey: Sign up → Add client → View client → Edit → Delete
- [ ] Search clients by name
- [ ] Filter by tags

---

## Dependencies

**External:**
- Supabase (database, RLS)
- Clerk (authentication)
- Zod (validation)
- Tiptap (rich text editor)

**Internal:**
- Epic 1 complete (auth, database infrastructure)
- UI components (Shadcn: Button, Input, Modal, Badge, etc.)

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Free tier limit confusion** | Medium | Clear messaging, upgrade prompts |
| **Slow client list (100+ clients)** | Low | Pagination, client-side caching |
| **Rich text editor complexity** | Medium | Use proven library (Tiptap), keep features minimal |
| **Client deletion regret** | Low | Add undo feature (30-sec window) in future |

---

## Definition of Done

- [ ] All stories completed and tested
- [ ] No P0/P1 bugs
- [ ] Code reviewed
- [ ] Database migrations run (dev + staging)
- [ ] RLS policies tested (no data leakage)
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Accessibility tested (keyboard nav, screen reader)
- [ ] Performance acceptable (<500ms dashboard load)
- [ ] User can complete full client CRUD flow

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-01-07 | 1.0 | Initial epic creation | Sarah (PO) |
| 2026-01-10 | 2.0 | UI/UX alignment with reference screenshots: Added Story 2.9 (sidebar nav), updated Story 2.6 (Action Items sidebar + Next Steps), documented navigation architecture decision | Sarah (PO) |
| 2026-01-11 | 2.1 | Stories 2.1, 2.2, 2.3 marked COMPLETE. Story 2.4 approved for dev (98% acceptance) | Sarah (PO) |
| 2026-01-11 | 2.2 | Story 2.4 marked COMPLETE (100% acceptance) | Sarah (PO) |
| 2026-01-11 | 2.3 | Story 2.5 validated and approved - Fixed DB schema (TEXT[]), added security (XSS), accessibility, migration task | Sarah (PO) |
| 2026-01-12 | 2.4 | Story 2.5 marked COMPLETE - All acceptance criteria met, production build verified | Sarah (PO) |

---

**Next Epic:** [Epic 3: Meeting Memory & Logging →](./epic-3-meeting-memory.md)
