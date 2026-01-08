# User Interface Design Goals

**Version:** 2.0
**Last Updated:** January 5, 2026
**Reference:** Dashboard mockup provided (Clients page)
**Previous Version:** 1.0 (Video conferencing UI) - See git history

---

## Design Philosophy

**Core Principles:**
1. **Simplicity First** - Clean, uncluttered interface
2. **Client-Centric** - Organize around people, not features
3. **Quick Access** - Critical info visible at a glance
4. **Professional** - Business-appropriate aesthetic
5. **Responsive** - Works on desktop, tablet, mobile

**Target Feel:**
- Modern SaaS tool (like Notion, Linear, Folk)
- Professional but approachable
- Data-dense without feeling overwhelming
- Fast and responsive

---

## Layout Structure (Reference-Based)

### Sidebar Navigation (Left, ~200px)

```
┌──────────────────┐
│  ☕ MeetSolace   │  ← Logo/Brand
├──────────────────┤
│                  │
│  👥 Clients      │  ← Active state (bg highlight)
│  📅 Meetings     │
│  🤖 Assistant    │
│                  │
│                  │
│      [space]     │
│                  │
├──────────────────┤
│  ⚙️  Settings    │  ← Bottom
└──────────────────┘
```

**Specifications:**
- Width: 200px fixed (desktop), collapsible on mobile
- Background: Light gray (#F5F5F5 or similar)
- Logo: Top, 48px height
- Nav items: 40px height, icon + label
- Active state: Darker background, bold text
- Hover state: Subtle background change
- Settings: Pinned to bottom

---

### Main Content Area

```
┌─────────────────────────────────────────────────────┐
│  Clients                           [+ Add Client]   │  ← Header
│  Manage your professional relationships and history. │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Client  │  │ Client  │  │ Client  │            │  ← Card Grid
│  │ Card 1  │  │ Card 2  │  │ Card 3  │            │
│  └─────────┘  └─────────┘  └─────────┘            │
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Client  │  │ Client  │  │ Client  │            │
│  │ Card 4  │  │ Card 5  │  │ Card 6  │            │
│  └─────────┘  └─────────┘  └─────────┘            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Specifications:**
- Background: Light beige/tan (#E8E4DD or similar)
- Header: 80px height
- Title: 32px font, bold
- Subtitle: 16px font, gray
- Add button: Dark (#2D2D2D), 40px height, rounded
- Content padding: 32px

---

## Client Card Design (Reference-Based)

### Card Structure

```
┌────────────────────────────────────┐
│  Sarah Chen                        │  ← Name (20px, bold)
│  Product Director at Nexus Design  │  ← Role/Company (14px, gray)
│                                    │
│  Last Meeting        2 days ago    │  ← Metadata
│  [2 ACTIVE PROJECTS]               │  ← Badge (pill style)
└────────────────────────────────────┘
```

**Specifications:**
- **Card:**
  - Width: ~360px (flexible in grid)
  - Height: Auto (~160px)
  - Background: White (#FFFFFF)
  - Border radius: 8px
  - Shadow: Subtle (0 2px 8px rgba(0,0,0,0.08))
  - Padding: 24px
  - Hover: Lift effect (shadow increases, cursor pointer)

- **Client Name:**
  - Font size: 20px
  - Weight: Bold (600)
  - Color: Dark (#1A1A1A)
  - Margin bottom: 4px

- **Role/Company:**
  - Font size: 14px
  - Weight: Regular (400)
  - Color: Gray (#6B7280)
  - Margin bottom: 16px

- **Last Meeting:**
  - Label + Value layout (flex space-between)
  - Font size: 13px
  - Color: Gray (#9CA3AF)
  - Margin bottom: 8px

- **Active Projects Badge:**
  - Background: Light gray (#F3F4F6)
  - Color: Dark gray (#374151)
  - Font size: 11px
  - Weight: Medium (500)
  - Padding: 4px 12px
  - Border radius: 12px (pill)
  - Uppercase

---

## Grid Layout

**Desktop (>1024px):**
- 3 columns
- Gap: 24px
- Max width: 1400px (centered)

**Tablet (768px-1024px):**
- 2 columns
- Gap: 20px

**Mobile (<768px):**
- 1 column
- Gap: 16px
- Full width

---

## Color Palette

### Primary Colors
```
Background:    #E8E4DD (light beige/tan)
Card BG:       #FFFFFF (white)
Text Primary:  #1A1A1A (near black)
Text Secondary:#6B7280 (gray)
Text Tertiary: #9CA3AF (light gray)
```

### Accent Colors
```
CTA Button:    #2D2D2D (dark gray/black)
Button Hover:  #1A1A1A (darker)
Badge BG:      #F3F4F6 (light gray)
Badge Text:    #374151 (medium gray)
```

### Semantic Colors
```
Success:       #10B981 (green)
Warning:       #F59E0B (orange)
Error:         #EF4444 (red)
Info:          #3B82F6 (blue)
```

---

## Typography

### Font Family
**Primary:** Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
**Monospace:** 'Fira Code', 'Courier New', monospace (for code/data)

### Font Sizes
```
Heading 1:  32px  (Page titles)
Heading 2:  24px  (Section headers)
Heading 3:  20px  (Card titles, client names)
Body:       16px  (Descriptions, main text)
Small:      14px  (Metadata, subtitles)
Tiny:       13px  (Labels, timestamps)
Micro:      11px  (Badges, tags)
```

### Font Weights
```
Bold:       600  (Headings, client names)
Medium:     500  (Badges, emphasis)
Regular:    400  (Body text)
```

---

## Page-Specific Designs

### 1. Clients Page (Main Dashboard - AS SHOWN IN REFERENCE)

**Elements:**
- Header: "Clients" + subtitle + Add button
- Client cards grid (as shown in reference)
- Empty state: "No clients yet. Add your first client to get started."
- Hover state: Card lifts, cursor changes to pointer
- Click: Navigate to client detail page

**States:**
- **Loading:** Skeleton cards (3x shimmer placeholders)
- **Empty:** Empty state with illustration + CTA
- **Populated:** Grid of client cards
- **Error:** Error message with retry button

---

### 2. Client Detail Page

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  ← Back to Clients                  [Prepare] [•••]│  ← Header
├────────────────────────────────────────────────────┤
│  Sarah Chen                                        │
│  Product Director at Nexus Design                  │
│  [VIP] [Active]                                    │  ← Tags
├────────────────────────────────────────────────────┤
│  ┌─ Overview ──┐ ┌─ Meetings ──┐ ┌─ Notes ──┐    │  ← Tabs
│  │             │ │              │ │          │    │
│  │  AI-gen     │ │  Meeting     │ │  Manual  │    │
│  │  summary    │ │  history     │ │  notes   │    │
│  │             │ │              │ │          │    │
│  └─────────────┘ └──────────────┘ └──────────┘    │
│                                                    │
│  ┌─ Action Items ──────────────────────────────┐  │
│  │  [ ] Follow up on pricing - Due: Jan 10     │  │
│  │  [✓] Send proposal - Done                   │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

**Sections:**
- Back button + Prepare button + Options menu
- Client name, role, tags
- Tabbed interface: Overview, Meetings, Notes, Actions
- Action items always visible at bottom

---

### 3. Meetings Page

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  Meetings                           [+ Log Meeting]│
│  Your meeting history across all clients.          │
├────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐ │
│  │  📅 Jan 3, 2026                              │ │
│  │  Sarah Chen · Product Planning Session       │ │
│  │  💬 2 key discussions  ✅ 3 tasks  🕐 45 min │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  📅 Jan 1, 2026                              │ │
│  │  Marcus Thorne · Q1 Strategy Review          │ │
│  │  💬 5 key discussions  ✅ 1 task  🕐 60 min  │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

**Meeting Card:**
- Date badge
- Client name + meeting title
- Icons + counts: discussions, tasks, duration
- Click: View meeting detail

---

### 4. Assistant Page (AI Chat)

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  Assistant                           [New Chat]    │
│  Ask anything about your clients and meetings.     │
├────────────────────────────────────────────────────┤
│  ┌─ Recent Chats ──┐  ┌─ Chat Window ──────────┐ │
│  │                  │  │  You:                  │ │
│  │  Chat 1          │  │  What did I promise... │ │
│  │  Chat 2          │  │                        │ │
│  │  Chat 3          │  │  Assistant:            │ │
│  │                  │  │  In your last meeting..│ │
│  │                  │  │                        │ │
│  └──────────────────┘  │  [Your message...]     │ │
│                        └────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

**Features:**
- Chat history sidebar (left)
- Main chat window (right)
- ChatGPT-style interface
- Pre-built question templates (buttons)
- Typing indicator
- Source citations (links to meetings)

---

## Component Library (Reuse Existing)

**From Epic 1 (Shadcn UI):**
- ✅ Button, Input, Label
- ✅ Card, Dialog, Dropdown
- ✅ Select, Tooltip, Badge
- ✅ Avatar, Skeleton
- ✅ Accordion, Tabs, Separator

**New Components Needed:**
- ClientCard (custom)
- MeetingCard (custom)
- ActionItemList (custom)
- ChatInterface (custom)
- PrepBrief (custom)

---

## Interaction Patterns

### Hover States
- Cards: Lift (translateY -4px, shadow increase)
- Buttons: Background darken 10%
- Links: Underline

### Loading States
- Skeleton screens (not spinners)
- Shimmer effect
- Optimistic UI updates

### Empty States
- Illustration + message + CTA
- Friendly, encouraging tone
- Clear next action

### Error States
- Red accent
- Error message + reason
- Retry button or contact support link

---

## Responsive Behavior

### Desktop (>1024px)
- Full sidebar visible
- 3-column grid
- All features accessible

### Tablet (768-1024px)
- Collapsible sidebar (hamburger menu)
- 2-column grid
- Touch-friendly tap targets

### Mobile (<768px)
- Bottom navigation bar (instead of sidebar)
- 1-column layout
- Swipe gestures
- Full-screen modals

---

## Accessibility

**WCAG 2.1 AA Compliance:**
- ✅ Color contrast 4.5:1 minimum
- ✅ Keyboard navigation (Tab, Enter, Esc)
- ✅ ARIA labels on interactive elements
- ✅ Focus indicators visible
- ✅ Screen reader friendly
- ✅ Alt text on images

**Keyboard Shortcuts (Power Users):**
- `C` - Create new client
- `M` - Log new meeting
- `/` - Focus search
- `Esc` - Close modal
- `Cmd/Ctrl + K` - Command palette

---

## Animation & Motion

**Principles:**
- Subtle, purposeful
- 200-300ms duration
- Ease-in-out timing
- Reduce motion for accessibility

**Animations:**
- Card hover: 200ms ease-out
- Modal open: 250ms ease-in-out (scale + fade)
- Page transitions: 200ms fade
- Loading: Pulse/shimmer (infinite)

---

**Implementation Priority:**
1. **Week 2:** Clients page + client card
2. **Week 3:** Meetings page + AI assistant
3. **Week 4:** Polish + responsive + accessibility

---

**Next:** [Epic 2: Client Card System →](./epic-2-client-card-system.md)
