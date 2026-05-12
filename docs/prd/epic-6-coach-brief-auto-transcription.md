# Epic 6: Coach Brief & Auto-Transcription

**Version:** 1.0
**Status:** Not Started
**Priority:** P0 (Critical — Hero Feature)
**Target:** Phase 3 of build sequence (Days 9–13 per BRAINSTORM.md §8)
**Dependencies:** Epic 3 (Session Memory complete), Epic 4 (Solis Intelligence complete), Epic 6 stories are sequenced A→B→C internally
**Last Updated:** 2026-05-11

---

## Epic Overview

Build the Coach Brief hero feature and the full auto-transcription infrastructure that powers it. This epic delivers what coaches will tell their friends about: a pre-session brief that auto-appears before every meeting with zero prompting required, powered by Google Calendar sync, Recall.ai bot, Gladia transcription, and Solis Intelligence.

**The core promise:**
> Coach opens app 1 hour before a session → full prep brief is already waiting. No prompt needed. No manual prep. Just walk in ready.

**Why this is the hero feature (from BRAINSTORM.md §2):**
> "This is the moment a coach realizes MeetSolis ≠ Otter.ai. Justifies $99/mo for a coach seeing 15 clients/week (15 briefs/week = 60+ saved hours/month of mental prep). No competitor in any adjacent space does this — this is the differentiator coaches will tell each other about."

**What this epic covers:**
1. Google Calendar OAuth + upcoming meeting detection in dashboard (Phase A)
2. Recall.ai bot integration — auto-joins meetings, Pro-gated (Phase B)
3. Gladia transcription pipeline + speaker diarization → coach/client mapping (Phase B + C)
4. Coach Brief screen — auto-activates, full layout, Solis-powered (hero feature)
5. Coach Brief settings, bot toggle, live transcript view

**Build sequence locked (from BRAINSTORM.md §4 and §8):**
- Phase A: Google Calendar sync — show upcoming meetings in dashboard
- Phase B: Recall.ai bot + Gladia transcription — auto-transcribe Pro sessions
- Phase C: Speaker ID mapping (Speaker 0 → "Coach", Speaker 1 → client name from Card)

---

## Existing System Context

**Technology stack:**
- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS, Shadcn UI
- Auth: Clerk (JWT, OAuth — Google OAuth already configured for auth, but Calendar scope is separate)
- Backend: Vercel Edge Functions, Supabase PostgreSQL
- AI: Claude Sonnet 4.5 (via `AI_PROVIDER` env var), OpenAI fallback
- Current transcription: Deepgram Nova-2 (manual uploads — stays for Free plan and manual Pro path)
- Email: Resend (already integrated, Story 5.1)
- Hybrid RAG: `hybrid_session_search` Supabase RPC (Story 4.1)
- UI theme: dark deep teal/green — see `apps/web/src/app/globals.css` and design system

**What already exists that this epic builds on:**
- Session upload + AI summary pipeline: `src/lib/sessions/summarize-session.ts` (Epic 3)
- Solis Intelligence hybrid RAG: `src/lib/ai/solis.ts` (Story 4.1) — powers AI Prep Note in Coach Brief
- Client Cards with full detail view: `apps/web/src/app/(dashboard)/clients/[id]/page.tsx` (Epic 2)
- Action items tracked with open/done state (Epic 3) — surfaced in Coach Brief
- Tier enforcement: `checkTierLimit` (Story 5.2) — Coach Brief and bot are Pro-only
- Settings page with Preferences tab: `apps/web/src/app/(dashboard)/settings/page.tsx` (Story 5.4)

**New infrastructure needed:**
- Google Calendar OAuth token storage and sync
- Recall.ai API integration (bot lifecycle)
- Gladia API integration (transcription + diarization)
- `calendar_events`, `recall_sessions`, `coach_briefs` tables in Supabase
- New env vars: `RECALL_API_KEY`, `GLADIA_API_KEY`, `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`

---

## Auto-Transcription Stack Decision (from BRAINSTORM.md §4)

| Layer | Service | Cost | Notes |
|---|---|---|---|
| Meeting bot (audio capture) | Recall.ai | ~$0.50/hr | Auto-joins Google Meet/Zoom |
| Transcription + diarization | Gladia.ai | ~$0.15–0.25/hr | HIPAA/SOC2, better diarization |
| Calendar sync | Google Calendar API | Free | OAuth 2.0 |

**Total cost per auto-transcribed session: ~$0.65–0.75/hr**

### Gladia vs Deepgram Decision
- **Gladia:** 2–3x fewer diarization errors vs Deepgram, HIPAA/SOC2 compliant, ~$0.61–0.75/hr
- **Deepgram Nova-2:** already integrated, ~$0.007/min, kept for manual uploads
- **Decision (locked):** Gladia for Recall.ai bot sessions (higher quality input warrants it). Deepgram stays for Free plan manual uploads and Pro manual uploads.

### Bot Visibility Strategy
- Recall.ai bot IS visible as a participant — no stealth mode
- Bot name: **"MeetSolis Notetaker"** (placeholder — finalize in design phase)
- Coach client script: *"My AI note assistant helps me remember your breakthroughs between sessions"*
- Clients appreciate accuracy and privacy over manual notes
- Bot announces itself when joining — satisfies notification requirement automatically

### Legal / Consent Approach
- One-party consent covers ~38 US states — coach consent at onboarding is sufficient
- High-risk states (CA, IL, FL, PA, WA): two-party consent needed → one-line disclosure in coach onboarding + template message for clients to send
- No per-session consent flow (kills UX)
- EU coaches deferred post-PMF (GDPR adds residency, DPA, stricter consent burden)

### Feature Gating
- **Free plan:** manual session upload only (existing Deepgram pipeline from Epic 3)
- **Pro plan ($99/mo):** Recall.ai bot + Gladia + Coach Brief all enabled
- **Pro plan session limit:** 25 auto-transcribed sessions/month via bot (from BRAINSTORM §6 — not unlimited). Manual uploads do not count toward this limit. Enforce via `checkTierLimit('bot_sessions', userId)`. Store monthly count in `user_usage.bot_session_count`, reset each billing cycle.

---

## Stories

### Story 6.1: Google Calendar OAuth + Upcoming Meeting Sync

**As a** Pro coach,
**I want** to connect my Google Calendar to MeetSolis,
**so that** my upcoming coaching sessions are auto-detected and surfaced in my dashboard, and the Coach Brief has the data it needs to auto-activate.

**Acceptance Criteria:**

**OAuth Flow:**
- [ ] "Connect Google Calendar" button added to Settings → Preferences tab (Story 5.4 already ships the tab — add Calendar section to it)
- [ ] OAuth 2.0 scopes requested: `https://www.googleapis.com/auth/calendar.events.readonly`, `https://www.googleapis.com/auth/calendar.readonly`
- [ ] Tokens stored encrypted in Supabase: `user_calendar_tokens` table (`user_id`, `access_token` encrypted, `refresh_token` encrypted, `expiry_at`, `google_account_email`)
- [ ] Token refresh handled automatically when `expiry_at` is within 5 minutes
- [ ] Disconnect Calendar option: revokes token via Google API + deletes from DB
- [ ] Connection status displayed in Preferences tab: "Connected: name@gmail.com ✓" or "Not connected"
- [ ] RLS on `user_calendar_tokens`: users can only read/write their own tokens

**Meeting Sync (Phase A):**
- [ ] Cron or scheduled edge function: poll upcoming calendar events every 15 minutes, window = next 24 hours
- [ ] Filter events: include only events with Google Meet/Zoom link OR attendee email matching a Client Card
- [ ] Upsert into `calendar_events` table:
  - `id`, `user_id`, `google_event_id` (unique), `title`, `start_time`, `end_time`
  - `attendees` (JSONB array of email strings)
  - `client_id` (UUID, nullable — populated when matched to Client Card)
  - `meet_link` (nullable)
  - `bot_status` (nullable — populated by Story 6.2)
  - `synced_at`
- [ ] RLS: users only see their own calendar events

**Dashboard Upcoming Meetings Card:**
- [ ] New card on main dashboard (`apps/web/src/app/(dashboard)/page.tsx`): "Upcoming Sessions"
- [ ] Shows next 3 events: client name (if matched), date, time, meeting platform icon
- [ ] If event not matched to a Client Card → shows "Match to client ›" link
- [ ] If event matched → shows Coach Brief countdown when within brief window (Story 6.4)
- [ ] Empty state: "No upcoming sessions in the next 24 hours" or "Connect Google Calendar to see upcoming sessions"

**Client Matching Logic:**
- [ ] Auto-match: compare each attendee email against `clients.email` field for this user's clients
- [ ] Match stored in `calendar_events.client_id`
- [ ] Manual match: "Match to client" → modal dropdown of coach's active Client Cards
- [ ] Manual match stored same way

**Files to create/update:**
- `apps/web/src/app/(dashboard)/settings/page.tsx` (Story 5.4) — add Calendar section to Preferences tab
- `apps/web/src/app/(dashboard)/page.tsx` — add Upcoming Sessions card
- New: `apps/web/src/app/api/calendar/connect/route.ts` (OAuth initiation)
- New: `apps/web/src/app/api/calendar/callback/route.ts` (OAuth callback)
- New: `apps/web/src/app/api/calendar/sync/route.ts` (manual sync trigger)
- New: `apps/web/src/app/api/calendar/disconnect/route.ts`
- New: `apps/web/src/lib/services/calendar/google-calendar.ts`
- New migration: `user_calendar_tokens` table, `calendar_events` table, RLS policies
- Env vars: `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`

**Effort estimate:** 1.5–2 days

---

### Story 6.2: Recall.ai Bot Integration (Pro-Gated)

**As a** Pro coach,
**I want** a MeetSolis bot to automatically join my coaching sessions,
**so that** the session is fully captured without me doing anything extra.

**Context:** Recall.ai is a meeting bot infrastructure service. It takes a meeting URL, creates a bot participant, and captures the audio stream. This story handles bot lifecycle management only — transcription is Story 6.3.

**Acceptance Criteria:**

**Bot Auto-Trigger:**
- [ ] Background job: when `calendar_event.start_time - now() <= 5 minutes` AND `calendar_event.client_id IS NOT NULL` AND `user.is_pro = true` AND `user_preferences.auto_transcribe_enabled = true` → trigger bot join
- [ ] API call to Recall.ai: `POST https://us-east-1.recall.ai/api/v1/bot` with `{ meeting_url, bot_name: "MeetSolis Notetaker" }`
- [ ] Bot name set to "MeetSolis Notetaker" (placeholder — final name locked in design phase)
- [ ] Bot IS visible as a meeting participant — no stealth (transparency-first)

**Bot Lifecycle:**
- [ ] Create `recall_sessions` record on bot creation:
  - `id`, `user_id`, `client_id`, `calendar_event_id`, `recall_bot_id`
  - `status`: `pending` → `joining` → `in_meeting` → `done` → `error`
  - `started_at`, `ended_at`, `raw_recording_url` (populated when meeting ends)
- [ ] Recall.ai webhook endpoint: `POST /api/recall/webhook`
  - `bot.joining_call` → update status to `joining`
  - `bot.in_call_recording` → update status to `in_meeting`
  - `bot.call_ended` → update status to `done`, store `raw_recording_url`, trigger Story 6.3 pipeline
  - `bot.fatal_error` → update status to `error`, trigger fallback notification
- [ ] Webhook signature verification (Recall.ai HMAC secret)
- [ ] RLS: users only see their own recall_sessions

**Error Handling (fallback):**
- [ ] Bot fails to join → status = `error` → toast notification in dashboard: "Bot couldn't join your session with [Client Name] — [Upload manually ›]"
- [ ] Upload manually link → goes to manual upload flow for that client (Epic 3)
- [ ] Bot gets kicked from meeting → same error path
- [ ] Meeting URL not supported → surface error before bot is dispatched

**Feature Gating:**
- [ ] Free coaches: "Auto-transcription is a Pro feature" banner with upgrade CTA — no bot dispatched
- [ ] Pro coaches with bot disabled globally: no bot dispatched
- [ ] Per-meeting override toggle in Upcoming Sessions dashboard card: "Skip bot for this session"

**Consent / Disclosure:**
- [ ] One-line disclosure in onboarding (Story 7.3 and 7.4): "When auto-transcription is enabled, a 'MeetSolis Notetaker' bot will join your calendar sessions to capture transcripts. Your clients will see it listed as a participant."
- [ ] Template message shown once in onboarding (copyable): "My AI note assistant, MeetSolis Notetaker, will join our sessions to help me remember your breakthroughs between sessions."
- [ ] No per-session consent prompt (kills UX)

**Files to create/update:**
- New: `apps/web/src/app/api/recall/bot/route.ts` (create/dispatch bot)
- New: `apps/web/src/app/api/recall/webhook/route.ts` (lifecycle events)
- New: `apps/web/src/lib/services/recall/recall-service.ts`
- `apps/web/src/app/(dashboard)/page.tsx` — "Skip bot" per-meeting toggle in Upcoming Sessions card
- New migration: `recall_sessions` table + RLS
- Env vars: `RECALL_API_KEY`, `RECALL_WEBHOOK_SECRET`

**Effort estimate:** 1–1.5 days

---

### Story 6.3: Gladia Transcription Pipeline + Speaker Diarization

**As a** system,
**I need** to transcribe Recall.ai bot-captured audio via Gladia and map speakers to coach/client,
**so that** the session enters the existing AI summary pipeline with accurate, labeled speaker output.

**Context:** This story fires after Story 6.2's webhook signals meeting end. It chains Gladia transcription → speaker mapping → existing `summarize-session.ts` pipeline, making auto-transcribed sessions indistinguishable from manually uploaded ones once processed.

**Acceptance Criteria:**

**Transcription (Phase B):**
- [ ] On Recall.ai webhook `bot.call_ended`: download audio from `recall_sessions.raw_recording_url`
- [ ] Submit to Gladia: `POST https://api.gladia.io/v2/pre-recorded` with `{ audio_url, diarization: true, diarization_config: { min_speakers: 2, max_speakers: 4 } }` — speaker count params are load-bearing: `min: 2` (coach + client always), `max: 4` (covers group sessions without over-splitting)
- [ ] Poll Gladia result (Gladia webhook preferred if supported, else 10s polling with 30-attempt max)
- [ ] Receive diarized transcript format: `[{ speaker: "speaker_0" | "speaker_1" | ..., text: string, start: float, end: float }]`
- [ ] Store raw diarized transcript in `recall_sessions.diarized_transcript` (JSONB)
- [ ] Update `recall_sessions.status` → `transcribed` after Gladia completes

**Speaker ID Mapping (Phase C):**
- [ ] Speaker 0 → "Coach" (assumed — coach initiates/owns the meeting)
- [ ] Speaker 1 → client name from matched `Client Card.name` (via `recall_sessions.client_id`)
- [ ] If >2 speakers detected → flag: update `recall_sessions.speaker_review_needed = true` → surface in dashboard: "Multiple speakers detected in [Client Name]'s session — please verify speakers"
- [ ] Speaker mapping stored in `recall_sessions.speaker_map` (JSONB): `{ "speaker_0": "Coach", "speaker_1": "Sarah Chen" }`
- [ ] Coach can manually reassign speakers in session view: editable dropdown per speaker label in transcript view
- [ ] After reassignment → coach clicks "Confirm speakers" → re-runs summarization with corrected labels

**Pipeline Integration:**
- [ ] Format diarized + mapped transcript as plain text: `[Coach]: text...\n[Sarah Chen]: text...`
- [ ] Pass to existing `src/lib/sessions/summarize-session.ts` (same pipeline as manual upload)
- [ ] Session created in `sessions` table with `source: "recall_ai"` field (distinguishes from `"manual"`)
- [ ] Existing AI summary, action item extraction, embedding generation all run unchanged
- [ ] Client Card AI Intelligence Strip regenerated (Story 7.2 hooks into `summarize-session.ts`)

**Deepgram vs Gladia routing:**
- [ ] `TRANSCRIPTION_PROVIDER` env var: `deepgram` | `gladia` | `mock`
- [ ] Gladia: used only when `recall_sessions.source = "recall_ai"` (bot sessions)
- [ ] Deepgram: used for manual uploads (all tiers, Free + Pro)
- [ ] Mock: used in local dev / testing

**Files to create/update:**
- `apps/web/src/lib/sessions/summarize-session.ts` — already exists, no change needed (input format handles speaker-labeled text)
- New: `apps/web/src/lib/services/transcription/gladia-service.ts` (alongside existing `deepgram-service.ts`)
- `apps/web/src/app/api/recall/webhook/route.ts` (Story 6.2) — chain Gladia after `bot.call_ended`
- New: `apps/web/src/app/api/gladia/webhook/route.ts` (if Gladia supports webhooks)
- New: `apps/web/src/lib/sessions/map-speakers.ts`
- New migration: add `diarized_transcript JSONB`, `speaker_map JSONB`, `speaker_review_needed boolean`, `source text` columns to `recall_sessions` and/or `sessions`
- Env vars: `GLADIA_API_KEY`, `GLADIA_WEBHOOK_SECRET`

**Effort estimate:** 1.5 days

---

### Story 6.4: Coach Brief Screen (Hero Feature)

**As a** Pro coach,
**I want** a pre-session brief to automatically appear before any matched calendar event,
**so that** I walk into every session fully prepared without spending any time on manual prep.

**Why this story is the hero feature:**
> "This is the moment a coach realizes MeetSolis ≠ Otter.ai. Justifies $99/mo for a coach seeing 15 clients/week (15 briefs/week = 60+ saved hours/month of mental prep). No competitor in any adjacent space does this." — BRAINSTORM.md §2

**Brief Auto-Activation:**
- [ ] Background check every 5 minutes: find `calendar_events` where `start_time - now() <= coach_brief_window_minutes` AND `client_id IS NOT NULL` AND user is Pro
- [ ] When condition met AND no brief exists yet for this event → generate brief
- [ ] Brief generation: call `hybrid_session_search` (Story 4.1 Solis RPC) with client context + always include 3 most recent sessions verbatim
- [ ] Generated brief stored in `coach_briefs` table:
  - `id`, `user_id`, `client_id`, `calendar_event_id`
  - `content` (JSONB — structured, see layout below)
  - `generated_at`, `dismissed` (boolean, default false)
- [ ] When brief is ready → dashboard shows prominent "COACH BRIEF READY" banner with client name + countdown timer ("in 47 minutes")
- [ ] Route: `/brief/[calendar_event_id]`

**Full Coach Brief Layout (exact spec from BRAINSTORM.md §2):**

```
COACH BRIEF — [Client Name] · in [X] minutes

LAST SESSION ([X weeks/days ago])
  [Client Name] committed to:
    [✓] [completed action item] — DONE
    [○] [open action item] — OPEN
    [○] [open action item] — OPEN
  Key theme: [AI-detected theme from last session]

AI PREP NOTE (Solis-generated)
  [2-3 paragraphs combining:
   - Pattern recognition across all sessions
   - Suggested question or reframe for coach to consider
   - Reference to past breakthrough if relevant and applicable]

PAST BREAKTHROUGHS (top 3)
  [Session X date] — [breakthrough summary, 1 line]
  [Session Y date] — [breakthrough summary, 1 line]
  [Session Z date] — [breakthrough summary, 1 line]

OPEN QUESTIONS (coach-written reminders)
  [Free-text field — coach types their own session prep notes]
  [Stored per client, persists across sessions]
```

**AI Prep Note Generation (from BRAINSTORM.md §9):**
- [ ] Uses `hybrid_session_search` to retrieve top-K sessions for this client
- [ ] Always includes 3 most recent sessions verbatim in prompt context (never rely on retrieval alone for recent data)
- [ ] Prompt must follow §9 process: define perfect output → write prompt → test with 10 real coaching transcripts → iterate → ship
- [ ] Output format requirements: structured (bullets + bold key insights), specific ("Sarah committed to X" not "client made commitments"), actionable (what should coach DO with this), never wall-of-text

**Solis Natural Language Trigger (from BRAINSTORM.md §2):**
- [ ] Solis chat interface detects intent when coach types variants of "prep me for my session with [Name]" or "prepare me for [Name] this afternoon"
- [ ] On detection → Solis responds with a brief summary AND surfaces a "View Coach Brief →" CTA link that navigates to `/brief/[matched_calendar_event_id]` (matched by client name + nearest upcoming event)
- [ ] If no calendar event found for that client → Solis generates an on-demand brief inline in the chat (same content as Coach Brief screen, rendered in Solis response)
- [ ] This path works for both Pro and Free coaches — Free coaches get inline Solis prep (no dedicated brief screen), Pro coaches get the full Coach Brief screen
- [ ] Implementation: keyword/intent detection in Solis query handler (`src/lib/ai/solis.ts`) before RAG call — check for prep-intent pattern, branch response accordingly

**Edge Cases:**
- [ ] Multiple meetings same day → Brief shows next meeting first; "View next brief → [Client Name, HH:MM]" button appears in the brief header; clicking it loads the brief for the next chronological matched event; cycling is linear (next only, no previous); button disappears after last brief of the day
- [ ] Meeting not matched to a Client Card → show "Match this meeting to a client" prompt — NOT a full brief
- [ ] Calendar sync failed / no calendar connected → "Generate brief manually" button on Client Card header (triggers brief generation without event)
- [ ] First-ever session with this client (zero session history) → "First session with [Name] — no history yet" placeholder + suggested opening questions for coach
- [ ] Brief dismissed → dismissal stored (`coach_briefs.dismissed = true`) → "Show brief" button remains in dashboard for 2 hours post-meeting

**UI Requirements:**
- [ ] Full page route at `/brief/[eventId]` — not a modal (coach needs full screen for focus)
- [ ] Dark deep teal theme consistent with current production UI (do NOT use old PRD earth-tone palette)
- [ ] Every AI-generated field is editable inline — click to edit, save on blur (AI is assistant, not authority)
- [ ] "Coach note" field in brief: private, manual entry, never AI-touched
- [ ] Countdown timer: "in 47 minutes" updates every minute
- [ ] Print/export brief as PDF — stretch goal only if time allows

**Feature Gating:**
- [ ] Pro only — Free coaches who navigate to brief route see upgrade prompt
- [ ] Free coaches do NOT see "Coach Brief Ready" dashboard banner

**Files to create/update:**
- New: `apps/web/src/app/(dashboard)/brief/[eventId]/page.tsx`
- New: `apps/web/src/app/(dashboard)/brief/[eventId]/loading.tsx`
- `apps/web/src/app/(dashboard)/page.tsx` — Coach Brief Ready banner + countdown
- `apps/web/src/lib/ai/solis.ts` (Story 4.1) — called to generate AI Prep Note
- New: `apps/web/src/lib/brief/generate-brief.ts`
- New: `apps/web/src/app/api/brief/generate/route.ts`
- New: `apps/web/src/app/api/brief/dismiss/route.ts`
- New migration: `coach_briefs` table + RLS

**Effort estimate:** 2 days

---

### Story 6.5: Coach Brief Settings, Bot Toggle & Live Transcript View

**As a** Pro coach,
**I want** to configure when my Coach Brief activates and control the auto-transcription bot,
**so that** the experience matches my personal coaching workflow and preferences.

**Acceptance Criteria:**

**Coach Brief Settings (in Settings → Preferences tab — Story 5.4):**
- [ ] New setting: "Coach Brief activation window" — select one: `30 minutes` | `1 hour` (default) | `2 hours` | `4 hours`
- [ ] Stored in `user_preferences.coach_brief_window_minutes`: `30` | `60` | `120` | `240`
- [ ] Change takes effect immediately for any future brief generations
- [ ] Label: "How far in advance should your Coach Brief appear?" with clear description

**Bot Toggle Settings:**
- [ ] Global toggle: "Auto-transcribe sessions with MeetSolis Notetaker" (on/off) in Settings → Preferences
- [ ] Stored in `user_preferences.auto_transcribe_enabled` (boolean, default `true` for Pro)
- [ ] Per-meeting override: "Skip bot for this session" toggle on each event in Upcoming Sessions dashboard card
- [ ] Per-meeting override stored in `calendar_events.bot_skipped` (boolean)
- [ ] When globally disabled: upcoming meetings show "Manual upload" badge instead of bot status

**Transcription Provider Preference (from BRAINSTORM.md §8):**
- [ ] New setting in Settings → Preferences: "Transcription provider for manual uploads" — select: `Deepgram Nova-2` (default) | `Gladia`
- [ ] Label: "Which transcription engine should MeetSolis use for manually uploaded audio files?"
- [ ] Stored in `user_preferences.manual_transcription_provider` (`"deepgram"` | `"gladia"`)
- [ ] Default: `"deepgram"` (already integrated, lower cost, sufficient for manual uploads)
- [ ] Gladia option shown for coaches who want higher diarization accuracy on manual uploads (same pricing as bot sessions)
- [ ] This preference is separate from bot sessions — Recall.ai bot always uses Gladia regardless of this setting
- [ ] `TRANSCRIPTION_PROVIDER` env var remains the system-wide override (takes precedence over user preference in dev/staging)

**Live Transcript View (during active Recall.ai session):**
- [ ] While `recall_sessions.status = 'in_meeting'`: show collapsible "Live Transcript" panel in dashboard
- [ ] Panel is **hidden by default** — coach must click "Show live transcript ▾" to expand
- [ ] Reason for hidden default: reduces visual noise during session, coach is in the meeting
- [ ] Real-time updates via Supabase Realtime subscription on `recall_sessions.live_transcript` column
- [ ] `live_transcript`: JSONB array, appended incrementally as Recall.ai streams data
- [ ] Each entry: `{ speaker: string, text: string, timestamp: float }`
- [ ] Speaker labels use mapped names (Coach / client name) once mapping is confirmed
- [ ] Panel can be collapsed again mid-session: "Hide transcript ▴"
- [ ] Panel auto-closes when `recall_sessions.status` changes from `in_meeting` to `done`

**Files to create/update:**
- `apps/web/src/app/(dashboard)/settings/page.tsx` (Story 5.4) — add Coach Brief window + bot toggle to Preferences tab
- `apps/web/src/app/(dashboard)/page.tsx` — live transcript collapsible panel + per-meeting bot skip toggle
- `packages/shared/src/types/` — add `coach_brief_window_minutes`, `auto_transcribe_enabled` to `UserPreferences` type
- New migration: add `coach_brief_window_minutes`, `auto_transcribe_enabled` columns to `user_preferences`; add `bot_skipped` to `calendar_events`; add `live_transcript JSONB` to `recall_sessions`

**Effort estimate:** 1 day

---

## Epic Success Criteria

- [ ] Coach connects Google Calendar → upcoming sessions appear in dashboard within 15 minutes
- [ ] Pro coach's Recall.ai bot joins sessions automatically (within 5 min of start)
- [ ] Gladia transcription + speaker mapping → session appears in Client Card within 10 min of meeting end
- [ ] Coach Brief auto-generates within correct window (30/60/120/240 min)
- [ ] Coach Brief AI Prep Note tested with 10+ real coaching transcripts (BRAINSTORM §9 rule)
- [ ] Every AI field in Coach Brief is editable inline
- [ ] Free coaches see no bot dispatches and no Coach Brief banners — upgrade prompt only
- [ ] Live transcript hidden by default, expandable on demand
- [ ] All edge cases handled: bot fails, no history, multiple meetings same day

## Definition of Done

- [ ] All 5 stories completed with acceptance criteria met
- [ ] Existing session pipeline (Epic 3) unchanged and functional
- [ ] Solis Intelligence (Epic 4) unaffected
- [ ] Billing tier enforcement (Story 5.2) applied to all Pro-only features
- [ ] No regression in client cards, session upload, or Solis Q&A
- [ ] New DB tables have RLS policies
- [ ] New env vars documented in `.env.example`
- [ ] **PROMPT GATE (BRAINSTORM §9 — blocking):** Every AI prompt in this epic (Coach Brief AI Prep Note, Solis prep-intent detection) tested with minimum 10 real coaching transcripts before the story is marked Done. No AI story ships with untested prompts. Generic output = coaches don't trust = product fails.

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Recall.ai bot fails to join | Fallback: auto-prompt manual upload. Status = error surfaced in dashboard. |
| Gladia transcription latency | Async pipeline — session appears "processing" until done. Coach Brief not blocked by this. |
| Calendar OAuth refresh token expiry | Auto-refresh on every sync. Re-auth prompt if refresh fails. |
| AI Prep Note quality (generic output = coaches don't trust = churn) | 10-test rule enforced before ship. See BRAINSTORM §9. |
| Coach Brief shows wrong meeting | Match by attendee email first, then by title keyword. Manual match fallback always available. |
| Speaker misidentification | Coach can manually reassign speakers. Flag for review when >2 speakers detected. |

## Compatibility Requirements

- [ ] Existing manual upload flow (Epic 3) unchanged
- [ ] Deepgram integration unchanged (Free plan + manual Pro path)
- [ ] Solis Q&A (Epic 4) unaffected
- [ ] Client Card UI (Epic 2) extended but not broken
- [ ] Settings page (Story 5.4) extended with new sections only
- [ ] All new API routes use existing standard error handler pattern
