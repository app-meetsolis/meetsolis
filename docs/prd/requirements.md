# Functional Requirements

**Version:** 3.0
**Last Updated:** March 8, 2026
**Status:** Approved — MVP Locked

---

## FR1: Authentication & User Management

- **FR1.1:** User signup via email/password or Google OAuth (via Clerk)
- **FR1.2:** Login/logout with session management
- **FR1.3:** Password reset via email
- **FR1.4:** User profile: name, email, timezone
- **FR1.5:** GDPR-compliant data deletion (right to erasure)

---

## FR2: Client Cards

- **FR2.1:** Create client with fields: Name (required), Goal, Company, Role, Start Date, Notes, Website
- **FR2.2:** Edit and delete client records
- **FR2.3:** Client card displays: name, goal, coaching start date, total sessions count, pending action items count, last session date
- **FR2.4:** Search clients by name (real-time, client-side filter)
- **FR2.5:** Free tier: 1 active client maximum; Pro: unlimited
- **FR2.6:** Upgrade CTA shown when free user attempts to add second client
- **FR2.7:** Client deletion cascades to all sessions, action items, and solis queries

---

## FR3: Session Memory — Manual Upload

- **FR3.1:** Upload session transcript as .txt file (max 25MB)
- **FR3.2:** Upload session transcript as .docx file (max 25MB, parsed via mammoth)
- **FR3.3:** Paste session transcript as plain text (max 50,000 characters)
- **FR3.4:** User sets session date (date picker) and session title when uploading
- **FR3.5:** Validation: at least one of (file upload OR pasted text) required
- **FR3.6:** File stored in Supabase Storage; URL saved in `sessions.transcript_file_url`

---

## FR4: Session Memory — Auto-Transcription

- **FR4.1:** Upload audio/video file for automatic transcription
- **FR4.2:** Accepted formats: .mp3, .mp4, .m4a, .wav, .webm (max 500MB)
- **FR4.3:** Default provider: Deepgram Nova-2 (36% lower WER, built-in speaker diarization)
- **FR4.4:** Alternative provider: OpenAI Whisper (via `TRANSCRIPTION_PROVIDER` env var)
- **FR4.5:** Dev placeholder: instant mock transcript (no API cost)
- **FR4.6:** Async processing: session `status` transitions: pending → processing → complete/error
- **FR4.7:** Progress indicator displayed during processing
- **FR4.8:** Audio file stored in Supabase Storage; URL saved in `sessions.transcript_audio_url`

---

## FR5: AI Summary Generation

- **FR5.1:** AI automatically generates summary from session transcript after upload
- **FR5.2:** Provider-agnostic: default Claude Sonnet 4.5, alternative GPT-4o-mini (via `AI_PROVIDER` env var)
- **FR5.3:** Dev placeholder: instant mock summary (no API cost)
- **FR5.4:** Extracted fields: session title, summary paragraph, key_topics[] array, action_items[] (description + assigned_to)
- **FR5.5:** Action items auto-created as `action_items` records (assigned to 'coach' or 'client')
- **FR5.6:** Session embedding auto-generated from summary text and stored in `sessions.embedding` (vector 1536)
- **FR5.7:** Manual editing of generated summary supported
- **FR5.8:** Regenerate summary option available
- **FR5.9:** Free tier: 3 lifetime AI sessions; Pro: 25/month. Manual uploads without AI processing are always unlimited.

---

## FR6: Session Timeline UI

- **FR6.1:** Client detail page shows reverse-chronological session timeline
- **FR6.2:** Each session card shows: date, title, summary snippet, key topics, action item count
- **FR6.3:** Session cards are expandable (show full summary, transcript, action items)
- **FR6.4:** Empty state: "Upload your first session transcript" with upload button
- **FR6.5:** Session upload via 2-tab modal: Tab 1 (Manual Upload/Paste) | Tab 2 (Auto-Transcribe Audio)

---

## FR7: Action Item Tracking

- **FR7.1:** Action items auto-extracted from AI summary and created as records
- **FR7.2:** Each action item has: description, status (pending/in_progress/completed/cancelled), assigned_to (coach/client)
- **FR7.3:** Manual action item creation (add without a session)
- **FR7.4:** Mark action item complete with checkbox; `completed_at` timestamp recorded
- **FR7.5:** Status dropdown: pending → in_progress → completed/cancelled
- **FR7.6:** Assignee badge (coach/client) displayed

---

## FR8: Solis Intelligence

- **FR8.1:** Coach can ask natural language questions about any client's history
- **FR8.2:** Hybrid RAG query flow: embed query → pgvector top-3 relevant sessions → always include 3 most recent sessions (deduplicate, max 6 total) → AI generates answer with citations
- **FR8.3:** Response includes: answer text + citation list [{session_date, title}]
- **FR8.4:** Client-specific mode: "Ask Solis about [Client Name]" (scoped to that client)
- **FR8.5:** Global mode: cross-client queries on `/dashboard/intelligence` page
- **FR8.6:** Query and response stored in `solis_queries` table
- **FR8.7:** Usage counter displayed: "X of 50 lifetime queries used" (free) or "X of 2,000 monthly queries" (pro)
- **FR8.8:** Free tier: 50 lifetime queries; Pro: 2,000/month. Upgrade CTA on limit hit.

---

## FR9: Usage Limits & Billing

- **FR9.1:** Free tier limits enforced at API level: 1 client, 3 lifetime AI sessions, 50 lifetime Solis queries
- **FR9.2:** Pro tier limits enforced: unlimited clients, 25 AI sessions/month, 2,000 Solis queries/month
- **FR9.3:** Monthly reset via `transcript_reset_at` and `query_reset_at` timestamps in `usage_tracking` table
- **FR9.4:** Upgrade prompt modal shown when any limit is hit
- **FR9.5:** Stripe Checkout for Pro upgrade ($99/mo or $948/yr)
- **FR9.6:** Webhook events handled: checkout.session.completed, invoice.paid, subscription.updated, subscription.deleted
- **FR9.7:** Settings page shows current plan, usage stats, and manage subscription button

---

## FR10: Onboarding

- **FR10.1:** 5-step onboarding flow for new users
- **FR10.2:** Step 1 — Welcome: explain MeetSolis value for executive coaches
- **FR10.3:** Step 2 — Add First Client: coached client creation form
- **FR10.4:** Step 3 — Upload Transcript: pre-loaded sample coaching transcript available
- **FR10.5:** Step 4 — View Summary: highlight AI-generated summary, key topics, action items
- **FR10.6:** Step 5 — Try Solis: ask a sample question about the demo session
- **FR10.7:** Target: coach reaches first "aha moment" in under 5 minutes

---

## FR11: Navigation & Layout

- **FR11.1:** Left sidebar navigation: Clients, Intelligence, Settings
- **FR11.2:** Mobile responsive: sidebar collapses to hamburger overlay on mobile
- **FR11.3:** Active nav state highlighted

---

## Non-Functional Requirements

- **NFR1:** Solis Intelligence response time: <5 seconds
- **NFR2:** AI summary generation: <15 seconds for typical 45-min session transcript
- **NFR3:** Client list load time: <500ms (up to 50 clients)
- **NFR4:** Mobile responsive (all core flows)
- **NFR5:** RLS enforced — zero cross-user data access
- **NFR6:** No training on user data (privacy-first)
