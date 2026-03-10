# UI Components & Pages

**Version:** 3.0
**Last Updated:** March 8, 2026
**ICP:** Executive coaches (solo, 10–25 clients)

See [UI Design Principles](./ui-design-principles.md) for colors, typography, and interaction patterns.

---

## Navigation / Sidebar

### Left Sidebar (~200px, desktop)

```
┌──────────────────┐
│  ☕ MeetSolis    │  ← Logo/Brand
├──────────────────┤
│                  │
│  👥 Clients      │  ← Active state
│  🤖 Intelligence │
│                  │
│      [space]     │
│                  │
├──────────────────┤
│  ⚙️  Settings    │  ← Pinned bottom
└──────────────────┘
```

**Specs:**
- Width: 200px fixed (desktop), collapsible on mobile
- Background: `#F5F5F5`
- Logo: Top, 48px height
- Nav items: 40px height, icon + label
- Active: Darker background, bold text
- Hover: Subtle background change
- Settings: Pinned to bottom

**Routes (no /dashboard prefix):**
- `/clients` — Client grid
- `/intelligence` — Solis AI assistant
- `/settings` — Profile & billing

---

## Page Specs

### 1. `/clients` — Clients Page

```
┌─────────────────────────────────────────────────────┐
│  Clients                           [+ Add Client]   │
│  Manage your coaching clients and session history.  │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Client  │  │ Client  │  │ Client  │            │
│  │ Card 1  │  │ Card 2  │  │ Card 3  │            │
│  └─────────┘  └─────────┘  └─────────┘            │
└─────────────────────────────────────────────────────┘
```

**Header:**
- Title: "Clients" (32px, bold)
- Subtitle: "Manage your coaching clients and session history." (16px, gray)
- Add button: Dark (#2D2D2D), 40px height, rounded

**States:** Loading (skeleton), Empty (illustration + CTA), Populated (grid), Error (message + retry)

**Grid:**
- Desktop (>1024px): 3 columns, 24px gap, max-width 1400px
- Tablet (768–1024px): 2 columns, 20px gap
- Mobile (<768px): 1 column, 16px gap

---

### 2. `/clients/[id]` — Client Detail Page

```
┌────────────────────────────────────────────────────┐
│  ← Back to Clients              [Ask Solis] [•••]  │
├────────────────────────────────────────────────────┤
│  Sarah Chen                                        │
│  Product Director at Nexus Design                  │
│  Goal: Executive presence development              │
│  Coaching since Jan 2025                           │
├────────────────────────────────────────────────────┤
│  [Upload Session Transcript]                       │
│                                                    │
│  ┌─ Session (Jan 3, 2026) ────────────────────┐   │
│  │  Q1 Leadership Review                       │   │
│  │  Summary snippet...                         │   │
│  │  [leadership] [feedback] | 2 action items   │   │
│  └─────────────────────────────────────────────┘   │
│                                                    │
│  ┌─ Pending Actions ──────────────────────────┐   │
│  │  [ ] Follow up on 360 feedback              │   │
│  │  [ ] Send reading list                      │   │
│  └─────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

**Sections:**
1. Back button + Ask Solis button + Options menu (edit, delete)
2. Client header: name, role/company, coaching goal, start date
3. Upload session transcript CTA (prominent when no sessions)
4. Session timeline (reverse-chronological)
5. Pending actions section

---

### 3. `/intelligence` — Solis AI Assistant

```
┌────────────────────────────────────────────────────┐
│  Intelligence                                      │
│  Ask Solis about any client or session.            │
├────────────────────────────────────────────────────┤
│  [All Clients ▼]  (optional client scope filter)   │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  Ask Solis...                           [Send]│ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  Solis:                                            │
│  Based on your sessions with Sarah Chen...         │
│  [citation: Q1 Leadership Review, Jan 3, 2026]     │
│                                                    │
│  50 of 50 lifetime queries used. [Upgrade to Pro]  │
└────────────────────────────────────────────────────┘
```

**Features:**
- Stateless per query (no persistent chat history)
- Optional client scope filter
- Response includes session citations
- Usage counter (lifetime for free / monthly for pro)
- Upgrade CTA when limit reached

---

### 4. `/settings` — Settings Page

**Sections:**
- Profile (display name, email via Clerk)
- Subscription status (Free or Pro $99/mo)
- Billing management (Stripe customer portal link)
- Usage stats (transcripts used, queries used)
- Danger zone (delete account)

---

## Component Specs

### ClientCard

```
┌────────────────────────────────────┐
│  Sarah Chen                        │  ← Name (20px, bold, #1A1A1A)
│  Product Director at Nexus Design  │  ← Role/Company (14px, #6B7280)
│                                    │
│  Goal: Executive presence dev      │  ← Coaching goal (14px, italic)
│  Last Session        2 days ago    │  ← Metadata (13px, #9CA3AF)
│  [3 PENDING ACTIONS]               │  ← Badge (pill, #F3F4F6)
└────────────────────────────────────┘
```

**Card specs:**
- Width: ~360px (flexible in grid)
- Height: Auto (~160px)
- Background: `#FFFFFF`
- Border radius: 8px
- Shadow: `0 2px 8px rgba(0,0,0,0.08)`
- Padding: 24px
- Hover: `translateY(-4px)`, shadow increase, cursor pointer

**Fields displayed:**
- `name` — required
- `role` + `company` — optional, combined
- `goal` — coaching goal (v3 field)
- `last_session` — relative timestamp ("2 days ago")
- `pending_action_count` — badge, hidden if 0

---

### SessionCard (inside Client Detail)

**Fields displayed:**
- Session date (prominent)
- Session title / topic
- AI-generated summary snippet (2–3 lines)
- Topic tags (from AI extraction)
- Action item count badge
- Expand/collapse for full summary

---

### SessionTimeline

- Reverse-chronological list of SessionCards
- Upload CTA button at top
- Empty state: "No sessions yet. Upload your first transcript."

---

### ActionItemList

- Checkbox + item text + status badge
- Statuses: `To Prepare` / `Promised` / `Done`
- Inline status toggle
- Add manual item CTA

---

### SolisPanel (Client Detail — inline CTA)

- "Ask Solis about [Client Name]" button
- Routes to `/intelligence` with client pre-selected

---

### SessionUploadModal

**Fields:**
- Session date (date picker)
- Session title (text input, optional)
- Upload method: text paste OR audio file upload
- Audio: Deepgram Nova-2 auto-transcription (Pro only or free tier limits)
- Submit → triggers AI summary generation

---

## Component Library (Reuse Shadcn)

**From Epic 1:**
- ✅ Button, Input, Label
- ✅ Card, Dialog, Dropdown
- ✅ Select, Tooltip, Badge
- ✅ Avatar, Skeleton
- ✅ Accordion, Tabs, Separator

**Custom (built in Epics 2–4):**
- ClientCard
- SessionCard
- SessionTimeline
- ActionItemList
- SolisPanel
- SessionUploadModal
- UsageBadge (free tier counter)
- UpgradePromptModal

---

## Onboarding Flow (5 Steps)

1. **Welcome** — "MeetSolis helps executive coaches remember every client's context"
2. **Add First Client** — Coaching-specific form (name, role, goal, start date)
3. **Upload Transcript** — Pre-loaded sample coaching transcript available
4. **View Summary** — Highlight AI-generated summary, key topics, action items
5. **Try Solis** — Ask a sample question about the demo session

---

**Pricing displayed in UI:** Free ($0) | Pro ($99/mo or $948/yr — save 20%)

---

**Next:** [Epic 2: Client Card System →](./epic-2-client-card-system.md)
