# Epic 7: Onboarding Overhaul & Client Communication

**Version:** 1.0
**Status:** Not Started
**Priority:** P0 (Critical — Activation + Retention)
**Target:** Phase "Onboarding + Polish" (Days 14–15 per BRAINSTORM.md §8, but some stories can run in parallel with Epic 6)
**Dependencies:** Epic 2 (Client Cards), Epic 3 (Session Memory), Epic 4 (Solis Intelligence), Story 6.1 (Calendar — needed for Path A Step 5)
**Supersedes:** Story 5.5 (original generic 5-step onboarding — replaced entirely by this epic)
**Last Updated:** 2026-05-11

---

## Epic Overview

Deliver a best-in-class onboarding that gets coaches to their "aha moment" in under 5 minutes, update all tier limits and terminology to match revised BRAINSTORM decisions, build the AI Intelligence Strip on Client Cards, and enable post-session client communication.

**Two engineered aha moments (from BRAINSTORM.md §13):**

> **Path A:** *"It already knows my clients better than my CRM does."*
> Triggered after AI extracts client cards from uploaded notes — coach scrolls the list and sees recurring themes + breakthroughs already identified.

> **Path B:** *"Wait, this would tell me all this before every session?"*
> Triggered when coach explores demo client Alex Rivera and sees the Coach Brief preview — realizes this is what they'd get before every real session.

**Why both aha moments matter:**
> "Solo coaches are time-poor. They evaluate SaaS in 5 minutes. If aha doesn't hit by minute 5, they bounce and forget. Path A and Path B both engineered for sub-5-minute aha." — BRAINSTORM.md §13

**What this epic covers:**
1. Tier limit updates (10 sessions, 50 queries) + "Sessions" terminology rename everywhere in UI
2. Client Card AI Intelligence Strip (recurring theme, recent breakthrough, current focus)
3. Onboarding Path A — historical data upload → AI extracts Client Cards automatically
4. Onboarding Path B — demo client "Alex Rivera" pre-loaded for fresh coaches
5. Post-session client email (Resend) + clipboard copy export
6. Action items carry-forward + action items everywhere (Client Card, Coach Brief, dashboard)

---

## Existing System Context

**What already exists:**
- Client Card CRUD: `apps/web/src/app/(dashboard)/clients/[id]/page.tsx` (Epic 2, Story 2.6)
- Session upload + AI summary: `apps/web/src/lib/sessions/summarize-session.ts` (Epic 3)
- Action items table and tracking: Epic 3
- Solis Intelligence RAG: `apps/web/src/lib/ai/solis.ts` (Story 4.1)
- Tier enforcement: `checkTierLimit` function (Story 5.2)
- Settings page with Preferences tab: `apps/web/src/app/(dashboard)/settings/page.tsx` (Story 5.4)
- Resend: already configured for transactional emails (Story 5.1) — use same integration
- Main dashboard: `apps/web/src/app/(dashboard)/page.tsx`
- UI design system: dark deep teal/green theme in `apps/web/src/app/globals.css` (NOT old PRD earth tones)
- Client Card types: `packages/shared/src/types/`

**Key constraint:** BRAINSTORM.md is the source of truth. Where it conflicts with old epic/story specs, BRAINSTORM wins. Story 5.5 is superseded entirely.

---

## Feature Decisions (from BRAINSTORM.md §6, §7, §11)

### Updated Free Tier Limits
| Limit | Old (Story 5.2) | New (BRAINSTORM §6) | Reason |
|---|---|---|---|
| Active clients | 3 | 3 | Unchanged |
| Lifetime sessions | 5 | **10** | 5 too few to reach aha moment |
| Solis queries | 75 | **50** | 75 too generous, 50 creates upgrade pressure |
| Auto-transcription bot | ❌ | ❌ | Pro-only, unchanged |

### Terminology (from BRAINSTORM §6)
> "Never use 'transcripts' in UI. Always 'sessions.' Coaches don't think in transcripts — they think in sessions."
- All UI labels, buttons, toasts, emails: "sessions" not "transcripts"
- Database column names can remain (internal, no user impact)
- Env var names can remain (internal config)

### Conversion Logic (upgrade walls — from BRAINSTORM §6)
- Hit 10 lifetime sessions → upgrade wall
- Hit 50 Solis queries → upgrade wall
- Try to enable auto-transcription → upgrade wall
- Try to add 4th client → upgrade wall (unchanged)

### CRM / Export Decisions (from BRAINSTORM §11)
- Phase 1 (this epic, ship at launch): Email to client via Resend + Copy to clipboard
- Phase 2 (post-launch): Notion push
- Phase 3 (post-launch): Zapier webhook
- Skip: native Asana / Monday / ClickUp integrations (Zapier covers all)

---

## Stories

### Story 7.1: Tier Limit Updates + "Sessions" Terminology Rename

**As a** product,
**I need** to update all free tier limits and rename "transcripts" to "sessions" across the entire UI,
**so that** the product matches the revised decisions in BRAINSTORM.md §6 and §7.

**Acceptance Criteria:**

**Limit Updates:**
- [ ] `checkTierLimit` function (Story 5.2): update Free tier `transcript_count` limit constant from `5` → `10`
- [ ] `checkTierLimit`: update Free tier `query_count` limit constant from `75` → `50`
- [ ] `GET /api/usage` route: response `limit` fields updated to reflect new values
- [ ] Settings page (Story 5.4) Usage card: "10 sessions" and "50 queries" displayed
- [ ] Pricing page (Story 5.3): update "5 sessions" → "10 sessions", "75 queries" → "50 queries" in Free tier column
- [ ] Landing page (Story 5.6): same limit updates in pricing section
- [ ] Upgrade prompt copy (Story 5.7 if implemented): update limit numbers in copy
- [ ] Any `const MAX_SESSIONS_FREE = 5` style constants: audit and update

**Terminology Rename ("transcripts" → "sessions"):**
- [ ] Full codebase search: all user-facing strings containing "transcript" / "transcripts" (case-insensitive)
- [ ] Update: all UI button text, section labels, empty states, toast messages, modal copy
- [ ] Update: all email templates in `src/lib/email/` — "transcript" → "session" in email body copy
- [ ] Update: API response fields that are user-facing (e.g. error messages referencing "transcripts")
- [ ] Update: onboarding copy (this epic) — always say "sessions"
- [ ] Do NOT rename: `sessions` DB table (already named correctly), internal column `transcript_count` (internal — renaming causes migration risk with no user benefit), `TRANSCRIPTION_PROVIDER` env var (internal config)
- [ ] After rename: grep for remaining "transcript" instances and confirm all are internal-only

**Files to audit and update:**
- `apps/web/src/lib/tier/check-tier-limit.ts` (or equivalent from Story 5.2) — limit constants
- `apps/web/src/app/api/usage/route.ts` — limit values in response
- `apps/web/src/app/(dashboard)/settings/page.tsx` — Usage card display
- `apps/web/src/app/pricing/page.tsx` — Free tier feature list
- `apps/web/src/app/page.tsx` — landing page pricing section
- `apps/web/src/lib/email/` — all email templates
- Any component referencing "transcript(s)" as user-facing label

**Effort estimate:** 0.5 days

---

### Story 7.2: Client Card AI Intelligence Strip

**As a** coach,
**I want** my Client Card to show AI-generated insights that get richer every session,
**so that** I have a living intelligence layer and MeetSolis becomes irreplaceable.

**Context from BRAINSTORM.md §2 — Bet 1:**
> "Lock-in mechanic: Card gets richer every session. After 10 sessions per client × 15 clients = 150 sessions of intelligence. Coach cannot leave MeetSolis — switching cost = losing the entire intelligence layer they paid to build."
> "AI editability principle (non-negotiable): Every AI-generated field is editable inline. Coach can override anything. AI is assistant, not authority."

**Strip Fields (exact spec from BRAINSTORM §2):**
```
Recurring theme     [AI-detected pattern + frequency, e.g. "Imposter syndrome — 5 of 8 sessions"]
Recent breakthrough [Last notable moment surfaced from session history]
Current focus       [AI-derived from 3 most recent sessions]
Coach note          [Private manual field — NOT AI-generated, never overwritten by AI]
```

**Acceptance Criteria:**

**Data Model:**
- [ ] Add `ai_intelligence_strip JSONB` column to `clients` table via migration
- [ ] Schema: `{ recurring_theme: string, theme_frequency: string, recent_breakthrough: string, current_focus: string, generated_at: string (ISO timestamp) }`
- [ ] Coach note stored separately in `clients.coach_note TEXT` (not in JSONB — manual field, versioned differently)
- [ ] **CRITICAL RULE (non-negotiable, BRAINSTORM §2):** `coach_note` is NEVER generated, overwritten, or touched by AI — not on first generation, not on regeneration, not ever. It is the one field on the card that is 100% the coach's voice. Any future AI feature must explicitly exclude this field.

**Generation:**
- [ ] Strip generated/regenerated automatically after every new session is processed
- [ ] Hook point: end of `src/lib/sessions/summarize-session.ts` — call `generateIntelligenceStrip(clientId)` after session summary saved
- [ ] New function: `src/lib/clients/generate-intelligence-strip.ts`
  - Input: all session summaries + key_topics for this client (full history)
  - Always include 3 most recent sessions verbatim in context
  - Output: structured JSON matching `ai_intelligence_strip` schema
- [ ] AI prompt: must be tested with 10+ real coaching transcripts before ship (BRAINSTORM §9 rule)
- [ ] Output format: specific not generic ("Imposter syndrome — 5 of 8 sessions" not "client has recurring themes")

**Generation timing (from BRAINSTORM §2):**
- [ ] Path A onboarding (Story 7.3): uploads historical data → strip generates immediately for each extracted client after sessions processed
- [ ] Path B onboarding (Story 7.4): demo client Alex Rivera → strip pre-populated in seed data
- [ ] New client, zero sessions → strip shows loading state: "Building your intelligence profile — add your first session to start"
- [ ] After session 1 → strip attempts generation (may be limited with only 1 session)
- [ ] `generated_at` null = never generated → show skeleton/loading UI

**UI on Client Card Detail View (Story 2.6 — `apps/web/src/app/(dashboard)/clients/[id]/page.tsx`):**
- [ ] AI Intelligence Strip section positioned between client header and Session Feed
- [ ] Layout: 4 fields displayed as labeled cards or rows (Recurring Theme, Recent Breakthrough, Current Focus, Coach Note)
- [ ] `theme_frequency` shown as subtle chip/tag alongside theme text: "5 of 8 sessions"
- [ ] Every AI-generated field: click → inline edit mode → save on blur or Enter key
- [ ] Coach Note field: always editable, never AI-generated, clearly labeled "Private — not shared with client"
- [ ] "↻ Refresh insights" button → calls `POST /api/clients/[id]/intelligence-strip` → regenerates from scratch
- [ ] "Updated [X days ago]" timestamp shown below strip
- [ ] Loading skeleton during generation (Shadcn skeleton component, consistent with existing loading patterns)
- [ ] Dark deep teal theme — consistent with current production UI

**API:**
- [ ] `POST /api/clients/[id]/intelligence-strip` — trigger regeneration (Pro and Free)
- [ ] `PATCH /api/clients/[id]/intelligence-strip` — save manual coach edits to individual fields
- [ ] `PATCH /api/clients/[id]/coach-note` — save coach note separately

**Files to create/update:**
- `apps/web/src/app/(dashboard)/clients/[id]/page.tsx` (Story 2.6) — add AI Intelligence Strip section
- `apps/web/src/lib/sessions/summarize-session.ts` — add hook to regenerate strip after session saved
- New: `apps/web/src/lib/clients/generate-intelligence-strip.ts`
- New: `apps/web/src/app/api/clients/[id]/intelligence-strip/route.ts`
- New: `apps/web/src/app/api/clients/[id]/coach-note/route.ts`
- `packages/shared/src/types/client.ts` — add `ai_intelligence_strip`, `coach_note` fields
- New migration: add `ai_intelligence_strip JSONB`, `coach_note TEXT` columns to `clients` table

**Effort estimate:** 1.5 days

---

### Story 7.3: Onboarding Path A — Historical Data Import & AI Client Extraction

**As a** coach with existing client data (notes, documents, past session records),
**I want** to upload my history and have MeetSolis auto-create my Client Cards,
**so that** Solis has months of context from Day 1 and I experience the aha moment immediately.

**Context from BRAINSTORM.md §5:**
> "Why this works: AI Magic Moment. Coach uploads months of unstructured history, gets organized intelligence in minutes. Solis has 6 months of context on Day 1."
> "AHA MOMENT: 'It already knows my clients better than my CRM does.'"

**Path A Full Flow (7 steps — from BRAINSTORM §5):**
```
Step 1  Practice setup (name, niche, # active clients) — target 30 seconds
Step 2  Upload anything — Notion export, Google Doc, Word, PDF, messy notes, CSV
Step 3  AI processes upload:
          → extracts client names, session dates, topics, recurring themes
          → auto-creates Client Card drafts
          → creates session records per client
          → generates AI summaries via existing summarize-session.ts pipeline
          → generates AI Intelligence Strip per client (Story 7.2)
Step 4  Coach reviews auto-extracted client list (AHA MOMENT here)
Step 5  Connect Google Calendar → upcoming sessions auto-mapped to clients
Step 6  Enable auto-transcription (Pro) or see manual flow (Free)
Step 7  Done → redirect to dashboard (clients + upcoming meetings visible)
```

**Acceptance Criteria:**

**Onboarding Route Group:**
- [ ] New route group: `apps/web/src/app/(onboarding)/`
- [ ] First-login detection: redirect new users to `/onboarding` on first sign-in
- [ ] Onboarding completion stored: `user_preferences.onboarding_completed` (boolean), `user_preferences.onboarding_path` (`"A"` | `"B"`)
- [ ] Progress bar showing current step (e.g., "Step 2 of 7")
- [ ] Each step has "Back" navigation (except Step 1)

**Step 0 — Path Selection:**
- [ ] Screen: "Do you have past coaching notes or data to import?"
- [ ] Option A: "Yes — import my history" → Path A (two sub-paths: CRM Connect or Document Upload)
- [ ] Option B: "No — I'm starting fresh" → Path B (Story 7.4)
- [ ] Can be skipped if context makes path obvious

**Step 0A — Import Sub-Path Selection (if "Yes — import my history"):**
- [ ] Screen: "How would you like to bring in your history?"
- [ ] Sub-path A1 — **CRM Connect** (from BRAINSTORM §11): "Connect Notion or Google Contacts — we'll pull your clients automatically"
  - OAuth → Notion workspace (read-only scope: databases + pages) → auto-pull client names + contact details
  - OAuth → Google Contacts (read-only scope) → auto-pull contacts as client name seeds
  - HubSpot: deferred post-PMF
  - Salesforce: never
  - After OAuth: creates draft Client Cards from pulled contacts (name, company from contact data)
  - Coach proceeds to Step 4 (review) — no AI extraction needed, contacts become card stubs
  - Note: CRM connect gives names/companies only — session data still requires document upload (Step 2)
- [ ] Sub-path A2 — **Document Upload** (recommended): "Upload your notes, docs, or recordings — AI extracts everything"
  - This is the full Step 2–3 flow below
- [ ] "Skip — I'll add clients manually later" → goes to Step 4 with empty list, then Step 5+

**Step 1 — Practice Setup:**
- [ ] Fields: Coach display name (pre-filled from Clerk profile), Coaching niche/specialty (free text input), Approximate # active clients (number input)
- [ ] Stored in `coach_profiles` table: `user_id`, `display_name`, `niche`, `active_client_count`
- [ ] "Skip for now" option — fields not required to proceed

**Step 2 — Upload:**
- [ ] Accepted file types: `.txt`, `.docx`, `.pdf`, `.csv`, `.mp3`, `.mp4`, `.m4a`, `.wav`, `.webm` (from BRAINSTORM §8 — "audio file" explicitly listed in manual upload spec)
- [ ] Audio files: routed through Deepgram transcription pipeline first → transcript text → then AI extraction (same path as manual session audio upload in Epic 3)
- [ ] Also: large text paste area ("Or paste your notes directly")
- [ ] Multiple files accepted (batch upload — mix of text docs and audio files allowed)
- [ ] Max file size: 50MB per file, 200MB total batch
- [ ] Upload progress indicator per file + overall progress
- [ ] Explainer copy: "Upload anything — messy notes, Notion exports, Word docs, audio recordings. AI handles the rest."
- [ ] Sample file download link: "Download a sample format" (helps coaches understand what to upload)
- [ ] Audio file note: "Audio files will be transcribed automatically — this may take a few extra minutes"

**Step 3 — AI Extraction (Processing Screen):**
- [ ] Animated progress screen shown during processing
- [ ] Progress messages cycling: "Reading your notes...", "Finding your clients...", "Extracting session themes...", "Building your intelligence profiles..."
- [ ] Real-time counter if feasible: "Found 8 clients, 47 sessions so far"
- [ ] AI extracts from uploaded content:
  - Client names (and variations/nicknames — deduplication attempted)
  - Session dates (or approximate timeframes if not explicit)
  - Session topics and key discussion points
  - Action items mentioned (who committed to what)
  - Recurring themes per client
- [ ] Creates `clients` records with `status: 'draft'` (not active until Step 4 confirmation)
- [ ] Creates `sessions` records linked to draft clients
- [ ] Runs `summarize-session.ts` pipeline on extracted session content
- [ ] Runs `generateIntelligenceStrip` (Story 7.2) for each client
- [ ] Generates embeddings for all sessions (Solis ready on Day 1)
- [ ] AI extraction prompt: must be tested with 10+ real uploads before ship (BRAINSTORM §9 rule)

**Step 4 — Coach Review (AHA MOMENT):**
- [ ] Show list of extracted clients: name, session count, date range
- [ ] Coach actions per client:
  - Rename (inline edit)
  - Delete (remove this client from import)
  - Merge two clients (if same person appeared under two names)
- [ ] "Confirm All" → move all from `draft` to `active`
- [ ] "Confirm Selected" → activate only checked clients
- [ ] AHA MOMENT: coach sees their full client roster organized, with sessions and themes already extracted

**Step 5 — Google Calendar:**
- [ ] "Connect Google Calendar" OAuth flow (same as Story 6.1)
- [ ] After connect: show "Found X upcoming sessions matched to your clients"
- [ ] "Skip for now" — calendar can be connected later in Settings

**Step 6 — Auto-Transcription:**
- [ ] Pro coaches: "Enable MeetSolis Notetaker — a bot will auto-join your sessions" + one-line disclosure + copyable client template message
- [ ] Free coaches: "You're on Free — manual session upload always available. Upgrade to Pro to enable auto-transcription."
- [ ] "Enable" → sets `user_preferences.auto_transcribe_enabled = true`
- [ ] "Skip for now" — can be enabled later in Settings → Preferences

**Step 7 — Done:**
- [ ] Success screen: "You're all set, [Name]! Your [X] clients and [Y] sessions are ready."
- [ ] CTA: "Go to my dashboard"
- [ ] Redirect to `/(dashboard)` — shows populated Client Cards + upcoming meetings

**Files to create/update:**
- New: `apps/web/src/app/(onboarding)/layout.tsx`
- New: `apps/web/src/app/(onboarding)/onboarding/page.tsx` (or step routes)
- New: `apps/web/src/app/api/onboarding/extract-clients/route.ts`
- New: `apps/web/src/lib/onboarding/extract-clients-from-upload.ts`
- New: `apps/web/src/lib/onboarding/seed-demo-client.ts` (shared with Story 7.4)
- New: `apps/web/src/app/api/onboarding/crm-connect/notion/route.ts` (Notion OAuth for CRM import)
- New: `apps/web/src/app/api/onboarding/crm-connect/google-contacts/route.ts` (Google Contacts OAuth)
- New: `apps/web/src/lib/onboarding/import-from-notion.ts`
- New: `apps/web/src/lib/onboarding/import-from-google-contacts.ts`
- `apps/web/src/lib/sessions/summarize-session.ts` — reused unchanged
- `apps/web/src/lib/clients/generate-intelligence-strip.ts` (Story 7.2) — called per extracted client
- New migration: `coach_profiles` table; add `onboarding_completed`, `onboarding_path`, `onboarding_import_method` (`"crm_notion"` | `"crm_google"` | `"document"` | `"fresh"`), `auto_transcribe_enabled` to `user_preferences`; add `status` (draft/active) to `clients` table
- `apps/web/src/middleware.ts` — redirect new users to onboarding on first sign-in
- Env vars: `NOTION_OAUTH_CLIENT_ID`, `NOTION_OAUTH_CLIENT_SECRET` (separate from MCP Notion — this is user-facing OAuth)

**Effort estimate:** 2–2.5 days

---

### Story 7.4: Demo Client "Alex Rivera" + Onboarding Path B

**As a** new coach with no past data,
**I want** to explore a pre-loaded demo client with realistic session history,
**so that** I understand and feel MeetSolis's full value within 3 minutes of signing up — before uploading anything.

**Context from BRAINSTORM.md §5:**
> "Empty product = dead onboarding. Notion, Linear, Superhuman — every great SaaS solves the cold-start problem with pre-loaded data. Coaches who sign up cannot evaluate MeetSolis without seeing it populated. Demo client trick prevents 80%+ of fresh-signup churn."

**Demo Client Spec (from BRAINSTORM §5, §13):**
- **Name:** Alex Rivera
- **Role:** VP Engineering
- **Company:** (fictional company — keep generic, not a real company name)
- **Coaching context:** Leadership coaching (generic enough to resonate with any executive coach)
- **Sessions:** 4 pre-processed fake sessions spanning approximately 3 months
- **Session content:** Generic enough to apply to any coach's mental model. Reviewed quarterly for freshness.
- **AI Intelligence Strip:** pre-populated (recurring theme, breakthrough, current focus — realistic coaching themes)
- **Coach Brief preview:** pre-generated (static, shown as "Imagine your session with Alex is in 2 hours")
- **Solis readiness:** embeddings pre-generated so Solis Q&A returns real answers from demo data

**One Demo Client Rule (from BRAINSTORM §5):**
> "One demo client only: Alex Rivera, leadership coaching context. Keep it simple. Multiple demos = decision paralysis. Single high-quality demo > three mediocre ones."

**Path B Full Flow (7 steps — from BRAINSTORM §5):**
```
Step 1  Practice setup (name, niche, # active clients)
Step 2  Demo client Alex Rivera shown:
          "We've set up a demo client so you can see MeetSolis in action"
          Coach explores (guided):
          → Full Client Card with AI Intelligence Strip
          → Coach Brief preview: "Your session with Alex is in 2 hours — here's your brief"
          → Solis Q&A: pre-filled suggested question: "What is Alex struggling with?"
             AI answers from fake session history
          AHA MOMENT: coach experiences full product magic in < 3 minutes
Step 3  "Now add your first real client" prompt — prominent CTA
Step 4  Manual client creation: 3 fields only — Name, Coaching goal, Company
Step 5  Connect Google Calendar (same as Path A Step 5)
Step 6  Enable auto-transcription (Pro) or manual path (Free)
Step 7  Done → redirect to dashboard
```

**Acceptance Criteria:**

**Demo Client Data:**
- [ ] Alex Rivera seeded via migration or seed script (not hardcoded in application code — must be removable/re-seedable)
- [ ] Scoped to each new user: every new user gets their own copy of Alex Rivera (not a shared demo client)
- [ ] 4 sessions with realistic coaching conversation content (leadership, exec presence, team dynamics themes)
- [ ] Sessions span ~3 months with realistic coaching cadence (biweekly)
- [ ] Each session has: AI summary, action items (mix of done and open), key topics, AI-suggested tags
- [ ] AI Intelligence Strip pre-populated: recurring theme (e.g. leadership presence), breakthrough, current focus
- [ ] Demo Coach Brief pre-generated with full layout (all sections populated)
- [ ] Embeddings pre-generated for all 4 sessions (Solis can answer questions on Day 1)

**Demo Client Flagging:**
- [ ] `clients.is_demo = true` for Alex Rivera
- [ ] Demo badge shown on Client Card: "Demo — explore MeetSolis with this sample client"
- [ ] Coach can delete demo client at any time: standard delete flow, no special warning beyond "are you sure?"
- [ ] Demo client counts toward limits (so coach sees the limit experience realistically)

**Path B UX:**
- [ ] Step 2 is the hero step — spend the most UX effort here
- [ ] Guided tour feel: highlight the AI Intelligence Strip, then the Coach Brief preview, then Solis Q&A
- [ ] Solis Q&A pre-filled question: "What is Alex struggling with?" — editable, coach can change it
- [ ] Coach Brief preview: static (not calendar-linked), shows brief as if meeting is in 2 hours
- [ ] After exploring → Step 3 "Add your first real client" CTA must be prominent and clear

**Step 4 — Manual Client Creation (3 fields only):**
- [ ] Name (text)
- [ ] Coaching goal — what the client is working toward (text)
- [ ] Company (text, optional)
- [ ] No other fields at creation — AI fills the rest from sessions
- [ ] On creation → redirect to new client's empty Client Card with "Add your first session" prompt

**Steps 5–7:** Same as Path A Steps 5–7 (shared components)

**Maintenance:**
- [ ] Demo data quality reviewed quarterly
- [ ] Criteria: still feels realistic, generic enough to apply to any coach's mental model, not referencing dated events

**Files to create/update:**
- `apps/web/src/app/(onboarding)/` — shared route group with Path A
- New: `apps/web/src/lib/onboarding/seed-demo-client.ts` — creates Alex Rivera + sessions + embeddings for a given `user_id`
- New migration / seed: demo client data structure (runs per user at signup via trigger or edge function)
- `packages/shared/src/types/client.ts` — add `is_demo: boolean` field
- `apps/web/src/app/(dashboard)/clients/[id]/page.tsx` (Story 2.6) — demo badge display
- `apps/web/src/app/(onboarding)/onboarding/page.tsx` — Path B flow steps

**Effort estimate:** 1.5–2 days

---

### Story 7.5: Post-Session Client Email + Clipboard Export

**As a** coach,
**I want** to send my client a clean post-session email with their summary and action items,
**so that** clients stay accountable and our coaching relationship feels more professional and structured.

**Context from BRAINSTORM.md §7 and §11:**
> "Shareable client notes (email): Game-changer per user feedback."
> "Phase 1 — Ship at launch: Email to client (Resend already integrated) + Copy to clipboard (universal fallback)."
> "Audience-aware export (client-only): Same session, structured for client-facing email. Coach's internal notes never included."

**Acceptance Criteria:**

**"Send to client" UI:**
- [ ] Button on session detail view: "Send to client" (primary action)
- [ ] Second button alongside: "Copy to clipboard" (secondary action)
- [ ] If `clients.email` is blank → prompt: "Add your client's email to send session notes" with inline email field

**Email Preview + Edit (before send):**
- [ ] Modal or inline preview of email before sending
- [ ] Coach can edit any field in the preview (summary points, action items, custom message)
- [ ] "Send" button confirms and dispatches via Resend
- [ ] "Cancel" closes without sending

**Email Content (client-facing — structured for client perspective):**
```
Subject: Session Notes — [Session Date] with [Coach Name]

Hi [Client Name],

Here are your notes from today's session:

SESSION HIGHLIGHTS
• [AI-generated summary point 1 — written for client, not coach notes]
• [AI-generated summary point 2]
• [AI-generated summary point 3]

YOUR ACTION ITEMS
○ [client action item 1]
○ [client action item 2]
○ [client action item 3]

[Optional coach custom message — blank by default, coach can add]

Looking forward to our next session.

— [Coach Name]

---
Sent via MeetSolis · [Unsubscribe link]
```

**Audience-aware framing:**
- [ ] AI summary rewritten for client perspective if needed (not raw coach notes)
- [ ] Shows ONLY client action items (not coach's own action items)
- [ ] Coach's private notes (Coach Note from AI Intelligence Strip) are NEVER included
- [ ] Coach Brief content is NEVER included (coach-only)

**Send Mechanics:**
- [ ] Sent via Resend (`RESEND_API_KEY` from Story 5.1 — already set)
- [ ] From address: `noreply@meetsolis.com` or coach's configured name
- [ ] Success toast: "Email sent to [Client Name] ✓"
- [ ] Failure toast: "Failed to send — try again" with retry option
- [ ] Send logged in `session_emails` table: `session_id`, `sent_at`, `recipient_email`, `status` (`sent` | `failed`)
- [ ] "Sent ✓" badge shown on session card after successful send
- [ ] Coach can resend (no limit — "Resend email" button replaces "Send to client" after first send)

**Clipboard Copy:**
- [ ] "Copy to clipboard" → copies clean plain text version (same structure as email, minus header/footer)
- [ ] Format: Markdown-friendly (bullets, bold labels) — works in WhatsApp, Notion, Slack, email
- [ ] Toast: "Copied to clipboard ✓"
- [ ] Universal fallback — no external service required

**Post-Launch (deferred — do NOT build now):**
- Phase 2: Notion push — one-time export of session notes to coach's Notion workspace. Becomes free to build once Notion onboarding integration (Story 7.3 CRM Connect) exists.
- Phase 3: Zapier webhook — covers Asana, Monday, ClickUp, Trello, and any other task tool the coach uses. **One webhook replaces all native integrations.**
- **SKIP (decided out — do not revisit):** Native Asana / native Monday.com / native ClickUp / native Trello integrations. Zapier covers all of these. Building native versions = wasted effort with no additional reach. — BRAINSTORM §11

**Files to create/update:**
- Session detail view page (Epic 3 — find correct path in `apps/web/src/app/(dashboard)/clients/[id]/sessions/[sessionId]/` or equivalent)
- New: `apps/web/src/lib/email/send-session-email.ts`
- New: `apps/web/src/app/api/sessions/[id]/send-email/route.ts`
- New migration: `session_emails` table (`id`, `session_id` FK, `sent_at`, `recipient_email`, `status`)
- `packages/shared/src/types/` — add `SessionEmail` type
- Env: `RESEND_API_KEY` already configured (Story 5.1) — no new vars needed

**Effort estimate:** 1 day

---

### Story 7.6: Action Items Carry-Forward + Action Items Everywhere

**As a** coach,
**I want** open action items from past sessions to surface automatically in new sessions and across my dashboard,
**so that** nothing falls through the cracks and client accountability is visible at every touchpoint.

**Context from BRAINSTORM.md §7:**
> "Action item carry-forward: No competitor does this well. Show client's open commitments at top of new session. Building — competitive moat."
> "Action items everywhere: Shown in Coach Brief + top of Client Card + dashboard summary. Coach sees, client receives via post-session email."

**Acceptance Criteria:**

**1. Action Item Carry-Forward (in Session Processing View):**
- [ ] When a new session is uploaded/processed for a client → before showing the new session summary, auto-fetch all open action items from this client's previous sessions
- [ ] Display section above new session summary: "Open Commitments from Past Sessions"
- [ ] Each carry-forward item shows:
  - Action item text
  - Which session it came from (session date + AI-generated session title)
  - How many sessions it has been open (e.g., "Open for 3 sessions")
- [ ] Coach can mark items done inline (checkbox) → updates `action_items.status = 'completed'`
- [ ] AI auto-detection: if the new session transcript mentions completing a past open item → surface suggestion: "Looks like [Client Name] completed '[item]' — mark as done?" (coach confirms)
- [ ] Newly extracted action items from current session shown in separate section below

**2. Action Items on Client Card Top (Client Detail View — Story 2.6):**
- [ ] "Open Action Items" section on Client Card detail page: positioned between header and AI Intelligence Strip
- [ ] Two subsections:
  - "Client's commitments" — items client committed to
  - "My commitments" — items coach committed to in sessions (AI extracts who committed to what)
- [ ] Each item: text + source session date + "Open X sessions" indicator
- [ ] Click item → navigate to source session
- [ ] Inline checkbox: mark done → `action_items.status = 'completed'` → item slides to collapsed "Completed" section
- [ ] "Completed action items" collapsible accordion at bottom (hidden by default)
- [ ] Count badge on section header: "Open Action Items (7)"

**3. Action Items on Main Dashboard:**
- [ ] Summary card on main dashboard: "X open client commitments across Y clients"
- [ ] Click → goes to a filtered view or highlights clients with open action items
- [ ] Ordering: clients with oldest open action items shown first (urgency sort)
- [ ] Empty state: "All action items are up to date ✓"

**4. Action Items in Coach Brief (Epic 6 dependency):**
- [ ] Story 6.4 (Coach Brief) renders "LAST SESSION" section showing open + completed action items
- [ ] This story (7.6) ensures `action_items` table has `assignee_type` field so Coach Brief can filter by client commitments vs coach commitments
- [ ] Story 6.4 consumes this data — ensure it is available before building 6.4

**Data Model Updates:**
- [ ] Existing `action_items` table (from Epic 3) needs new column: `assignee_type TEXT` → `'client'` | `'coach'` | `'unknown'`
- [ ] AI extraction in `summarize-session.ts` must be updated to populate `assignee_type`:
  - "Sarah will..." → `assignee_type: 'client'`
  - "I'll follow up..." / "Coach to..." → `assignee_type: 'coach'`
  - Ambiguous → `assignee_type: 'unknown'`
- [ ] New column: `action_items.sessions_open_count INT` (computed or stored — how many sessions this item has been open)

**Files to create/update:**
- `apps/web/src/app/(dashboard)/clients/[id]/page.tsx` (Story 2.6) — add Open Action Items section at top
- `apps/web/src/app/(dashboard)/page.tsx` — add action items summary card to dashboard
- Session processing/upload view (Epic 3) — add carry-forward section before new summary
- `apps/web/src/lib/sessions/summarize-session.ts` — update AI extraction to populate `assignee_type`; add carry-forward fetch on new session creation
- New: `apps/web/src/lib/action-items/get-open-items.ts` — reusable function to fetch open items for a client
- New migration: add `assignee_type TEXT`, `sessions_open_count INT` columns to `action_items`
- `packages/shared/src/types/` — update `ActionItem` type with `assignee_type` and `sessions_open_count`
- New: `apps/web/src/app/api/action-items/[id]/complete/route.ts` (if not already built in Epic 3)

**Effort estimate:** 1.5 days

---

### Story 7.7: Living Client Card — LinkedIn-Style Profile That Writes Itself

**As a** coach,
**I want** my Client Card to look and feel like a rich LinkedIn-style profile that automatically fills itself in from every session,
**so that** after 10 sessions the card is so valuable and irreplaceable that leaving MeetSolis means losing the entire intelligence layer I built.

**Context from BRAINSTORM.md §2 — Bet 1 (the lock-in mechanic):**
> "One permanent profile per client. LinkedIn-style profile that writes itself from sessions. Coach enters 3 fields at creation: name, goal, company. AI fills the rest from accumulating sessions."
> "Lock-in mechanic: Card gets richer every session. After 10 sessions per client × 15 clients = 150 sessions of intelligence. Coach cannot leave MeetSolis — switching cost = losing the entire intelligence layer they paid to build."
> "AI editability principle (non-negotiable): Every AI-generated field is editable inline. Coach can override anything. AI is assistant, not authority."

**This story upgrades the existing Client Card detail view (Story 2.6) into the full living profile spec from BRAINSTORM §2. It completes the card structure that Stories 7.2 and 7.6 partially built.**

---

**Full Card Layout (exact spec from BRAINSTORM §2):**

```
┌─────────────────────────────────────────────────────┐
│ HEADER                                              │
│  [Avatar — photo upload or initials monogram]       │
│  Name · Role · Company                              │
│  Together X months · Y sessions · Next: [date]      │
│  Goal: "coaching goal in client's own words"        │
├─────────────────────────────────────────────────────┤
│ AI INTELLIGENCE STRIP          (Story 7.2 — built)  │
│  Recurring theme + frequency                        │
│  Recent breakthrough                                │
│  Current focus                                      │
│  Coach note (private, manual)                       │
├─────────────────────────────────────────────────────┤
│ OPEN ACTION ITEMS              (Story 7.6 — built)  │
│  Client commitments / Coach commitments             │
│  Completed items collapsed below                    │
├─────────────────────────────────────────────────────┤
│ SESSION FEED (timeline, latest first)               │
│  date · AI title · 2-line summary · items · tags    │
│  Tags: Breakthrough ✦ / Stuck / Milestone /        │
│         Goal-setting  (AI-suggested, coach-editable)│
├─────────────────────────────────────────────────────┤
│ ABOUT                                               │
│  Start date · Industry · Company size               │
│  Private notes (static, manual)                     │
└─────────────────────────────────────────────────────┘
```

---

**Acceptance Criteria:**

**HEADER — Stats Bar & Identity (new fields on top of Story 2.6):**
- [ ] Avatar: optional photo upload (stored in Supabase Storage, `client-avatars/{userId}/{clientId}`). Default = initials monogram (2 letters, colored based on client name hash — consistent color per client, dark teal palette)
- [ ] Avatar upload: click avatar → file picker → crop/preview → save. Max 5MB, JPG/PNG/WEBP
- [ ] Name · Role · Company displayed as subtitle row (Role and Company already in `clients` table from Epic 2 — verify fields exist, add if missing)
- [ ] **"Together X months"** — computed: `floor(months between clients.start_date and today)`
- [ ] **"Y sessions"** — computed: `count of sessions for this client`
- [ ] **"Next: [date]"** — pulled from `calendar_events` (Story 6.1): next upcoming matched event for this client. "Next: —" if no calendar connected or no upcoming event
- [ ] Stats bar updates live as sessions are added (no manual input needed)
- [ ] **Goal field** displayed prominently below the name/stats row: `"Goal: [goal text in client's own words]"` — inline editable, this is the 3-field creation field from Epic 2 surfaced prominently

**SESSION FEED — AI-Suggested Tags:**
- [ ] Each session row in the feed shows: `[date] · [AI-generated title] · [2-line summary] · [action item count] · [tags]`
- [ ] Tags per session: AI suggests from 4 options — `Breakthrough ✦` / `Stuck` / `Milestone` / `Goal-setting`
- [ ] AI tag selection based on session summary content (prompt: classify session tone/outcome into one of the 4 tags)
- [ ] Coach can override: click tag → dropdown of all 4 options → select different tag → saved
- [ ] Coach can add a second tag if needed (max 2 per session)
- [ ] Tags stored in `sessions.tags TEXT[]` column (array — allows multiple)
- [ ] Tag generation: runs at end of `summarize-session.ts` pipeline alongside AI summary
- [ ] Tag prompt must be tested with 10+ real sessions before ship (BRAINSTORM §9 rule)
- [ ] `Breakthrough ✦` tag styled distinctively (gold/yellow accent — one of the few places non-teal accent is intentional to signal significance)
- [ ] Session row click → expands inline to show full summary + all action items for that session
- [ ] "View full session" link → navigates to full session detail page

**ABOUT Section (new — below Session Feed):**
- [ ] Static fields — all manual, none AI-generated:
  - **Industry** (free text, e.g. "Technology", "Financial Services", "Healthcare")
  - **Company size** (select: "Solo" / "2–10" / "11–50" / "51–200" / "201–1000" / "1000+")
  - **Start date** (date picker — auto-filled from first session date if available, coach can override)
  - **Private notes** (multi-line text area — coach's permanent private context, e.g. "Referred by Jane. Sensitive topic: family business conflict." — NOT the same as Coach Note in AI Strip which is session-focused)
- [ ] All fields editable inline (click → edit → save on blur)
- [ ] ABOUT section collapsible (collapsed by default for coaches who don't use it, expanded by default for new clients)
- [ ] New DB columns on `clients` table: `industry TEXT`, `company_size TEXT`, `about_notes TEXT`

**The Living Card — Progressive Enrichment:**
- [ ] **0 sessions (new client):** Card is sparse but intentional. Header shows name + initials avatar + goal. Intelligence Strip shows "Add your first session to start building [Name]'s profile." Session Feed empty state: "No sessions yet — upload your first session." ABOUT section prompts coach to fill in context.
- [ ] **1–2 sessions:** Intelligence Strip starts populating (may show only Current Focus initially). Session Feed shows first rows with tags. Card visibly starts coming alive.
- [ ] **3–5 sessions:** Full Intelligence Strip populated. Recurring themes emerging. Action items accumulating. Card feels meaningfully rich.
- [ ] **10+ sessions:** Card is deeply rich — theme history, pattern progression, breakthrough timeline, months of context. This is the lock-in state. Switching cost = losing everything visible on this card.
- [ ] No artificial loading or placeholder text at any stage — only show sections that have data. Empty sections appear as gentle prompts, not broken UI.

**Visual Design:**
- [ ] LinkedIn-profile feel: structured, professional, information-dense but not cluttered
- [ ] Dark deep teal theme — consistent with production UI (do NOT use old PRD earth tones or light theme)
- [ ] Avatar initials monogram: same dark teal palette, contrasting text color
- [ ] Section dividers: subtle, keeps card readable at all enrichment stages
- [ ] Stats bar ("Together X months · Y sessions · Next: [date]"): muted text, smaller than the name — supporting context, not competing with client identity
- [ ] `Breakthrough ✦` tag: warm yellow/gold accent (intentional — signals significance, matches brand yellow from design system)
- [ ] All other tags: neutral chip style, teal palette
- [ ] AI-generated fields carry a subtle "✦ AI" indicator (small, not intrusive) so coach always knows what AI wrote vs what they wrote

**AI Editability (non-negotiable principle, applied everywhere on this card):**
- [ ] Every AI-generated field has inline edit: click → edit mode → save on blur or Enter
- [ ] Edited fields retain the coach's version even after new session regeneration (coach override wins)
- [ ] Flag edited fields: if coach has overridden an AI field, do not overwrite it on next regeneration — show "Coach edited · [Regenerate from AI]" option
- [ ] Manual fields (ABOUT, Coach Note, Goal) are never touched by AI

**Files to create/update:**
- `apps/web/src/app/(dashboard)/clients/[id]/page.tsx` (Story 2.6) — primary file, full layout rebuild to match spec
- `apps/web/src/components/client/ClientHeader.tsx` — new component: avatar + stats bar + goal
- `apps/web/src/components/client/SessionFeedRow.tsx` — new component: session row with tags
- `apps/web/src/components/client/AboutSection.tsx` — new component: ABOUT fields
- `apps/web/src/app/api/clients/[id]/avatar/route.ts` — avatar upload endpoint
- `apps/web/src/app/api/sessions/[id]/tags/route.ts` — update session tags
- `apps/web/src/lib/sessions/summarize-session.ts` — add tag generation step at end of pipeline
- `packages/shared/src/types/client.ts` — add `industry`, `company_size`, `about_notes`, `avatar_url` fields
- `packages/shared/src/types/session.ts` — add `tags TEXT[]` field
- New migration: add `industry TEXT`, `company_size TEXT`, `about_notes TEXT`, `avatar_url TEXT` to `clients`; add `tags TEXT[]` to `sessions`; add `role TEXT` if missing from `clients`

**Effort estimate:** 2–2.5 days

---

## Epic Success Criteria

- [ ] Free tier enforces 10 sessions and 50 queries (not old 5/75 values)
- [ ] Zero instances of "transcript(s)" in user-facing UI copy (only "session(s)")
- [ ] Coach with existing data hits aha moment within 5 minutes of signing up (Path A)
- [ ] Fresh coach sees Alex Rivera demo and understands value within 3 minutes (Path B)
- [ ] AI Intelligence Strip appears on every Client Card with populated data
- [ ] Every AI-generated field on strip and card is editable inline — coach override persists across regenerations
- [ ] Post-session email sends successfully via Resend (tested with real email)
- [ ] Open action items visible on Client Card top, dashboard summary, and carry-forward in new session
- [ ] Action items correctly attributed to coach vs client
- [ ] Client Card header shows live stats (months together, session count, next session date)
- [ ] Session Feed shows AI-suggested tags (Breakthrough/Stuck/Milestone/Goal-setting), coach-editable
- [ ] ABOUT section fields editable inline, data persists
- [ ] Card progressive enrichment: 0-session state is sparse but intentional; 10-session state is deeply rich
- [ ] Story 5.5 (old onboarding spec) fully superseded — do not implement old 5-step flow

## Definition of Done

- [ ] All 7 stories completed with acceptance criteria met
- [ ] Existing Client Cards (Epic 2), sessions (Epic 3), Solis (Epic 4) unaffected
- [ ] Tier enforcement (Story 5.2) updated and working with new limits
- [ ] Demo client Alex Rivera seeded for all new user signups
- [ ] Email sending tested in staging (not just mocked)
- [ ] All new DB tables/columns have RLS policies
- [ ] No regression in existing dashboard, client views, session views
- [ ] **PROMPT GATE (BRAINSTORM §9 — blocking):** Every AI prompt in this epic (client extraction from uploads, AI Intelligence Strip generation, session tag classification) tested with minimum 10 real coaching transcripts/uploads before the story is marked Done. Prompt is written and validated before UI is built around it — not after.

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| AI client extraction from messy uploads misses clients | Coach review step (Step 4) is mandatory — AI creates drafts, coach confirms. Merge/rename tools handle duplicates. |
| Demo client Alex Rivera feels generic/fake | High-quality session content written by hand. Quarterly review cadence. Leadership coaching universal enough to resonate with any coach. |
| Email sending fails (Resend) | Toast error + retry button. Session email status tracked in DB. |
| Action item carry-forward creates noisy UI | Collapsible sections, count badges, completed items hidden by default. |
| Story 5.5 spec confusion | Story 5.5 is superseded. Clearly flagged in epic file. Dev agents must not implement old 5-step flow. |
| Terminology rename misses instances | Grep-based audit step in Story 7.1 acceptance criteria. |

## Compatibility Requirements

- [ ] Client Card UI (Epic 2) extended with new sections, not broken
- [ ] Session pipeline (Epic 3) reused, not replaced
- [ ] Solis Intelligence (Epic 4) unaffected
- [ ] Existing action_items table extended with new columns (backward compatible migration)
- [ ] Resend integration (Story 5.1) reused, no new email provider
- [ ] Settings page (Story 5.4) not touched by this epic (Calendar and bot settings are Epic 6)
