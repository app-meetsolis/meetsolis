# Epic 3: Session Memory

**Version:** 3.0
**Status:** Not Started
**Priority:** P0 (Critical — MVP Core Feature)
**Target Timeline:** Week 2 (March 8–14, 2026)
**Dependencies:** Epic 1 (Complete), Epic 2 (Client Cards — Stories 2.1–2.5 Complete)
**Last Updated:** March 8, 2026

---

## Epic Overview

Build the session memory system: coaches upload coaching session transcripts (manually or via auto-transcription), AI generates structured summaries and extracts action items, and sessions are organized in a reverse-chronological timeline per client.

**This is the core value loop:** Upload transcript → AI summary → action items extracted → searchable history.

**Goal:** Enable coaches to have a permanent, searchable record of every coaching session, with AI-extracted insights and action items, without changing their existing workflow.

---

## Stories

### Story 3.1: Session DB Schema & API

**Status:** Not Started
**Priority:** P0
**Effort:** 0.5 days
**Dependencies:** Epic 2 (clients table exists)

**As a developer, I need the sessions and action_items tables created with proper RLS and API routes, so the rest of Epic 3 can build on a solid data foundation.**

#### Database Schema

```sql
-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID

  session_date DATE NOT NULL,
  title TEXT NOT NULL,

  transcript_text TEXT,             -- Pasted or extracted from file
  transcript_file_url TEXT,         -- Supabase Storage URL (.txt/.docx)
  transcript_audio_url TEXT,        -- Supabase Storage URL (audio/video for auto-transcription)

  summary TEXT,                     -- AI-generated summary
  key_topics TEXT[],                -- AI-extracted topics array
  embedding vector(1536),           -- pgvector embedding of summary (Solis hybrid RAG)

  status TEXT DEFAULT 'pending',    -- 'pending' | 'processing' | 'complete' | 'error'

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_client_sessions ON sessions(client_id);
CREATE INDEX idx_user_sessions ON sessions(user_id);
CREATE INDEX idx_session_date ON sessions(client_id, session_date DESC);
CREATE INDEX idx_sessions_embedding ON sessions USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_all" ON sessions FOR ALL USING (true); -- Enforced via user_id filter in API

-- Action Items table
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',    -- 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to TEXT,                 -- 'coach' | 'client'

  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP            -- Set when status = 'completed'
);

CREATE INDEX idx_session_actions ON action_items(session_id);
CREATE INDEX idx_client_actions ON action_items(client_id);
CREATE INDEX idx_pending_actions ON action_items(user_id, status) WHERE status = 'pending';

ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "action_items_all" ON action_items FOR ALL USING (true);
```

#### API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/sessions?client_id=[id]` | List sessions for a client (reverse-chron) |
| POST | `/api/sessions` | Create session (with transcript upload) |
| GET | `/api/sessions/[id]` | Get session detail |
| PUT | `/api/sessions/[id]` | Update session (edit summary, title) |
| DELETE | `/api/sessions/[id]` | Delete session (cascades action items) |
| POST | `/api/sessions/[id]/summarize` | Trigger AI summarization |
| GET | `/api/action-items?client_id=[id]` | List action items for a client |
| POST | `/api/action-items` | Create manual action item |
| PUT | `/api/action-items/[id]` | Update status, mark complete |

#### Acceptance Criteria

- [ ] `sessions` table created with all columns and indexes
- [ ] `action_items` table created with all columns and indexes
- [ ] RLS enabled on both tables
- [ ] All API routes implemented with user_id enforcement
- [ ] Cascade delete: deleting a client removes all sessions and action_items
- [ ] Cascade delete: deleting a session removes its action_items

---

### Story 3.2: Manual Transcript Upload

**Status:** Not Started
**Priority:** P0
**Effort:** 1 day
**Dependencies:** Story 3.1

**As a coach, I want to upload my session transcript as a text file or docx, or paste it directly, so I can log a coaching session in under 2 minutes.**

#### Acceptance Criteria

- [ ] Accepted file types: `.txt` (direct text read), `.docx` (parsed via `mammoth` library)
- [ ] Maximum file size: 25MB
- [ ] Paste/type text option: textarea with 50,000 character limit
- [ ] Session date picker (required, defaults to today)
- [ ] Session title input (required, e.g., "Session 5 — Leadership Transition")
- [ ] Validation: requires at least one of (file upload OR pasted text)
- [ ] File uploaded to Supabase Storage → URL stored in `sessions.transcript_file_url`
- [ ] Pasted/extracted text stored in `sessions.transcript_text`
- [ ] On save: session created with `status = 'pending'`, AI summarization triggered automatically
- [ ] Error states: file too large, wrong format, upload failed

#### Technical Implementation

- `apps/web/src/lib/files/parseTranscript.ts`:
  - `.txt`: read as UTF-8 string
  - `.docx`: `mammoth.extractRawText({ buffer })` → plain text string
  - Returns: `{ text: string, sourceType: 'txt' | 'docx' | 'paste' }`
- Upload to Supabase Storage bucket `transcripts/[userId]/[sessionId]/[filename]`
- Use multipart form data for file upload

---

### Story 3.3: Auto-Transcription

**Status:** Not Started
**Priority:** P0
**Effort:** 1 day
**Dependencies:** Story 3.1

**As a coach, I want to upload the recording of my coaching session and have it automatically transcribed, so I don't have to manually type or copy a transcript.**

#### Accepted File Formats

| Format | Extension | Max Size |
|--------|-----------|---------|
| MP3 audio | .mp3 | 500MB |
| MP4 video | .mp4 | 500MB |
| M4A audio | .m4a | 500MB |
| WAV audio | .wav | 500MB |
| WebM audio/video | .webm | 500MB |

#### Provider Abstraction

Configured via `TRANSCRIPTION_PROVIDER` environment variable:

| Value | Provider | Notes |
|-------|----------|-------|
| `placeholder` | Dev stub | Returns instant mock transcript, no API cost. Default for local dev. |
| `deepgram` | Deepgram Nova-2 | **Production default.** 36% lower WER vs competitors. Built-in speaker diarization (identifies coach vs client). $0.19/session avg. |
| `openai-whisper` | OpenAI Whisper | Alternative. Good accuracy, no diarization. |

#### Provider Interface

```typescript
interface TranscriptionProvider {
  transcribe(audioUrl: string): Promise<TranscriptResult>
}

interface TranscriptResult {
  text: string         // Full transcript text
  speakers?: Speaker[] // Diarization result (Deepgram only)
  duration?: number    // Audio duration in seconds
}
```

Files:
- `apps/web/src/lib/transcription/provider.ts` — interface
- `apps/web/src/lib/transcription/providers/deepgram.ts` — Deepgram implementation
- `apps/web/src/lib/transcription/providers/placeholder.ts` — dev stub
- `apps/web/src/lib/transcription/index.ts` — `getTranscriptionProvider()` reads env var

#### Acceptance Criteria

- [ ] Audio/video file uploaded to Supabase Storage → URL stored in `sessions.transcript_audio_url`
- [ ] Session `status` set to `'processing'` immediately after upload
- [ ] Transcription job triggered asynchronously
- [ ] On transcription complete: `sessions.transcript_text` populated, `status` → `'complete'`, AI summarization triggered
- [ ] On transcription error: `status` → `'error'`, error message stored
- [ ] Progress indicator shown in UI while status is `'processing'`
- [ ] Speaker diarization labels preserved in transcript (when available)

---

### Story 3.4: AI Summary Generation

**Status:** Not Started
**Priority:** P0
**Effort:** 1 day
**Dependencies:** Story 3.2 or 3.3 (transcript text available)

**As a coach, I want an AI-generated summary of my session with key topics and action items extracted, so I spend zero time on post-session documentation.**

#### Provider Abstraction

Configured via `AI_PROVIDER` environment variable:

| Value | Provider | Notes |
|-------|----------|-------|
| `placeholder` | Dev stub | Returns instant mock summary, no API cost. Default for local dev. |
| `claude` | Claude Sonnet 4.5 | **Production default.** Prompt caching enabled for ICF templates. |
| `openai` | GPT-4o-mini | Alternative. |

#### Provider Interface

```typescript
interface AIProvider {
  summarizeSession(transcript: string, ctx: ClientContext): Promise<SessionSummary>
  generateEmbedding(text: string): Promise<number[]>
  queryIntelligence(query: string, sessions: SessionContext[]): Promise<SolisResponse>
}

interface SessionSummary {
  title: string
  summary: string
  key_topics: string[]
  action_items: { description: string; assigned_to: 'coach' | 'client' }[]
}
```

Files:
- `apps/web/src/lib/ai/provider.ts` — interface
- `apps/web/src/lib/ai/providers/claude.ts` — Claude Sonnet 4.5 implementation
- `apps/web/src/lib/ai/providers/openai.ts` — GPT-4o-mini implementation
- `apps/web/src/lib/ai/providers/placeholder.ts` — dev stub
- `apps/web/src/lib/ai/index.ts` — `getAIProvider()` reads `AI_PROVIDER` env var
- `apps/web/src/lib/ai/prompts.ts` — ICF-aligned prompt templates
- `apps/web/src/lib/ai/summarize.ts` — response parser → SessionSummary

#### ICF-Aligned Summary Prompt Guidelines

Prompts must:
- Use coaching vocabulary (not therapy language)
- Identify client-stated goals and progress markers
- Distinguish coach questions from client responses
- Flag commitments made by coach and client separately
- Avoid clinical/diagnostic language

#### Acceptance Criteria

- [ ] `POST /api/sessions/[id]/summarize` triggers AI summarization
- [ ] AI generates: title, summary paragraph, key_topics[], action_items[]
- [ ] Action items stored as `action_items` records (with assigned_to: 'coach' | 'client')
- [ ] Embedding generated from summary text → stored in `sessions.embedding` (vector 1536)
- [ ] Session `status` → `'complete'` on success, `'error'` on failure
- [ ] Manual edit of summary supported (PUT `/api/sessions/[id]`)
- [ ] "Regenerate Summary" button triggers re-summarization
- [ ] Cost target: <$0.05/session

---

### Story 3.5: Session Timeline UI

**Status:** Not Started
**Priority:** P0
**Effort:** 1 day
**Dependencies:** Story 3.1, Story 2.6 (Client Detail page)

**As a coach, I want to see all my sessions for a client in a clear timeline, so I can quickly review session history and upload new sessions.**

#### Components

**`apps/web/src/components/sessions/SessionUploadModal.tsx`**
- 2-tab modal:
  - **Tab 1: Manual Upload / Paste** — file input (.txt/.docx) + textarea for paste + date picker + title input
  - **Tab 2: Auto-Transcribe Audio** — file input (audio/video formats) + date picker + title input
- "Processing..." state while transcription/summarization runs
- Toast on success/error

**`apps/web/src/components/sessions/SessionTimeline.tsx`**
- Reverse-chronological list of session cards
- "Upload Session Transcript" button at top
- Empty state: "No sessions yet. Upload your first session transcript to get started."
- Loading skeleton while fetching

**`apps/web/src/components/sessions/SessionCard.tsx`**
- Collapsed view: date, title, summary snippet (first 150 chars), key topic badges (max 3), action item count badge
- Expanded view: full summary, all key topics, full action item list, "View Transcript" link
- Status indicator: processing spinner if `status = 'processing'`

#### Acceptance Criteria

- [ ] SessionTimeline renders on Client Detail page
- [ ] Sessions displayed reverse-chronological
- [ ] Each SessionCard shows collapsed/expanded states
- [ ] Upload modal opens from timeline "Upload Session" button
- [ ] Processing sessions show spinner/status
- [ ] Empty state shown when no sessions exist
- [ ] Mobile responsive

---

### Story 3.6: Action Item Tracking UI

**Status:** Not Started
**Priority:** P0
**Effort:** 0.5 days
**Dependencies:** Story 3.4 (action items auto-created), Story 3.5 (session cards)

**As a coach, I want to track action items from coaching sessions, so I can follow up on commitments without relying on memory.**

#### Components

**`apps/web/src/components/sessions/ActionItemList.tsx`**
- List of action items with:
  - Checkbox (quick-complete → sets status to 'completed', records `completed_at`)
  - Description text
  - Assignee badge: "Coach" (blue) or "Client" (green)
  - Status dropdown: Pending | In Progress | Completed | Cancelled
- "Add Action Item" button → inline input to create manual action item
- Completed items shown with strikethrough, dimmed

#### Acceptance Criteria

- [ ] Action items displayed within expanded SessionCard
- [ ] Checkbox marks item complete (PUT `/api/action-items/[id]`)
- [ ] Status dropdown changes status
- [ ] Assignee badge (coach/client) displayed
- [ ] Manual action item creation works (POST `/api/action-items`)
- [ ] Completed items visually distinct (strikethrough)
- [ ] Pending action items count shown on Client Detail header

---

## Epic Success Criteria

- [ ] Coach can upload .txt or .docx transcript and see AI summary in <15 seconds
- [ ] Coach can upload audio file and see AI summary in <2 minutes (Deepgram async)
- [ ] Action items extracted automatically from summary
- [ ] Coach can mark action items complete
- [ ] Session timeline shows all sessions for a client, reverse-chronological
- [ ] Free tier: 3 lifetime AI sessions enforced; manual uploads always allowed
- [ ] Pro tier: 25/month AI sessions enforced
- [ ] RLS: users can only access their own sessions
- [ ] No data leakage between coaches

---

## Technical Architecture

### Session Processing Pipeline

```
Manual upload (.txt/.docx/paste):
  User uploads file → Parse to text → Store in Supabase Storage → Create session (status: pending)
  → POST /api/sessions/[id]/summarize → AI Provider → SessionSummary
  → Create action_items records → Generate embedding → Update session (status: complete)

Auto-transcription (audio/video):
  User uploads audio → Store in Supabase Storage → Create session (status: processing)
  → TranscriptionProvider.transcribe(audioUrl) → transcript text
  → POST /api/sessions/[id]/summarize → AI Provider → SessionSummary
  → Create action_items records → Generate embedding → Update session (status: complete)
  → Delete audio from Supabase Storage → Set transcript_audio_url = NULL

### Audio Deletion Policy

Audio files are deleted from Supabase Storage immediately after successful transcription. The `transcript_audio_url` field is set to NULL post-deletion. On transcription failure, audio is retained for retry. This prevents unbounded storage cost accumulation (Deepgram charges ~$6.50/user; keeping raw audio adds storage cost on top).
```

### Environment Variables

```
AI_PROVIDER=placeholder           # 'placeholder' | 'claude' | 'openai'
ANTHROPIC_API_KEY=                # Required if AI_PROVIDER=claude
OPENAI_API_KEY=                   # Required if AI_PROVIDER=openai

TRANSCRIPTION_PROVIDER=placeholder  # 'placeholder' | 'deepgram' | 'openai-whisper'
DEEPGRAM_API_KEY=                   # Required if TRANSCRIPTION_PROVIDER=deepgram
```
