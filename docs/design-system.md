# MeetSolis Design System

Extracted from the production landing page. Use this as the single source of truth for all UI/UX work across the marketing site and app.

---

## Colors

### Brand Greens
| Token | Value | Usage |
|---|---|---|
| `--green-accent` | `rgb(55, 234, 158)` / `#37ea9e` | Primary CTA buttons, highlights, active states |
| `--green-light` | `rgb(106, 235, 201)` / `#6aebc9` | Glow effects, secondary accents, green bar gradient |
| `--green-medium` | `rgb(28, 211, 163)` / `#1cd3a3` | Icons, interactive elements |
| `--green-dark` | `rgb(22, 167, 129)` / `#16a780` | Text on light, badge text, section labels |

### Neutrals
| Token | Value | Usage |
|---|---|---|
| Black | `#000000` | Primary text, dark buttons, dark section backgrounds |
| White | `#ffffff` | Cards, light buttons, light section backgrounds |
| Page BG | `rgb(248, 249, 250)` | Default page/section background |
| Muted Text | `rgb(78, 91, 109)` / `#4e5b6d` | Nav links, secondary text |
| Dark Muted | `rgb(39, 50, 65)` / `#273241` | Footer text, dark gradient end |
| Light Gray | `rgb(155, 165, 181)` | Placeholder icons, tertiary text |

### Borders
| Token | Value | Usage |
|---|---|---|
| `--border-color` | `rgb(209, 213, 221)` | Primary borders, navbar border |
| `--border-light` | `rgb(233, 235, 239)` | Subtle dividers, testimonial cards |
| Card Border | `rgb(228, 228, 228)` | White card borders |
| Off-white BG | `rgb(250, 250, 251)` | Integration card backgrounds |

### Dark Section Colors
| Value | Usage |
|---|---|
| `#000000` | Dark section/card background |
| `#273241` | Hero/CTA gradient end color |
| `rgba(26, 29, 33, 0.96)` | Frosted dark card background |

### Transparency Scale
| Value | Usage |
|---|---|
| `rgba(255,255,255,0.08)` | Subtle white borders on dark |
| `rgba(255,255,255,0.2)` | Outline button border on dark |
| `rgba(255,255,255,0.5/0.7)` | Body text on dark backgrounds |
| `rgba(0,0,0,0.1/0.2)` | Subtle borders on light |

---

## Typography

### Fonts
- **Primary**: `'Geist', sans-serif` — all headings and UI
- **Secondary**: `'Plus Jakarta Sans', sans-serif` — fallback body

### Type Scale
| Role | Size | Weight | Letter Spacing | Line Height |
|---|---|---|---|---|
| H1 Hero | 64px | 700 | -4px | 1em |
| H2 Section | 48px | 700 | -3px | 1em |
| H3 Sub-section | 36px | 600 | -0.03em | 1.1em |
| H4 Card title | 24px | 600 | -0.02em | 1em |
| Body Large | 18px | 500 | -0.02em | 1.5em |
| Body / Nav | 16px | 500 | -0.02em | 1.5em |
| Small / Caption | 14px | 400–500 | default | 1.5em |
| Badge / Label | 12px | 400–600 | 0.12em (uppercase) | 1em |
| Micro | 8px | 600 | default | 1em |

---

## Spacing

### Section Padding
| Level | Value | Usage |
|---|---|---|
| Hero / CTA | 96px top+bottom | Primary hero and CTA dark sections |
| Standard Section | 64px top+bottom | Most content sections |
| Content Block | 48px | Inner content containers |
| Card | 36px | Bento cards, feature cards |
| Compact | 24px | Medium padding, card inner |
| Small | 16px | Standard UI padding |

### Container Widths
| Width | Usage |
|---|---|
| `max-w-[1200px]` | Primary container — navbar, hero, metrics, CTA |
| `max-w-[1000px]` | Content sections — features, blog, testimonials |
| `max-w-[700px]` | Narrow content — FAQ |

### Gap Scale
`4px → 6px → 8px → 12px → 16px → 24px → 36px → 48px`

---

## Border Radius
| Value | Usage |
|---|---|
| `32px` | Hero container, dark sections (metrics, CTA) |
| `20px` | Bento cards, blog cards |
| `16px` | Standard cards, image containers |
| `12px` | Buttons, testimonial cards, small cards |
| `8px` | Smaller UI elements |
| `6px` | Section badges / labels |
| `4px` | Chart bars (top corners only) |
| `100%` | Avatars, circular glow elements |

---

## Shadows
| Name | Value | Usage |
|---|---|---|
| Card Light | `rgba(0,0,0,0.05) 0px 2px 2px` | Blog cards, light cards |
| Card Medium | `rgba(119,126,150,0.1) 0px 10px 20px -5px` | Testimonial cards |
| Hero Image | `0 120px 164px -25px rgba(107,110,148,0.12), 0 2px 4px rgba(0,0,0,0.25)` | Hero/CTA feature images |
| Navbar Blur | `backdrop-filter: blur(10px)` | Navbar, frosted cards |
| Glow | `filter: blur(150px)` on colored div | Background glow decorations |

---

## Gradients

### Backgrounds
```css
/* Hero / CTA dark section */
background: linear-gradient(118.66deg, #000000 0%, #273241 100%);

/* Podcast / accent card */
background: linear-gradient(117.06deg, rgb(22,167,129) 0%, rgb(106,235,201) 100%);
```

### Decorative
```css
/* Green bar (bottom accent line) */
background: linear-gradient(90deg, #000, #6aebc9, #000);

/* Dot pattern section background */
background: radial-gradient(rgba(233,235,239,0) 2.1px, transparent 2.9px);
background-size: 60px 60px;

/* Ticker/marquee edge fade */
mask-image: linear-gradient(to right, transparent 0%, black 12.5%, black 87.5%, transparent 100%);
```

---

## Buttons

All buttons share: `border-radius: 12px`, `font-size: 16px`, `font-weight: 500`, `padding: 14px 20px`, `hover: opacity 0.85`

| Variant | Class | BG | Text | Border | Use On |
|---|---|---|---|---|---|
| Primary | `btn-dark` | `#000000` | `#ffffff` | none | Light backgrounds |
| Light | `btn-white` | `#ffffff` | `#000000` | none | Dark backgrounds |
| Accent | `btn-green` | `rgb(55,234,158)` | `#000000` | none | Key CTAs |
| Ghost | `btn-outline-white` | transparent | `#ffffff` | `rgba(255,255,255,0.2)` | Dark backgrounds |

---

## Cards

| Variant | Class | BG | Border | Radius | Usage |
|---|---|---|---|---|---|
| Light Card | `card-white` | `#ffffff` | `1px solid rgb(228,228,228)` | 20px | General content |
| Dark Card | `card-dark` | `#000000` | none | 20px | Dark sections |
| Blog Card | `blog-card` | `#ffffff` | `1px solid rgb(228,228,228)` | 20px | Blog posts |
| Integration | `integration-card` | `rgb(250,250,251)` | none | 16px | App integrations |
| Testimonial | `testimonial-card` | `#ffffff` | `1px solid rgb(233,235,239)` | 12px | Quotes |
| Bento | inline | varies | none | 20px | Feature highlights |

---

## Badges / Labels

### Section Badge (`.section-badge`)
```css
display: inline-flex;
padding: 6px 10px 5px;
border: 1px solid rgb(209, 213, 221);
border-radius: 6px;
font-size: 12px;
font-weight: 400;
letter-spacing: 0.12em;
color: #16a780;
text-transform: uppercase;
```

### Role / Chip Badge
```css
background: linear-gradient(117.58deg, rgba(215,236,236,0.16) 0%, rgba(204,234,234,0) 100%);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 12px;
height: 32px;
padding: 0 12px;
font-size: 12px;
font-weight: 600;
```

---

## Animations

### Keyframes
```css
/* Marquee scroll */
@keyframes ticker {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
/* Duration: 30s linear infinite */

/* Entrance animations — all 0.6s ease forwards */
@keyframes fadeInLeft  { from { opacity:0; transform:translateX(-30px) } to { opacity:1; transform:translateX(0) } }
@keyframes fadeInUp    { from { opacity:0; transform:translateY(30px)  } to { opacity:1; transform:translateY(0) } }
@keyframes fadeInRight { from { opacity:0; transform:translateX(30px)  } to { opacity:1; transform:translateX(0) } }
```

### Utility Classes
```
.animate-fade-in-left   .animate-fade-in-up   .animate-fade-in-right
.delay-100  .delay-200  .delay-300  .delay-400  .delay-500
```

### Transitions
| Element | Value |
|---|---|
| Buttons | `transition: opacity 0.2s` |
| Interactive states | `transition: all 0.2s` |
| FAQ expand | `transition: transform 0.2s` |
| Chart bars | `transition: height 0.3s ease` |

---

## Layout Patterns

### Section Structure
```
<section style={{ padding: '24px', backgroundColor: 'rgb(248,249,250)' }}>
  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px' }}>
    ...
  </div>
</section>
```

### Dark Section
```
<section style={{ padding: '24px', backgroundColor: 'rgb(248,249,250)' }}>
  <div class="metrics-dark | cta-dark" style={{ maxWidth: '1200px', ... }}>
    /* green glow element behind content */
    <div class="green-glow" style={{ width: 'Xpx', height: 'Xpx', position:'absolute' }} />
    ...
  </div>
</section>
```

### Navbar
- `position: fixed`, `top: 0`, `z-index: 50`
- `.nav-blur` — `backdrop-filter: blur(10px)`, `background: rgba(255,255,255,0.9)`, `border-bottom: 1px solid rgb(209,213,221)`
- Max width: `1200px`, padding: `py-3.5 px-6`
- Spacer below: `<div style={{ height: '80px' }} />`

---

## CSS Custom Properties

```css
:root {
  --green-accent:  rgb(55, 234, 158);
  --green-light:   rgb(106, 235, 201);
  --green-medium:  rgb(28, 211, 163);
  --green-dark:    rgb(22, 167, 129);
  --bg-light:      rgb(248, 249, 250);
  --text-muted:    rgb(78, 91, 109);
  --border-color:  rgb(209, 213, 221);
  --border-light:  rgb(233, 235, 239);

  /* Shadcn / Tailwind tokens */
  --background:    210 17% 98%;   /* rgb(248,249,250) */
  --foreground:    0 0% 0%;       /* #000000 */
  --primary:       0 0% 0%;       /* #000000 */
  --accent:        152 79% 57%;   /* rgb(55,234,158) */
  --border:        216 14% 85%;   /* rgb(209,213,221) */
  --muted-foreground: 213 17% 37%; /* rgb(78,91,109) */
  --radius:        0.75rem;
}
```

---

## Do Not Use

- Any `teal-*` Tailwind classes (old brand)
- Any `yellow-*` or `amber-*` for brand purposes (semantic warning use only)
- Inline `color: teal` or hex values from the old palette
- `font-family: Outfit, DM Sans` (old fonts — replaced by Geist)
