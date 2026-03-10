# UI Design Principles

**Version:** 3.0
**Last Updated:** March 8, 2026
**ICP:** Executive coaches (solo, 10–25 clients)

---

## Design Philosophy

MeetSolis is built for executive coaches who need to feel **prepared, confident, and in control** before every coaching session. The UI must reflect the professionalism of executive coaching itself.

### Core Principles

1. **Coaching-First** — Organize around clients and sessions, not features or metrics
2. **Simplicity** — Clean, uncluttered interface; every element earns its place
3. **Zero In-Meeting Friction** — Critical info accessible in seconds, not clicks
4. **Human-Centered AI** — Solis surfaces insights without overwhelming; coach stays in control
5. **Mobile-First Context** — Coaches review client context on phone before sessions
6. **Privacy-First** — Client data feels secure; no social/sharing affordances

### Target Feel

- Modern SaaS tool (like Notion, Linear, Folk)
- Professional, warm, and trustworthy
- Data-dense without feeling overwhelming
- Fast and responsive

---

## Brand & Visual Identity

### Color Palette

**Primary Colors**
```
Background:    #E8E4DD  (light beige/tan — warm, not clinical)
Card BG:       #FFFFFF  (white)
Text Primary:  #1A1A1A  (near black)
Text Secondary:#6B7280  (gray)
Text Tertiary: #9CA3AF  (light gray)
```

**Accent Colors**
```
CTA Button:    #2D2D2D  (dark gray/black)
Button Hover:  #1A1A1A  (darker)
Badge BG:      #F3F4F6  (light gray)
Badge Text:    #374151  (medium gray)
Sidebar BG:    #F5F5F5  (light gray)
```

**Semantic Colors**
```
Success:       #10B981  (green)
Warning:       #F59E0B  (orange)
Error:         #EF4444  (red)
Info:          #3B82F6  (blue)
```

---

## Typography

### Font Family
**Primary:** Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
**Monospace:** 'Fira Code', 'Courier New', monospace (for code/data only)

### Scale
```
Heading 1:  32px  Bold (600)    — Page titles
Heading 2:  24px  Bold (600)    — Section headers
Heading 3:  20px  Bold (600)    — Card titles, client names
Body:       16px  Regular (400) — Descriptions, main text
Small:      14px  Regular (400) — Metadata, subtitles
Tiny:       13px  Regular (400) — Labels, timestamps
Micro:      11px  Medium (500)  — Badges, tags (uppercase)
```

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

### Animation & Motion
- Subtle and purposeful
- 200–300ms duration, ease-in-out
- Reduce motion for accessibility (prefers-reduced-motion)
- Card hover: 200ms ease-out
- Modal open: 250ms ease-in-out (scale + fade)
- Page transitions: 200ms fade

---

## Responsive Behavior

### Desktop (>1024px)
- Full sidebar visible (200px fixed)
- 3-column client card grid
- All features accessible

### Tablet (768–1024px)
- Collapsible sidebar (hamburger menu)
- 2-column grid
- Touch-friendly tap targets (44px min)

### Mobile (<768px)
- Bottom navigation bar (replaces sidebar)
- 1-column layout
- Swipe gestures
- Full-screen modals

---

## Accessibility (WCAG 2.1 AA)

- ✅ Color contrast 4.5:1 minimum
- ✅ Keyboard navigation (Tab, Enter, Esc)
- ✅ ARIA labels on all interactive elements
- ✅ Focus indicators visible
- ✅ Screen reader friendly
- ✅ Alt text on images

### Keyboard Shortcuts (Power Users)
- `C` — Create new client
- `U` — Upload session transcript
- `/` — Focus search
- `Esc` — Close modal
- `Cmd/Ctrl + K` — Command palette

---

**Next:** [UI Components & Pages →](./ui-components.md)
