# Epic 3: Meeting Memory & Logging

**Version:** 2.0
**Status:** Not Started
**Priority:** P0 (Critical - MVP Core Feature)
**Target Timeline:** Week 3 (Jan 20-26, 2026)
**Dependencies:** Epic 1 (Complete), Epic 2 (Client Cards)

---

## Epic Overview

Build the meeting logging system where users can manually upload transcripts/recordings, and AI generates summaries and extracts action items. Meeting history is organized by client.

**Goal:** Enable users to log 20 AI-transcribed meetings/month (Pro) or 3 (Free) with unlimited manual uploads.

---

## User Stories

### Story 3.1: Meeting Database Schema & API

**As a** user
**I want to** store meeting data securely
**So that** my meeting history is preserved and searchable

**Acceptance Criteria:**
- [ ] Database schema: meetings table with RLS
- [ ] Fields: id, user_id, client_id, title, date, duration, platform (Google Meet/Zoom/Other), meeting_url, notes (manual), transcript (TEXT), summary (AI-generated), created_at, updated_at
- [ ] API routes: POST /api/meetings (create), GET /api/meetings (list), GET /api/meetings/[id] (detail), PUT /api/meetings/[id] (update), DELETE /api/meetings/[id] (delete)
- [ ] Meetings linked to clients (foreign key: client_id)
- [ ] Cascade delete: If client deleted, meetings deleted
- [ ] Index on client_id + date for fast queries

**Database:**
```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER,  -- Extracted from recording or manual entry
  platform TEXT,  -- 'google_meet', 'zoom', 'other'
  meeting_url TEXT,

  notes TEXT,  -- Manual notes
  transcript TEXT,  -- From Gladia or manual upload
  summary JSONB,  -- {overview, key_points[], decisions[], questions[]}

  -- Files
  transcript_file_path TEXT,  -- Supabase Storage path
  recording_file_path TEXT,

  -- Metadata
  ai_processed BOOLEAN DEFAULT FALSE,
  ai_processed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Estimated Effort:** 0.5 days

---

### Story 3.2: Manual Meeting Logging UI

**As a** user
**I want to** log meetings manually with basic details
**So that** I can track meeting history without AI transcription

**Acceptance Criteria:**
- [ ] "+ Log Meeting" button (Meetings page, Client detail page)
- [ ] Log Meeting form:
  - [ ] Select Client* (dropdown, searchable)
  - [ ] Meeting Title* (text input)
  - [ ] Date* (date picker, default: today)
  - [ ] Platform: Google Meet / Zoom / Other (radio buttons)
  - [ ] Meeting URL (optional text input)
  - [ ] Manual Notes (textarea, rich text)
  - [ ] Upload Transcript (TXT, SRT, VTT files, max 10MB)
  - [ ] Upload Recording (MP3, MP4, M4A, WAV, max 100MB)
- [ ] Drag-and-drop file upload
- [ ] File upload progress bar
- [ ] Validation: At least one of (Manual Notes OR Transcript OR Recording) required
- [ ] Save button → Creates meeting, uploads files to Supabase Storage
- [ ] Success: "Meeting logged successfully. AI summary will be ready in ~1 minute." (if transcript provided)

**File Upload:**
- Use Supabase Storage
- Path: `{user_id}/meetings/{meeting_id}/transcript.txt` or `recording.mp3`
- Generate signed URL for download

**Estimated Effort:** 1 day

---

### Story 3.3: Gladia Transcription Integration

**As a** user
**I want** recordings auto-transcribed
**So that** I don't have to manually type transcripts

**Acceptance Criteria:**
- [ ] Gladia API integration (/api/transcribe/gladia)
- [ ] Upload recording → Trigger transcription job
- [ ] Job status: queued, processing, completed, failed
- [ ] Polling endpoint: GET /api/meetings/[id]/transcription-status
- [ ] Transcription stored in meetings.transcript
- [ ] Error handling: If Gladia fails, allow manual transcript upload
- [ ] Free tier: 3 transcriptions/month enforced
- [ ] Pro tier: 20 transcriptions/month enforced
- [ ] Cost tracking: Log Gladia usage in ai_usage_tracking table

**Gladia Flow:**
1. User uploads recording → Saved to Supabase Storage
2. Server sends recording URL to Gladia API
3. Gladia returns transcription (async)
4. Server polls Gladia for status
5. When complete, save transcript to DB
6. Trigger AI summary generation (Story 3.4)

**Estimated Effort:** 1 day

---

### Story 3.4: AI Meeting Summary Generation

**As a** user
**I want** AI to summarize meetings
**So that** I can quickly review what was discussed

**Acceptance Criteria:**
- [ ] AI summary endpoint: POST /api/meetings/[id]/generate-summary
- [ ] Uses GPT-4o-mini with custom prompt
- [ ] Summary structure (JSONB):
  ```json
  {
    "overview": "Brief 2-3 sentence summary",
    "key_points": ["Point 1", "Point 2", ...],
    "decisions": ["Decision 1", "Decision 2", ...],
    "questions": ["Question 1", "Question 2", ...],
    "next_steps": ["Step 1", "Step 2", ...]
  }
  ```
- [ ] Summary generation time: <60 seconds for 1-hour meeting
- [ ] Loading state: "Generating summary..." (shimmer effect)
- [ ] Error handling: If AI fails, show error + retry button
- [ ] Manual edit: User can edit AI-generated summary
- [ ] Regenerate button: Re-run AI summary
- [ ] Summary displayed on meeting detail page

**GPT Prompt Template:**
```
You are summarizing a client meeting. Be concise, professional, and actionable.

Meeting Transcript:
{transcript}

Provide:
1. Overview (2-3 sentences)
2. Key Discussion Points (3-5 bullet points)
3. Decisions Made (list explicit decisions)
4. Questions Raised (unanswered questions)
5. Next Steps (action items without owner - we'll extract those separately)

Output as JSON.
```

**Estimated Effort:** 1 day

---

### Story 3.5: Action Item Extraction

**As a** user
**I want** AI to extract action items from meetings
**So that** I don't miss follow-ups

**Acceptance Criteria:**
- [ ] Action items table:
  ```sql
  CREATE TABLE action_items (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    client_id UUID REFERENCES clients(id),
    meeting_id UUID REFERENCES meetings(id),
    description TEXT NOT NULL,
    owner TEXT,  -- 'user', 'client', 'unknown'
    due_date DATE,
    status TEXT DEFAULT 'to_prepare',  -- 'to_prepare', 'promised', 'done'
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] AI extracts action items from transcript
- [ ] Action items linked to meeting + client
- [ ] Displayed on client detail page (Action Items tab)
- [ ] Checkbox to mark done
- [ ] Edit action item (description, due date, status)
- [ ] Delete action item
- [ ] Free tier: 10 action items total, Pro tier: unlimited

**AI Extraction Prompt:**
```
Extract action items from this meeting transcript.

For each item, identify:
- Description (what needs to be done)
- Owner (user/client/unknown)
- Due date (if mentioned, else null)

Output as JSON array.
```

**Estimated Effort:** 1 day

---

### Story 3.6: Meeting History View

**As a** user
**I want to** view all my meetings in chronological order
**So that** I can review past conversations

**Acceptance Criteria:**
- [ ] Meetings page: `/meetings`
- [ ] List all meetings (newest first)
- [ ] Meeting card displays:
  - [ ] Date badge (e.g., "Jan 3, 2026")
  - [ ] Client name + Meeting title
  - [ ] Icon + count: 💬 X key points, ✅ X action items, 🕐 X minutes
- [ ] Click card → Navigate to meeting detail page
- [ ] Empty state: "No meetings yet. Log your first meeting."
- [ ] Loading: Skeleton cards
- [ ] Pagination: 20 meetings per page
- [ ] Filter by client (dropdown)
- [ ] Search by meeting title

**Meeting Card Design:**
- Similar to client card style
- White background, subtle shadow
- Badge for date
- Metadata icons with counts

**Estimated Effort:** 1 day

---

### Story 3.7: Meeting Detail View

**As a** user
**I want to** view full meeting details
**So that** I can see transcript, summary, action items

**Acceptance Criteria:**
- [ ] Meeting detail page: `/meetings/[id]`
- [ ] Header: Back button, Client name, Meeting title, Date, Platform badge
- [ ] Sections:
  - [ ] AI Summary (collapsible)
  - [ ] Full Transcript (collapsible, searchable)
  - [ ] Manual Notes (editable)
  - [ ] Action Items (list with checkboxes)
- [ ] Edit button → Edit meeting form (title, date, notes)
- [ ] Delete button → Delete meeting (with confirmation)
- [ ] Download transcript (TXT file)
- [ ] Download recording (if exists)
- [ ] Share summary (copy to clipboard)

**Layout:**
```
┌─────────────────────────────────────────┐
│ ← Back   Marcus Thorne · Q1 Strategy   │
│          Jan 3, 2026  [Zoom]            │
├─────────────────────────────────────────┤
│ ▼ AI Summary                            │
│   "Discussed Q1 goals..."               │
│   Key Points: ...                       │
├─────────────────────────────────────────┤
│ ▼ Full Transcript                       │
│   [00:00] User: "Let's start with..."   │
│   [00:15] Marcus: "I think we should..."│
├─────────────────────────────────────────┤
│ ▼ Manual Notes                          │
│   [Rich text editor]                    │
├─────────────────────────────────────────┤
│ ▼ Action Items (3)                      │
│   [ ] Follow up on pricing proposal     │
│   [✓] Send Q1 roadmap draft             │
│   [ ] Schedule follow-up meeting        │
└─────────────────────────────────────────┘
```

**Estimated Effort:** 1 day

---

### Story 3.8: Client Detail - Meetings Tab

**As a** user
**I want to** see all meetings with a client
**So that** I can review our conversation history

**Acceptance Criteria:**
- [ ] Client detail page → Meetings tab
- [ ] List all meetings with this client (newest first)
- [ ] Meeting cards (same design as Meetings page)
- [ ] "+ Log Meeting" button (pre-fills client)
- [ ] Empty state: "No meetings yet. Log your first meeting with [Client Name]."
- [ ] Clicking meeting card → Navigate to meeting detail
- [ ] Show total meeting count: "5 meetings"
- [ ] Show last meeting date on client card (computed from meetings)

**Last Meeting Calculation:**
- Computed field on client card
- Query: `SELECT MAX(date) FROM meetings WHERE client_id = ?`
- Display as "2 days ago", "1 week ago", "Yesterday"

**Estimated Effort:** 0.5 days

---

### Story 3.9: Meeting Platform Integration (Links)

**As a** user
**I want to** paste meeting links OR auto-create them
**So that** I can jump directly to meetings

**Acceptance Criteria:**
- [ ] Meeting form: "Meeting Link" field (optional)
- [ ] Supports Google Meet, Zoom URLs
- [ ] Validate URL format (must be valid URL)
- [ ] Display platform badge based on URL:
  - meet.google.com → "Google Meet" badge
  - zoom.us → "Zoom" badge
  - Other → "Other" badge
- [ ] "Join Meeting" button on meeting detail page (if URL exists)
- [ ] Opens link in new tab
- [ ] (Future - Post-MVP): OAuth integration to auto-create links

**URL Validation:**
- Google Meet: `https://meet.google.com/*`
- Zoom: `https://zoom.us/*` or `https://*.zoom.us/*`

**Estimated Effort:** 0.5 days

---

## Epic Success Criteria

**Functional:**
- [ ] Users can log meetings manually with notes
- [ ] Users can upload recordings → AI transcribes → Summary generated
- [ ] Free tier: 3 AI transcriptions/month enforced
- [ ] Pro tier: 20 AI transcriptions/month enforced
- [ ] Action items extracted and linked to meetings
- [ ] Meeting history visible on client cards and Meetings page

**Technical:**
- [ ] Gladia integration working (>90% transcription accuracy)
- [ ] GPT summary generation <60 seconds
- [ ] File uploads to Supabase Storage working
- [ ] RLS policies prevent cross-user access
- [ ] Cascade deletes working (client deleted → meetings deleted)

**User Experience:**
- [ ] User can log meeting + upload recording in <2 minutes
- [ ] AI summary feels valuable (not generic)
- [ ] Clear progress indicators during transcription
- [ ] No data loss during errors

---

## Technical Architecture

### File Storage

**Supabase Storage Buckets:**
- `meetings-transcripts/` - Transcript files (TXT, SRT, VTT)
- `meetings-recordings/` - Audio/video files (MP3, MP4, M4A, WAV)

**Path Structure:**
```
{user_id}/
  {meeting_id}/
    transcript.txt
    recording.mp3
```

**Access Control:**
- RLS policies: Users can only access their own files
- Signed URLs for downloads (expire after 1 hour)

---

### AI Processing Pipeline

```
1. User uploads recording
   ↓
2. Save to Supabase Storage
   ↓
3. Send to Gladia (async transcription)
   ↓
4. Poll Gladia for status (every 10 seconds)
   ↓
5. Gladia returns transcript
   ↓
6. Save transcript to DB
   ↓
7. Send transcript to GPT-4o-mini (summary)
   ↓
8. GPT returns structured summary
   ↓
9. Save summary to DB
   ↓
10. Extract action items (GPT-4o-mini)
    ↓
11. Save action items to DB
    ↓
12. Update meeting: ai_processed = TRUE
```

**Error Handling:**
- Gladia fails → Fallback to manual transcript upload
- GPT fails → Show error, allow retry
- Timeout (>5 min) → Show error, allow retry

---

### API Routes

```
/api/meetings
  GET    - List meetings (with filters, pagination)
  POST   - Create meeting (with file uploads)

/api/meetings/[id]
  GET    - Meeting details
  PUT    - Update meeting
  DELETE - Delete meeting

/api/meetings/[id]/transcribe
  POST   - Trigger Gladia transcription

/api/meetings/[id]/transcription-status
  GET    - Check transcription status

/api/meetings/[id]/generate-summary
  POST   - Generate AI summary

/api/action-items
  GET    - List action items (by client, by status)
  POST   - Create action item
  PUT    - Update action item
  DELETE - Delete action item
```

---

## Testing Checklist

**Unit Tests:**
- [ ] Gladia API wrapper (mock API responses)
- [ ] GPT summary prompt generation
- [ ] Action item extraction logic
- [ ] File upload validation (size, type)

**Integration Tests:**
- [ ] Upload recording → Transcription → Summary → Action items (full flow)
- [ ] Manual meeting logging (no files)
- [ ] Edit meeting details
- [ ] Delete meeting → Cascade deletes action items

**E2E Tests:**
- [ ] User journey: Log meeting → Upload recording → Wait for summary → View action items
- [ ] Free tier limit (can't transcribe 4th meeting)
- [ ] Pro tier (can transcribe 20 meetings)

---

## Dependencies

**External:**
- Gladia API (transcription)
- OpenAI API (GPT-4o-mini for summaries)
- Supabase Storage (file uploads)

**Internal:**
- Epic 2 complete (clients exist)
- UI components (File upload, Date picker, Rich text editor)

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Gladia transcription inaccurate** | Medium | Allow manual transcript upload, allow editing |
| **GPT summary too generic** | Medium | Refine prompts, allow manual edits |
| **File upload fails (large files)** | Medium | Chunked uploads, progress bars, retry logic |
| **Transcription takes too long (>5 min)** | Low | Async processing, email notification when done |
| **Cost overruns (Gladia + OpenAI)** | Medium | Enforce tier limits, monitor usage, alerts |

---

## Definition of Done

- [ ] All stories completed and tested
- [ ] No P0/P1 bugs
- [ ] Gladia integration working with real recordings
- [ ] GPT summaries are useful (validated by beta users)
- [ ] File uploads working (Supabase Storage)
- [ ] Free/Pro tier limits enforced
- [ ] Performance acceptable (<2 min for full meeting processing)
- [ ] User can complete: Log meeting → Upload → View summary → See action items

---

**Next Epic:** [Epic 4: AI Intelligence & Automation →](./epic-4-ai-intelligence.md)
