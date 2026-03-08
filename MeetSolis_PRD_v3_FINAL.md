# MeetSolis – Product Requirements Document (PRD) v3.0 FINAL
## Post-Meeting Intelligence Platform for Executive Coaches

**Last Updated:** March 8, 2026
**Version:** 3.1 (Updated - Architecture Decisions Locked)
**Status:** Ready for Development Sprint
**Target Launch:** March 10, 2026 (30 days)

---

## Document Status & Change Log

**v3.1 - Mar 8, 2026:**
- Added auto-transcription mode (Deepgram Nova-2, audio/video) alongside manual upload — both in MVP
- AI provider abstracted (Claude Sonnet 4.5 default, OpenAI GPT-4o-mini swappable via env var)
- Transcription provider abstracted (Deepgram default, Whisper alternative, placeholder for dev)
- Payment processor abstracted (Stripe default, swappable via env var)
- Solis Intelligence upgraded to hybrid RAG (pgvector semantic search + 3 most recent sessions)
- DB schema updated: sessions table adds `transcript_audio_url`, `embedding vector(1536)`, `status`
- Usage tracking schema revised: lifetime counters with reset timestamps (replaces month-based design)
- Citations column added to solis_queries table

**v3.0 (FINAL) - Feb 10, 2026:**
- Locked MVP scope for 1-month sprint
- Removed client-facing portal from MVP (post-launch feature)
- Added annual pricing discount ($948/year)
- Finalized tech stack: Next.js + Clerk + Supabase + Vercel
- Bootstrap approach confirmed ($20/month costs)
- Development timeline: 30 days to launch

**v2.0 - Feb 10, 2026:**
- Changed ICP from freelancers to executive coaches
- Revised pricing from $29 to $99/month
- Added market research findings
- Optimized cost structure

**v1.0 - Original:**
- Generic positioning
- Broader feature set
- $29/month pricing

---

## 1. Executive Summary

### Product Overview

**MeetSolis** is a post-meeting intelligence platform built exclusively for executive coaches who manage 10-25 active clients. We solve one critical problem: **coaches forget client context between sessions**, leading to unprofessional interactions and wasted preparation time.

**Tagline:** *"Never forget a client's breakthrough moment again."*

### The Problem

Executive coaches charge $200-500/hour to guide senior leaders through transformational journeys. Their credibility depends on remembering every detail of each client's story across months of bi-weekly sessions.

**Current Reality:**
- Managing 18+ clients simultaneously
- 25-30 coaching sessions per month
- Spend 20-30 minutes reviewing notes before each session
- Mix up client details (career-ending mistakes)
- Use scattered tools (Notion, Google Docs, memory)
- No way to query past conversations

**Pain Level:** 8-9/10 (forgetting context destroys trust and loses clients)

### The Solution

MeetSolis provides:
1. **Client Cards:** Persistent containers for each client's entire coaching journey
2. **AI Summaries:** Auto-generated session summaries, action items, and key insights
3. **Solis Intelligence:** Conversational AI that answers questions about any client's history
4. **Session Timeline:** Chronological view of transformation over time

**Key Differentiation:**
- Coach-specific (not generic meeting tool)
- Client memory across ALL sessions (not single-meeting summaries)
- Post-meeting focus (no bots, no disruption)
- ICF-compliant documentation
- Designed for non-technical, busy professionals

### Business Model

**Primary Revenue:** SaaS subscriptions
- Free: 1 client, 3 lifetime transcripts, 50 queries
- Pro: $99/month or $948/year (unlimited clients, 25 transcripts/month, 2,000 queries)

**Target Market:** 87,900 executive coaches globally, $103.6B coaching industry

**Year 1 Goal:** 200-400 paying customers = $240K-570K ARR

**Exit Strategy:** $15-30M acquisition by Notion, Calendly, HubSpot, or coaching platform (Year 3-4)

---

## 2. Market Analysis

### 2.1 Target Market Size

**Global Coaching Industry:**
- Market size: $103.6B (2025), projected $161.1B by 2030
- CAGR: 9.11%
- Professional coaches: 87,900 worldwide
- Growth driver: Corporate investment in leadership development

**Addressable Market (Executive Coaches):**
- **TAM:** 87,900 executive coaches globally
- **SAM:** ~30,000 in US, Canada, UK, Australia (English-speaking, high-income markets)
- **SOM (Year 3):** 1,000-2,000 paying customers (3-7% of SAM)

**Market Opportunity:**
- Executive coaches are underserved (no dominant player)
- Existing tools are generic (Otter.ai) or lack AI intelligence (Practice Better)
- High willingness to pay (coaches charge $300/hour, spend $50-100/month on tools)

---

### 2.2 Ideal Customer Profile (ICP)

**Primary ICP: Executive Coaches**

**Demographics:**
- **Role:** Independent executive/leadership coach
- **Experience:** 3-10+ years coaching
- **Certification:** ICF-certified (preferred but not required)
- **Location:** US, Canada, UK, Australia (English-speaking markets)
- **Age:** 35-60

**Firmographics:**
- **Business Model:** Solo practitioner (90% of market)
- **Client Load:** 10-25 active coaching clients
- **Session Frequency:** 2 sessions/month per client (25-50 total sessions/month)
- **Revenue:** $15,000-30,000/month ($180K-360K/year)
- **Pricing:** $200-500/hour or $3K-15K/month retainers

**Behavioral:**
- **Tech Sophistication:** Medium (uses Zoom, Calendly, Notion, but not "power users")
- **Current Stack:** Zoom, Calendly, Notion/Google Docs, Stripe, minimal project management
- **SaaS Spend:** $50-100/month
- **Decision Timeline:** Fast (1-2 weeks from discovery to purchase)
- **Buying Trigger:** Forgot client context, mixed up clients, client complained about preparation

**Psychographic:**
- **Values:** Professionalism, client care, personal growth, transformation
- **Pain Points:**
  1. Forgetting what was discussed in previous sessions (severity: 9/10)
  2. Spending hours on session preparation (severity: 8/10)
  3. Mixing up client details across 15-20 relationships (severity: 8/10)
  4. Inconsistent note-taking quality (severity: 7/10)
  5. No easy way to recall past breakthroughs (severity: 7/10)
- **Goals:** 
  - Be the coach who never forgets
  - Save 5-10 hours/week on admin work
  - Scale from 10 to 25 clients without chaos
  - Meet ICF documentation requirements effortlessly

**Willingness to Pay:**
- **Price Sensitivity:** Low-Medium (will pay for ROI)
- **Budget:** $99-149/month is acceptable
- **ROI Calculation:** Saves 5 hours/week × $300/hour = $6,000/month value vs $99 cost = 60:1 ROI
- **Comparison:** Already paying for Notion ($10), Zoom ($15), other tools ($25+)

**Where to Find Them:**
- ICF (International Coaching Federation) chapters and events
- LinkedIn (search "Executive Coach")
- Coaching communities (Reddit r/coaching, Facebook groups)
- Coaching certification programs (CTI, Co-Active, iPEC)
- Professional networks (BNI, local business groups)

---

**Secondary ICP: Fractional CFOs (Future - Year 2)**

**Profile:**
- Manages 3-4 company clients simultaneously
- $250-450/hour ($5K-12K/month per client)
- Needs audit-trail documentation
- Similar pain points to coaches
- Will pay $149/month

**Go-to-Market Timing:** After proving PMF with coaches (Q1 2027)

---

**Explicitly NOT Targeting:**

❌ **Generic Freelancers/Consultants**
- Reason: Too price-sensitive, free tier covers use case, crowded market, negative unit economics

❌ **Agencies/Teams**
- Reason: Different needs (collaboration features), will add in Year 2

❌ **Therapists/Counselors**
- Reason: HIPAA compliance required (too complex for MVP)

---

### 2.3 Competitive Landscape

**Direct Competitors (Meeting Intelligence Tools):**

**1. Fireflies.ai**
- Pricing: $10/month (Pro)
- Strengths: Cheap, unlimited transcription, good integrations
- Weaknesses: Not coach-specific, no client memory layer, generic UX
- Market Position: Mass market (sales teams, general professionals)
- Our Advantage: Coach-specific features, client memory across sessions, higher-value positioning

**2. Otter.ai**
- Pricing: $16.99/month (Pro)
- Strengths: Brand recognition, quality transcription, mobile app
- Weaknesses: Generic positioning, no coaching workflows, single-meeting focus
- Market Position: Consumer + prosumer (students, journalists, professionals)
- Our Advantage: Purpose-built for coaching, longitudinal client context

**3. Fathom**
- Pricing: Free (unlimited)
- Strengths: Free forever, simple UI, Zoom integration
- Weaknesses: Just transcription, no intelligence, no client management
- Market Position: Free tier acquisition play (monetize via upsells)
- Our Advantage: We're not competing on transcription, we compete on intelligence

**Adjacent Competitors (Coaching Software):**

**4. Practice Better**
- Pricing: $29-79/month
- Strengths: All-in-one practice management (scheduling, payments, client portal, notes)
- Weaknesses: No AI, manual note-taking, clunky UX, not specialized for executive coaching
- Market Position: Health coaches, wellness coaches, nutritionists
- Our Advantage: AI-powered intelligence, better for executive coaching specifically

**5. Simply.Coach**
- Pricing: $49-99/month
- Strengths: Coach-specific platform, goal tracking, assessments
- Weaknesses: No AI summaries, no post-meeting intelligence, dated UI
- Market Position: Life coaches, career coaches
- Our Advantage: Modern AI-first approach, better UX, smarter intelligence

**6. Satori (CoachAccountable, etc.)**
- Pricing: $20-60/month
- Strengths: Coach-specific features, session tracking
- Weaknesses: No AI, manual everything, legacy platforms
- Market Position: Traditional coaches (older demographic)
- Our Advantage: AI-native, modern design, faster workflows

**Indirect Competitors (DIY Solutions):**

**7. Notion + ChatGPT**
- Pricing: $0-10/month
- Strengths: Flexible, customizable, free
- Weaknesses: Manual, not integrated, no purpose-built features, requires setup
- Market Position: Power users, DIY enthusiasts
- Our Advantage: Automated, integrated, zero setup, coach-specific

**8. Google Docs + Manual Notes**
- Pricing: Free
- Strengths: Free, simple, familiar
- Weaknesses: No intelligence, no organization, no search
- Market Position: Default for non-technical coaches
- Our Advantage: 100x better organization, AI-powered recall

---

**Competitive Strategy:**

**We DON'T compete on:**
- ❌ Price (we're premium: $99 vs Fireflies $10)
- ❌ Transcription quality (commodity)
- ❌ Feature breadth (all-in-one platforms)
- ❌ Integrations (100+ connectors)

**We DO compete on:**
- ✅ Coach-specific experience (vertical SaaS advantage)
- ✅ Client memory intelligence (our moat)
- ✅ Simplicity and ease of use (non-technical users)
- ✅ Community trust (we're part of coaching world, not generic SaaS)

**Positioning Statement:**
"MeetSolis is the only AI-powered client memory system built specifically for executive coaches who need to remember every detail of 10-25 client relationships without spending hours on session prep."

---

### 2.4 Market Timing & Opportunity

**Why Now?**

1. **AI Maturity:** Claude/GPT-4 quality is good enough for professional use (2024-2025 breakthrough)
2. **Coach Adoption:** Executive coaches now comfortable with AI tools (ChatGPT went mainstream)
3. **Zoom Fatigue:** Post-pandemic, coaches want better post-meeting tools (not more in-meeting features)
4. **ICF Standards:** Increasing documentation requirements create demand for automated solutions
5. **Market Gap:** No dominant player owns "post-meeting intelligence for coaches"

**Market Window:** 12-24 months before:
- OpenAI/Google adds meeting memory to ChatGPT/Gemini (free)
- Microsoft adds coaching features to Copilot
- Incumbents (Practice Better, Simply.Coach) add AI

**Our Advantage:** Speed. We can ship MVP in 30 days and own this niche before big players notice.

---

## 3. Product Vision & Strategy

### 3.1 Product Vision

**Short-term (Year 1):**
MeetSolis is the **default client memory system for executive coaches**.

**Mid-term (Year 2-3):**
MeetSolis expands to **all fractional executives** (CFOs, CMOs, CTOs) and becomes the standard for 1-on-1 professional relationships.

**Long-term (Year 5+):**
MeetSolis is the **operating system for any professional managing deep client relationships** – coaching, consulting, therapy, mentorship, fractional work.

**Ultimate Vision:**
Every coach, consultant, and advisor uses MeetSolis to **never forget a single conversation** with their clients.

---

### 3.2 Product Philosophy

**What MeetSolis IS:**
- 🎯 Post-meeting intelligence platform (we activate AFTER sessions)
- 🧠 Client memory layer (grows more valuable over time)
- 🤖 Coach's AI second brain (perfect recall)
- 📋 ICF-compliant documentation system
- ✨ Simplicity-first tool (for non-technical users)

**What MeetSolis IS NOT:**
- ❌ Video conferencing platform (we don't host meetings)
- ❌ Real-time meeting assistant (no bots in live sessions)
- ❌ CRM (not for sales/pipeline management)
- ❌ Project management tool (not for tasks/sprints)
- ❌ Generic "AI meeting tool" (coach-specific only)

**Design Principles:**

**1. Coaching-First**
Every feature must serve executive coaches specifically. If it's useful for "professionals in general," it doesn't belong in MeetSolis.

**2. Simplicity Over Features**
Coaches are busy, non-technical, and want tools that "just work." If a feature requires a tutorial, it's too complex.

**3. Zero In-Meeting Friction**
We never interrupt the sacred coaching session. All value comes post-meeting. Coaches maintain presence with clients.

**4. Human-Centered AI**
AI should feel like a helpful colleague, not a robot. Warm, accurate, cited responses. Never fabricate.

**5. Mobile-First Context**
Coaches check client context on phones between sessions. Mobile experience is critical, not an afterthought.

**6. Privacy-First**
Client conversations are deeply personal. We treat data with respect, never train AI on user data, never sell information.

---

### 3.3 Product Strategy

**Phase 1: MVP (Month 1 - March 2026)**
- **Goal:** Ship working product, validate willingness to pay
- **Features:** Client Cards, manual upload, AI summaries, Solis Intelligence, action items
- **Target:** 10-30 beta users, $990-2,970 MRR
- **Success Metric:** 7/10 coaches say "I can't live without this"

**Phase 2: Early Growth (Months 2-6)**
- **Goal:** Reach 100-200 paying coaches
- **Features:** Zoom integration (auto-import transcripts), session prep briefs, ICF-compliant exports
- **Target:** $10K-20K MRR
- **Success Metric:** 70%+ retention, organic referrals happening

**Phase 3: Scale (Months 7-12)**
- **Goal:** Reach 400-600 paying coaches
- **Features:** Automated transcription (Whisper API), client-facing portal (Phase 1), transformation tracking
- **Target:** $40K-60K MRR
- **Success Metric:** Profitable, strong unit economics, clear PMF

**Phase 4: Expansion (Year 2)**
- **Goal:** Add fractional CFO vertical, reach 800-1,200 customers
- **Features:** CFO-specific workflows, team features (agencies), marketplace (3rd-party tools)
- **Target:** $80K-120K MRR ($1M+ ARR)
- **Success Metric:** Multi-vertical product, platform emerging

**Phase 5: Platform (Year 3+)**
- **Goal:** Become infrastructure for client relationships
- **Features:** API, white-label, international expansion
- **Target:** $200K+ MRR, acquisition target
- **Success Metric:** Category leader, network effects, acquirer interest

---

## 4. MVP Scope & Features (LOCKED FOR 30-DAY SPRINT)

### 4.1 MVP Philosophy

**What we're building in 30 days:**
The **minimum** feature set to prove coaches will pay $99/month for client memory intelligence.

**What we're NOT building (post-MVP):**
- ❌ Client-facing portal (coaches only)
- ❌ Team collaboration (solo coaches only)
- ❌ Advanced analytics (basic only)
- ❌ Mobile app (responsive web only)

**Success Criteria:**
If 70%+ of beta users say "I would pay $99/month for this" → We have PMF signal → Continue building.

---

### 4.2 Core Features

#### Feature 1: Authentication & User Management

**Description:** Secure user accounts for coaches

**Functionality:**
- Sign up with email + password
- Login/logout
- Password reset
- Google OAuth (optional, using Clerk)
- User profile (name, email, timezone)

**Tech Stack:**
- Clerk (authentication provider)
- Free tier: 10,000 MAU (plenty for MVP)

**Acceptance Criteria:**
- ✅ User can sign up in <1 minute
- ✅ Email verification works
- ✅ Password reset flow works
- ✅ Sessions persist across browser refresh

**Out of Scope for MVP:**
- Team accounts
- SSO (SAML)
- 2FA (future for security)

---

#### Feature 2: Client Cards (Core Feature)

**Description:** Persistent container for each coaching client's entire journey

**Client Card Contains:**
- **Client Profile:**
  - Name (required)
  - Current coaching goal (optional)
  - Company/role (optional)
  - Coaching start date (optional)
  - Profile notes (freeform text)

- **Session Timeline:**
  - All coaching sessions in reverse chronological order
  - Expandable/collapsible sessions
  - Session summaries, action items, key topics
  - Full transcript access

- **Quick Stats:**
  - Total sessions
  - Pending action items count
  - Most recent session date

**User Stories:**
1. As a coach, I can create a new Client Card in <30 seconds
2. As a coach, I can view all my clients in a grid/list
3. As a coach, I can search/filter clients by name
4. As a coach, I can edit client details
5. As a coach, I can delete a client (with confirmation warning)
6. As a coach, I can navigate to a Client Card to see full session history

**UI Mockup (Conceptual):**

```
┌──────────────────────────────────────────────────────┐
│ ◀ Back to Clients                           [⋮ Menu] │
├──────────────────────────────────────────────────────┤
│                                                       │
│ JOHN SMITH                                 [✏️ Edit]  │
│ CEO, TechCorp → Leadership Transition                │
│                                                       │
│ 🎯 Current Goal: Build executive presence            │
│ 📅 Coaching Since: Jan 2024                          │
│ 📊 18 sessions · 3 pending actions                   │
│                                                       │
├──────────────────────────────────────────────────────┤
│ [📤 Upload Transcript] [🤖 Ask Solis] [➕ Add Note]  │
├──────────────────────────────────────────────────────┤
│                                                       │
│ SESSION TIMELINE                                      │
│                                                       │
│ ┌────────────────────────────────────────────────┐  │
│ │ 📅 Feb 5, 2026                                 │  │
│ │ "Navigating Board Dynamics"                    │  │
│ │                                                │  │
│ │ Summary: John discussed his challenges...     │  │
│ │ (Click to expand full summary)                │  │
│ │                                                │  │
│ │ 🎯 Action Items:                               │  │
│ │ ✅ Practice presentation with Sarah            │  │
│ │ ⏳ Schedule 1:1 with board chair               │  │
│ │                                                │  │
│ │ [View Full Transcript] [💬 Add Follow-up]     │  │
│ └────────────────────────────────────────────────┘  │
│                                                       │
│ ┌────────────────────────────────────────────────┐  │
│ │ 📅 Jan 22, 2026                                │  │
│ │ "Building Executive Presence"                  │  │
│ │ [Collapsed - Click to Expand]                 │  │
│ └────────────────────────────────────────────────┘  │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**Database Schema:**
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  goal TEXT,
  company TEXT,
  role TEXT,
  start_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Acceptance Criteria:**
- ✅ Create client in <30 seconds (name + goal, rest optional)
- ✅ Client list loads in <2 seconds
- ✅ Search works (filter by name)
- ✅ Mobile-responsive design
- ✅ Client count: Unlimited (no artificial caps)

**Out of Scope:**
- Client tagging/categories (future)
- Client import/export (future)
- Client archiving (just delete for now)

---

#### Feature 3: Transcript Upload & Processing

**Description:** Coaches upload session transcripts (manual upload only in MVP)

**Functionality:**

**Upload Methods:**

*Tab 1: Manual Upload / Paste*

1. **File Upload:**
   - Drag-and-drop or click to select
   - Accepted formats: .txt, .docx
   - Max file size: 25MB
   - Files stored in Supabase Storage

2. **Copy/Paste:**
   - Text area for pasting transcript
   - Supports up to 50,000 characters
   - Direct storage in database

*Tab 2: Auto-Transcribe (Audio/Video)*

3. **Auto-Transcription:**
   - Accepted formats: .mp3, .mp4, .m4a, .wav, .webm
   - Max file size: 500MB
   - Provider: Deepgram Nova-2 (36% lower word error rate vs. alternatives, built-in speaker diarization — auto-labels coach vs. client speech, critical for action item attribution)
   - Audio stored in Supabase Storage; `transcript_audio_url` saved in DB
   - Transcript text returned and stored in `transcript_text`

**Upload Flow:**
1. Coach clicks "Upload Transcript" on Client Card
2. Modal opens with two tabs: **Manual Upload / Paste** | **Auto-Transcribe (Audio/Video)**
3. Coach selects tab and provides transcript:
   - Manual: file upload area OR paste textarea
   - Auto: audio/video file upload
   - Session date picker (defaults to today)
   - Session title input (optional, will auto-generate if empty)
   - "Process Transcript" button
3. Upload starts:
   - Progress indicator shown
   - File stored in Supabase
   - Transcript text extracted and saved
4. AI processing begins (see Feature 4)
5. User sees summary immediately after processing
6. Session appears in timeline

**User Stories:**
1. As a coach, I can upload a .txt transcript in <10 seconds
2. As a coach, I can paste transcript text for quick sessions
3. As a coach, I can set the session date manually
4. As a coach, I see clear progress during upload
5. As a coach, I get helpful errors if upload fails

**Technical Details:**
- .docx parsing: Use `mammoth` library (extracts text from Word docs)
- .txt parsing: Direct read
- Auto-transcription: Deepgram Nova-2 REST API (provider abstracted via `TRANSCRIPTION_PROVIDER` env var; swappable to OpenAI Whisper or placeholder for dev)
- Storage: Supabase Storage (1GB free tier) — manual files and audio files both stored here
- Database: Store transcript text in `sessions.transcript_text`; audio file URL in `sessions.transcript_audio_url`

**Database Schema:**
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  session_date DATE NOT NULL,
  title TEXT NOT NULL,
  transcript_text TEXT,
  transcript_file_url TEXT,        -- Supabase Storage URL (manual .txt/.docx)
  transcript_audio_url TEXT,       -- Supabase Storage URL (auto-transcribed audio/video)
  summary TEXT,
  key_topics TEXT[],
  embedding vector(1536),          -- pgvector embedding of summary (for hybrid RAG)
  status TEXT DEFAULT 'pending',   -- 'pending' | 'processing' | 'complete' | 'error'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Acceptance Criteria:**
- ✅ Upload completes in <10 seconds for typical transcript (5,000 words)
- ✅ Copy/paste handles up to 50,000 characters
- ✅ File parsing works for .txt and .docx
- ✅ Clear error messages if file is corrupted or too large
- ✅ Session appears in timeline immediately (with "Processing..." state)

**Out of Scope for MVP:**
- ❌ Zoom/Google Meet auto-import - Q2 2026
- ❌ Real-time transcription - Never (not our positioning)

---

#### Feature 4: AI Summary Generation

**Description:** Automatically generate professional coaching session summaries using Claude AI

**Trigger:** Runs immediately after transcript upload completes

**AI Output Components:**

**1. Executive Summary (2-3 paragraphs):**
- What was discussed in the session
- Key themes and topics
- Coach's interventions/approach
- Client's breakthroughs or challenges
- Emotional tone of session

**2. Action Items (Bullet List):**
- Client commitments (what client will do)
- Coach commitments (what coach will do)
- Format: "Who: Specific action"
- Default status: Pending

**3. Key Discussion Points (5-7 bullets):**
- Main topics covered
- Important revelations/insights
- Patterns or themes
- Strategic topics explored

**4. Auto-Generated Session Title:**
- 3-6 word title capturing session essence
- Examples: "Navigating Board Dynamics", "Building Executive Presence"
- Coach can edit if AI gets it wrong

**AI Implementation:**

**Model:** AI Provider (abstracted) — Claude Sonnet 4.5 (default) or OpenAI GPT-4o-mini, switchable via `AI_PROVIDER` environment variable without code changes

**Prompt Template:**
```
You are an assistant helping an executive coach document their coaching sessions.

Given the following coaching session transcript, please provide:

1. SUMMARY (2-3 paragraphs):
   - What was discussed in this session
   - Key themes and topics
   - The coach's approach and interventions
   - Client's breakthroughs or challenges
   - Emotional tone (if apparent)

2. ACTION ITEMS (bullet list):
   Format each as "Who: Specific action"
   - Client commitments (what the client will do)
   - Coach commitments (what the coach will do)

3. KEY DISCUSSION POINTS (5-7 bullets):
   - Main topics covered
   - Important revelations or insights
   - Emotional moments
   - Strategic insights

4. SESSION TITLE (3-6 words):
   A short, descriptive title for this session

Keep the tone professional but warm, appropriate for coaching documentation.
This will be used for ICF (International Coaching Federation) record-keeping.

CLIENT NAME: {client_name}
CLIENT GOAL: {client_goal}

TRANSCRIPT:
{transcript_text}

Respond in the following format:

TITLE: [session title]

SUMMARY:
[2-3 paragraph summary]

ACTION ITEMS:
- [action item 1]
- [action item 2]
...

KEY POINTS:
- [key point 1]
- [key point 2]
...
```

**Response Parsing:**
- Extract title, summary, action items, key points
- Store in database
- Create action_items records for tracking

**Cost per Summary:**
- Input tokens: ~10,000 (7,500 word transcript)
- Output tokens: ~500 (summary)
- Cost with Batch API: **~$0.02 per session**

**Processing Time:**
- Target: <15 seconds
- Timeout: 30 seconds
- Retry: 3 attempts if failure

**Quality Standards:**
- Accuracy: 95%+ (spot-check required)
- Tone: Professional but warm
- Citations: Reference specific moments if quoting
- ICF-Compliant: Follows coaching documentation standards
- No Fabrication: If unclear, say "Discussed [topic]" not invented details

**User Stories:**
1. As a coach, I see a summary generated within 15 seconds of upload
2. As a coach, I can edit the summary if AI gets something wrong
3. As a coach, I see action items automatically extracted
4. As a coach, I can manually add action items AI missed
5. As a coach, I trust the summary quality for ICF record-keeping

**Database Schema:**
```sql
-- Sessions table stores summary
-- (see Feature 3 for full schema)

CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id),
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'in_progress' | 'completed'
  assigned_to TEXT, -- 'client' | 'coach'
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

**Acceptance Criteria:**
- ✅ Summary generates in <15 seconds (typical case)
- ✅ 95%+ accuracy (validated by beta testers)
- ✅ Handles transcripts from 1,000 to 50,000 words
- ✅ Graceful error handling if AI fails (show error, allow retry)
- ✅ Summary is editable (coach can fix mistakes)
- ✅ Action items are extracted (at least 80% accuracy)

**Out of Scope:**
- Custom summary templates (future)
- Summary length preferences (future)
- Multi-language support (English only for MVP)
- Sentiment analysis (future)

---

#### Feature 5: Solis Intelligence (AI-Powered Q&A)

**Description:** Conversational AI interface that answers questions about client history

**Concept:**
Coaches ask natural language questions about a specific client (or all clients), and Solis provides instant, cited answers based on session notes.

**Access Points:**
1. **Client-Specific Mode:** "Ask Solis" button on each Client Card
2. **Global Mode:** Dedicated `/intelligence` page (ask about any client)

**UI Design:**

```
┌──────────────────────────────────────────────────────┐
│ 🤖 Solis Intelligence                                 │
│ Ask me anything about John Smith...                  │
├──────────────────────────────────────────────────────┤
│                                                       │
│ [Text input: "What did we discuss last time?"]       │
│                                              [Ask]    │
│                                                       │
│ Suggested Questions:                                  │
│ • What did we discuss last time?                     │
│ • What are John's pending action items?              │
│ • What's John's current goal?                        │
│ • Prepare me for my next session with John          │
│ • What breakthroughs has John had?                   │
│                                                       │
├──────────────────────────────────────────────────────┤
│                                                       │
│ 💬 In your last session with John (Feb 5, 2026):     │
│                                                       │
│ You discussed his challenges presenting to the       │
│ board of directors. John expressed fear of being     │
│ judged by senior executives who have more            │
│ experience. You helped him reframe this as an        │
│ opportunity to build credibility. His action items:  │
│                                                       │
│ • Practice presentation with you                     │
│ • Schedule 1:1 with board chair                      │
│ • Read "The First 90 Days"                           │
│                                                       │
│ 📎 Source: Session on Feb 5, 2026                    │
│    "Navigating Board Dynamics"                       │
│ [View Full Session]                                  │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**Example Queries & Responses:**

**Query 1:** "What did we discuss last time?"
```
Response:
In your last session with John on Feb 5, 2026, you discussed 
his challenges presenting to the board of directors. John 
expressed fear of being judged by senior executives. You 
helped him reframe this as an opportunity to build credibility.

Source: Session on Feb 5, 2026 - "Navigating Board Dynamics"
```

**Query 2:** "What are John's pending action items?"
```
Response:
John currently has 2 pending action items:

1. Schedule 1:1 with board chair (from Feb 5 session)
2. Read "The First 90 Days" (from Feb 5 session)

He completed: Practice presentation with you (marked done Feb 8)

Source: Sessions from Feb 5 and Jan 22, 2026
```

**Query 3:** "Prepare me for my next session with John"
```
Response:
UPCOMING SESSION PREP FOR JOHN SMITH

Last Session Recap (Feb 5, 2026):
You discussed board presentation challenges. John committed 
to practicing with you and scheduling a 1:1 with the board chair.

Action Items to Follow Up:
⏳ Schedule board chair 1:1 (pending)
⏳ Read "The First 90 Days" (pending)
✅ Practice presentation (completed)

Suggested Topics for Next Session:
- How did the board presentation go?
- Progress on executive presence work
- Any new challenges in first 90 days as CEO?

Recent Breakthrough:
John is starting to reframe fear as opportunity (Feb 5 session)

Sources: Last 3 sessions (Feb 5, Jan 22, Jan 8)
```

**Technical Implementation:**

**Model:** AI Provider (abstracted) — same provider as Feature 4, switchable via `AI_PROVIDER` env var. Prompt caching enabled where supported by provider.

**Context Building (Hybrid RAG):**
- On session upload: generate embedding of session summary → store in `sessions.embedding` (pgvector)
- On Solis query:
  1. Embed user query via AI provider
  2. pgvector similarity search → top 3 semantically relevant sessions
  3. Always include 3 most recent sessions (deduplicated with step 2)
  4. Combined context: max 6 sessions total — client profile + session summaries + action items + key topics
- For global queries: pass client names + most recent session summary per client

**Prompt Template (Client-Specific):**
```
You are Solis, an AI assistant for executive coaches. 
You have access to all coaching session notes for this client.

Your role:
- Answer questions about the client's coaching journey
- Cite specific sessions when providing information (date + title)
- Be concise (2-3 paragraphs max unless asked for detail)
- If you don't know something, say so (never fabricate)
- Provide actionable insights when appropriate

CLIENT CONTEXT:
Name: {client_name}
Goal: {client_goal}
Coaching Since: {start_date}
Total Sessions: {session_count}

RECENT SESSIONS (Last 5):
{session_summaries}

USER QUESTION:
{user_query}

Provide a helpful, cited answer. Always reference which 
session(s) your information comes from.
```

**Session Prep Prompt (Special Case):**
```
You are preparing an executive coach for their next coaching 
session with a client.

Provide a session prep brief including:
1. Last session recap (2-3 sentences)
2. Pending action items to follow up on
3. Suggested topics for discussion
4. Recent breakthroughs or patterns

Be concise and actionable.

CLIENT: {client_name}
LAST 3 SESSIONS:
{session_summaries}

Generate the session prep brief.
```

**Cost Optimization:**

**Without Caching:**
- Input: 5 sessions × 2,000 tokens = 10,000 tokens
- Output: 500 tokens
- Cost: ~$0.0375 per query (4 cents)

**With Prompt Caching (90% cache hit):**
- Cache: Session context (9,000 tokens cached)
- Fresh: User query (1,000 tokens)
- Cost: ~$0.001 per query (0.1 cents) - 37x cheaper

**Implementation:**
- Use Claude prompt caching API
- Cache client session history
- Update cache when new sessions added
- Massive cost savings (critical for profitability)

**Response Time Target:**
- Typical: <5 seconds
- Max: 10 seconds
- Timeout: 15 seconds (show error if exceeded)

**Database Tracking:**
```sql
CREATE TABLE solis_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  client_id UUID, -- NULL if global query
  query_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  citations JSONB DEFAULT '[]', -- [{session_id, session_date, title}]
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Usage Tracking:**
- Increment counter in `usage_tracking` table
- Check limits before allowing query
- Show remaining queries in UI

**User Stories:**
1. As a coach, I can ask Solis about a specific client and get instant answers
2. As a coach, I see sources cited (session dates) so I can verify
3. As a coach, I can click "Prepare me for next session" and get a brief
4. As a coach, I see suggested questions to help me get started
5. As a coach, I can view my query history

**Acceptance Criteria:**
- ✅ Response time <10 seconds (target <5)
- ✅ Always cites sources (session date + title)
- ✅ Handles "I don't know" gracefully (no fabrication)
- ✅ Session prep brief format is consistent and actionable
- ✅ Mobile-responsive (coaches use on phones)

**Out of Scope:**
- Voice input (future)
- Follow-up questions in conversation thread (future - for MVP each query is standalone)
- Multi-client queries ("Compare John and Sarah") - future
- Export query history - future

---

#### Feature 6: Session Timeline View

**Description:** Chronological display of all coaching sessions for a client

**UI Layout:**

```
SESSION TIMELINE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Feb 5, 2026
"Navigating Board Dynamics"

[Expanded View]

SUMMARY:
John discussed his challenges presenting to the board of 
directors. He expressed fear of being judged by senior 
executives who have more experience than him. We explored 
where this fear comes from (imposter syndrome, need for 
approval). I helped him reframe this as an opportunity to 
build credibility through authenticity and preparation.

KEY TOPICS:
• Board presentation anxiety
• Imposter syndrome
• Executive presence
• Building credibility

ACTION ITEMS:
✅ Practice board presentation with Sarah [Completed Feb 8]
⏳ Schedule 1:1 with board chair [In Progress]
⏳ Read "The First 90 Days" [Not Started]

[View Full Transcript] [Add Note] [Edit Summary]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Jan 22, 2026
"Building Executive Presence"

[Collapsed - Click to Expand]

Quick Summary: Discussed how John can show up more 
confidently in leadership meetings...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Features:**
- **Reverse Chronological Order:** Newest sessions at top
- **Expand/Collapse:** Click session to expand/collapse details
- **Action Item Status:** Visual indicators (✅ ⏳ ❌)
- **Full Transcript Access:** Modal/drawer for complete transcript
- **Manual Notes:** Coach can add freeform notes to any session
- **Edit Capability:** Coach can edit summary if AI got something wrong

**User Stories:**
1. As a coach, I can see all sessions for a client in one view
2. As a coach, I can expand sessions to see full details
3. As a coach, I can collapse sessions to scan quickly
4. As a coach, I can access full transcripts when needed
5. As a coach, I can add my own notes to sessions

**Technical Details:**
- Lazy loading: Load sessions in batches (10 at a time)
- Default state: All collapsed except most recent
- Smooth animations for expand/collapse
- Mobile-optimized scrolling

**Acceptance Criteria:**
- ✅ Timeline loads in <2 seconds
- ✅ Expand/collapse is smooth (no jank)
- ✅ Mobile-friendly (thumb-friendly tap targets)
- ✅ Can handle 50+ sessions without performance issues
- ✅ Clear visual hierarchy

**Out of Scope:**
- Timeline visualization (graph/chart view) - future
- Session comparison side-by-side - future
- Filter/sort options - future (keep simple for MVP)

---

#### Feature 7: Action Item Tracking

**Description:** Track commitments made during coaching sessions

**Functionality:**

**Action Item States:**
- ⏳ **Pending** (default when extracted from summary)
- 🔄 **In Progress** (coach manually marks)
- ✅ **Completed** (coach marks done)
- ❌ **Cancelled** (no longer relevant)

**Display Locations:**
1. **In Session Timeline:** Action items shown under each session summary
2. **Client Card Overview:** "3 pending actions" count at top
3. **Per-Client Action List:** Dedicated view of all pending actions (future - not MVP)

**Interaction:**
- **Checkbox:** Click to mark complete
- **Status Dropdown:** Click status to change (pending → in progress → completed)
- **Edit:** Click action text to edit description
- **Add Manual:** "+ Add Action Item" button (for items AI missed)
- **Delete:** Remove action item

**User Stories:**
1. As a coach, I can see action items automatically extracted from summaries
2. As a coach, I can mark action items complete with one click
3. As a coach, I can see completion timestamps
4. As a coach, I can manually add action items AI missed
5. As a coach, I see pending action count on Client Card

**Database Schema:**
```sql
-- (Already defined in Feature 4)
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id),
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  assigned_to TEXT, -- 'client' | 'coach'
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

**Acceptance Criteria:**
- ✅ Status updates instantly (optimistic UI update)
- ✅ Completed items show timestamp
- ✅ Mobile-friendly interaction (large tap targets)
- ✅ Can handle 20+ action items per session

**Out of Scope:**
- Action item dashboard (all clients) - future
- Automated reminders - future
- Client-facing action items (client portal) - future
- Due dates - future

---

#### Feature 8: Usage Limits & Tracking

**Description:** Enforce free tier limits and track usage for billing

**Free Tier Limits:**
- 1 active client
- 3 AI-transcribed sessions (lifetime, not monthly)
- 50 Solis Intelligence queries (lifetime)
- Unlimited manual transcript uploads (with AI processing counted)

**Pro Tier Limits:**
- Unlimited clients
- 25 AI-transcribed sessions per month
- 2,000 Solis queries per month
- Everything unlimited after that

**Implementation:**

**Usage Tracking Table:**
```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  month TEXT NOT NULL, -- Format: '2026-02'
  transcripts_processed INT DEFAULT 0,
  solis_queries_used INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month)
);
```

**Check Before Action:**

**Before Transcript Upload:**
```javascript
const tier = await getUserTier(userId);
const usage = await getUsage(userId);

if (tier === 'free' && usage.transcripts_processed >= 3) {
  throw new Error('Free tier limit reached. Upgrade to Pro for unlimited.');
}

if (tier === 'pro' && usage.transcripts_processed >= 25) {
  // Allow (generous limit, unlikely to hit)
}
```

**Before Solis Query:**
```javascript
const tier = await getUserTier(userId);
const usage = await getUsage(userId);

if (tier === 'free' && usage.solis_queries_used >= 50) {
  throw new Error('Free tier limit reached. Upgrade to Pro.');
}

if (tier === 'pro' && usage.solis_queries_used >= 2000) {
  // Allow (very generous)
}
```

**UI Indicators:**
- **Dashboard:** "2/3 transcripts used" badge
- **Before Action:** Warning modal if close to limit
- **After Limit:** Upgrade CTA modal

**User Stories:**
1. As a free user, I can see how many transcripts I have left
2. As a free user, I see clear upgrade prompts when I hit limits
3. As a Pro user, I see my monthly usage stats
4. As a user, I understand what happens when I exceed limits

**Acceptance Criteria:**
- ✅ Limits enforced correctly (can't bypass)
- ✅ Usage counters accurate
- ✅ Clear error messages when limit hit
- ✅ Upgrade CTAs prominent but not annoying

**Out of Scope:**
- Overage billing (pay per extra transcript) - future
- Usage analytics/charts - future
- Email notifications about usage - future

---

#### Feature 9: Billing & Subscriptions (Stripe)

**Description:** Paid subscription management

**Pricing:**
- **Free:** $0/month (1 client, 3 transcripts lifetime, 50 queries)
- **Pro Monthly:** $99/month (unlimited clients, 25 transcripts/month, 2,000 queries/month)
- **Pro Annual:** $948/year ($79/month effective, save $240/year)

**Stripe Integration:**

**Products to Create in Stripe:**
1. "MeetSolis Pro Monthly" - $99/month recurring
2. "MeetSolis Pro Annual" - $948/year recurring

**Checkout Flow:**
1. User clicks "Upgrade to Pro" on pricing page or limit modal
2. User selects Monthly or Annual
3. Redirect to Stripe Checkout (hosted)
4. User enters payment info on Stripe
5. After payment, redirect to success page
6. Webhook updates database (subscription created)
7. User tier changes from 'free' to 'pro'

**Subscription Table:**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  tier TEXT DEFAULT 'free', -- 'free' | 'pro'
  status TEXT DEFAULT 'active', -- 'active' | 'cancelled' | 'expired'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Webhooks to Handle:**
- `checkout.session.completed` - Create subscription
- `invoice.paid` - Renew subscription
- `customer.subscription.updated` - Update subscription
- `customer.subscription.deleted` - Cancel subscription

**Settings Page:**
- View current plan
- View next billing date
- Manage subscription (change plan, cancel)
- Billing history (via Stripe customer portal)

**User Stories:**
1. As a user, I can upgrade to Pro in <2 minutes
2. As a user, I can choose monthly or annual billing
3. As a user, I can cancel my subscription anytime
4. As a user, I can see my billing history
5. As a user, I can update payment method

**Acceptance Criteria:**
- ✅ Stripe Checkout works (test mode for MVP)
- ✅ Webhooks update database correctly
- ✅ Tier changes immediately after payment
- ✅ Cancel subscription works (access until period end)
- ✅ Annual discount applied correctly ($948 not $1,188)

**Out of Scope:**
- Team billing (multi-user) - future
- Invoice customization - future
- Enterprise custom pricing - future
- Cryptocurrency payment - never

---

#### Feature 10: Onboarding Flow

**Description:** Guide new users from signup to first "aha moment" in <5 minutes

**Goal:** Get user to upload first transcript and see Solis Intelligence in action

**Flow:**

**Step 1: Signup (Clerk) - 30 seconds**
- Email + password OR Google OAuth
- Auto-creates free tier account

**Step 2: Welcome Screen - 30 seconds**
```
┌──────────────────────────────────────────────────┐
│                                                   │
│              Welcome to MeetSolis! 👋             │
│                                                   │
│  Let's get you set up in 60 seconds.             │
│                                                   │
│  We'll help you:                                  │
│  → Add your first client                         │
│  → Upload a coaching session transcript          │
│  → See Solis Intelligence in action              │
│                                                   │
│  [Let's Go] [Skip, I'll Explore]                 │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Step 3: Add First Client - 30 seconds**
```
┌──────────────────────────────────────────────────┐
│                                                   │
│  Who's your first client?                        │
│                                                   │
│  Name: [________________________]                 │
│                                                   │
│  Current Goal (optional):                        │
│  [________________________]                       │
│                                                   │
│  [Add Client]                                    │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Step 4: Upload First Transcript - 2 minutes**
```
┌──────────────────────────────────────────────────┐
│                                                   │
│  Great! Now let's process a coaching session.    │
│                                                   │
│  Upload a transcript or try our sample:          │
│                                                   │
│  [📤 Upload My Transcript]                       │
│                                                   │
│  [🎯 Use Sample Transcript]                      │
│  (Demo: "Leadership Transition Coaching")        │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Sample Transcript Provided:**
- Pre-loaded demo transcript (executive coaching session)
- ~2,000 words, realistic coaching conversation
- Already processed (summary cached)
- User can delete later

**Step 5: Show Summary (Aha Moment!) - 1 minute**
```
┌──────────────────────────────────────────────────┐
│                                                   │
│  ✨ Here's your AI-generated summary:            │
│                                                   │
│  [Shows actual summary]                          │
│                                                   │
│  This is automatically saved to John's           │
│  Client Card. You can access it anytime.         │
│                                                   │
│  [View Full Client Card]                         │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Step 6: Try Solis - 1 minute**
```
┌──────────────────────────────────────────────────┐
│                                                   │
│  Want to see the magic of Solis Intelligence?    │
│                                                   │
│  Try asking:                                     │
│  "What did we discuss in this session?"          │
│                                                   │
│  [🤖 Ask Solis]                                  │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Step 7: Done - 30 seconds**
```
┌──────────────────────────────────────────────────┐
│                                                   │
│  🎉 You're all set!                              │
│                                                   │
│  You have:                                       │
│  • 1 client added                                │
│  • 1 session processed                           │
│  • 2 more free transcripts                       │
│                                                   │
│  Ready to add your own clients?                  │
│                                                   │
│  [Go to Dashboard]                               │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Implementation Details:**
- Track onboarding step in user metadata
- Show progress indicator (Step 1 of 6)
- Allow skip at any point
- Sample data deletable from Client Card
- Mobile-responsive

**User Stories:**
1. As a new user, I complete onboarding in <5 minutes
2. As a new user, I see value (aha moment) before finishing
3. As a new user, I can skip and explore on my own
4. As a new user, I understand what MeetSolis does

**Acceptance Criteria:**
- ✅ 70%+ completion rate (users who start finish)
- ✅ <5 minute median time to complete
- ✅ Aha moment happens (user sees AI summary work)
- ✅ Mobile-friendly

**Out of Scope:**
- Video tutorials - future
- Interactive product tour (Pendo, Appcues) - future
- Email onboarding sequence - future

---

#### Feature 11: Landing Page (Marketing)

**URL:** `/` (public, before login)

**Purpose:** Convert visitors to signups

**Sections:**

**1. Hero Section:**
```
Never forget a client's breakthrough moment again.

MeetSolis is the AI-powered client memory system
built for executive coaches.

[Start Free Trial] [Watch Demo (1 min)]

✨ No credit card required · 3 free AI summaries
```

**2. Social Proof:**
```
"MeetSolis saves me 8 hours per week. I never mix up 
clients anymore."
— Sarah Chen, ICF-Certified Executive Coach
```

**3. How It Works (3 Steps):**
```
1️⃣ Upload Session Transcripts
   Manual upload or paste - no bots in your sessions

2️⃣ AI Generates Summaries & Action Items  
   2-3 paragraph summaries, extracted commitments

3️⃣ Ask Solis Anything About Your Clients
   Instant answers with sources cited
```

**4. Features Overview:**
- Client Cards (persistent client memory)
- AI Summaries (ICF-compliant documentation)
- Solis Intelligence (conversational AI)
- Action Item Tracking (never forget commitments)

**5. Pricing Preview:**
```
FREE: Perfect for testing
• 1 client
• 3 AI transcripts
• 50 Solis queries

PRO: $99/month for serious coaches
• Unlimited clients
• 25 AI transcripts/month
• 2,000 Solis queries/month

[See Full Pricing]
```

**6. Trust Signals:**
- ICF Compliance badge
- Data encryption icon
- Privacy-first messaging
- No training on your data

**7. Final CTA:**
```
Join 100+ Executive Coaches Using MeetSolis

[Start Your Free Trial]
No credit card required.
```

**8. Footer:**
- About
- Pricing
- Contact (support@meetsolis.com)
- Privacy Policy
- Terms of Service
- Blog (future)

**Design:**
- Clean, modern, professional
- Soft blues and warm neutrals (brand colors)
- High-quality screenshots (not stock photos)
- Mobile-responsive
- Fast loading (<3 seconds)

**Acceptance Criteria:**
- ✅ Conversion rate 20%+ (visitors → signups)
- ✅ Clear value proposition above fold
- ✅ Social proof present
- ✅ Mobile-optimized
- ✅ Fast loading

**Out of Scope:**
- Video demo (create after launch with real product)
- Blog - future
- Case studies - future (need customers first)
- Live chat - future

---

## 5. Technical Architecture

### 5.1 Tech Stack (Locked In)

**Frontend:**
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- State: React Context + React Query
- Hosting: Vercel (Free tier)

**Backend:**
- API: Next.js API Routes (serverless functions)
- Database: Supabase PostgreSQL (Free tier: 500MB DB, 1GB storage)
- Auth: Clerk (Free tier: 10,000 MAU)
- File Storage: Supabase Storage

**AI Services:**
- AI Provider (abstracted, switchable via `AI_PROVIDER` env var):
  - Default: Claude Sonnet 4.5 (Anthropic API) with prompt caching
  - Alternative: OpenAI GPT-4o-mini
  - Dev: Placeholder stub (no API cost)
- Transcription Provider (abstracted, switchable via `TRANSCRIPTION_PROVIDER` env var):
  - Default: Deepgram Nova-2 (speaker diarization, 36% lower WER)
  - Alternative: OpenAI Whisper
  - Dev: Placeholder stub (returns dummy transcript)
  - Manual upload always available regardless of provider

**Payments:**
- Payment Processor (abstracted, switchable via `BILLING_PROVIDER` env var):
  - Default: Stripe (test mode for MVP, production after first customers)
  - Dev: Placeholder stub (simulates upgrade, no real payment)
  - Swappable without code changes

**Monitoring (Post-Launch):**
- Vercel Analytics (built-in)
- Supabase Dashboard (built-in)
- Sentry (error tracking) - optional

**Total Monthly Costs:**
- Development: $20 (Claude Code subscription)
- Production: $0 (all free tiers) + AI API costs (pay-as-you-go)

---

### 5.2 Database Schema (Complete)

```sql
-- Enable pgvector for semantic search (Solis hybrid RAG)
CREATE EXTENSION IF NOT EXISTS vector;

-- Clients Table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  name TEXT NOT NULL,
  goal TEXT,
  company TEXT,
  role TEXT,
  start_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_clients ON clients(user_id);

-- Sessions Table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  session_date DATE NOT NULL,
  title TEXT NOT NULL,

  transcript_text TEXT,
  transcript_file_url TEXT,       -- Supabase Storage URL (manual .txt/.docx)
  transcript_audio_url TEXT,      -- Supabase Storage URL (auto-transcribed audio/video)

  summary TEXT,
  key_topics TEXT[],
  embedding vector(1536),         -- pgvector embedding of summary (hybrid RAG)

  status TEXT DEFAULT 'pending',  -- 'pending' | 'processing' | 'complete' | 'error'

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_client_sessions ON sessions(client_id);
CREATE INDEX idx_user_sessions ON sessions(user_id);
CREATE INDEX idx_session_date ON sessions(session_date DESC);

-- Action Items Table
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to TEXT, -- 'client' | 'coach'
  
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_session_actions ON action_items(session_id);
CREATE INDEX idx_client_actions ON action_items(client_id);
CREATE INDEX idx_pending_actions ON action_items(user_id, status) WHERE status = 'pending';

-- Solis Queries Table (Usage Tracking)
CREATE TABLE solis_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  client_id UUID, -- NULL if global query

  query_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  citations JSONB DEFAULT '[]', -- [{session_id, session_date, title}]

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_queries ON solis_queries(user_id, created_at DESC);

-- Usage Tracking Table (For Billing Limits)
-- Free tier: lifetime counters (no reset). Pro tier: monthly reset via timestamp.
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,

  transcript_count INT DEFAULT 0,
  transcript_reset_at TIMESTAMPTZ, -- NULL = lifetime (free); set = last monthly reset (pro)

  query_count INT DEFAULT 0,
  query_reset_at TIMESTAMPTZ,      -- NULL = lifetime (free); set = last monthly reset (pro)

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  
  tier TEXT DEFAULT 'free', -- 'free' | 'pro'
  status TEXT DEFAULT 'active', -- 'active' | 'cancelled' | 'expired'
  
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_subscription ON subscriptions(user_id);
```

---

### 5.3 Key API Routes

**Client Management:**
- `POST /api/clients` - Create client
- `GET /api/clients` - List clients
- `GET /api/clients/[id]` - Get client details
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

**Session Management:**
- `POST /api/sessions` - Upload transcript
- `GET /api/sessions/[id]` - Get session
- `PUT /api/sessions/[id]` - Update session
- `POST /api/sessions/[id]/summarize` - Generate AI summary

**Solis Intelligence:**
- `POST /api/intelligence/query` - Ask question

**Action Items:**
- `PUT /api/action-items/[id]` - Update status
- `POST /api/action-items` - Create manual action item

**Billing:**
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `POST /api/stripe/portal` - Customer portal

---

### 5.4 Security & Compliance

**Data Security:**
- Encryption at rest (Supabase default)
- Encryption in transit (TLS 1.3)
- Row-level security (Supabase RLS policies)
- Password hashing (Clerk handles)

**Compliance:**
- **ICF Standards:** Session documentation meets ICF requirements
- **GDPR-Ready:** Right to access, delete, export (implement on request)
- **Privacy-First:** No AI training on user data (Anthropic policy)

**Access Control:**
- Users can only access their own data (enforced via RLS)
- Clerk session tokens (JWT)
- API routes protected (check auth on every request)

---

## 6. Go-to-Market Strategy

### 6.1 Launch Strategy (March 10, 2026)

**Pre-Launch (Week of March 3-9):**
- Final testing on production
- Set up support email (support@meetsolis.com via Gmail)
- Prepare launch content (LinkedIn post, email)
- Invite 10 beta testers (coaches from network)

**Launch Day (March 10):**
- Announce on LinkedIn (personal account + repost from founders)
- Post in ICF community forums
- Post in Reddit r/coaching
- Email personal network
- Post in coaching Facebook groups

**Week 1 Post-Launch:**
- Daily signup monitoring
- Respond to support emails <24 hours
- Fix critical bugs immediately
- Schedule 30-min user interviews (first 10 users)

**Week 2-4:**
- Iterate based on feedback
- Double down on what's working
- Content marketing begins (blog, LinkedIn)

---

### 6.2 Customer Acquisition Channels

**Month 1-3:**
- **Founder-Led Sales:** Personal LinkedIn outreach
- **Community:** ICF chapters, coaching groups
- **Content:** Blog posts on coaching best practices
- **Referrals:** Ask happy users to refer

**Month 4-6:**
- **SEO:** Target "coaching session notes", "executive coaching software"
- **Partnerships:** ICF certification programs
- **Paid Ads:** Google Ads (small budget: $500-1K/month)
- **Speaking:** Coach conferences, webinars

**CAC Target:** $200-400 per customer

---

### 6.3 Pricing & Monetization

**Pricing Tiers:**

**Free (Forever):**
- 1 active client
- 3 AI transcripts (lifetime)
- 50 Solis queries (lifetime)
- Unlimited manual uploads (with AI processing counted)

**Pro - $99/month or $948/year:**
- Unlimited clients
- 25 AI transcripts/month
- 2,000 Solis queries/month
- ICF-compliant exports
- Priority support (24-hour response)

**Annual Discount:** Save $240/year ($79/month effective)

**Revenue Projections:**

**Month 1 (Post-Launch):**
- 50-100 signups
- 10-20 paying ($99/mo)
- MRR: $990-1,980

**Month 3:**
- 150-250 signups total
- 30-50 paying
- MRR: $2,970-4,950

**Month 6:**
- 300-500 signups total
- 100-150 paying
- MRR: $9,900-14,850

**Month 12:**
- 600-1,000 signups total
- 200-400 paying
- MRR: $19,800-39,600 ($240K-475K ARR)

---

### 6.4 Unit Economics

**Per-Customer Economics (Pro Tier):**

**Revenue:**
- Monthly: $99
- Annual: $1,188

**COGS:**
- AI Summaries (25/mo): $0.50
- Solis Queries (2,000/mo with caching): $2.00
- Infrastructure: $0 (free tiers)
- **Total COGS: $2.50/month**

**Gross Profit:** $96.50/month  
**Gross Margin:** 97.5%

**CAC:** $250 (target)  
**LTV:** $99 × 36 months × 0.75 retention = $2,673  
**LTV:CAC:** 10.7:1 (Excellent - target is 3:1+)

**Payback Period:** $250 / $96.50 = 2.6 months

---

## 7. Success Metrics & KPIs

### 7.1 North Star Metric

**Sessions Processed per Active User per Month**

Why: Indicates product usage depth and value realization

Target Progression:
- Month 1: 5 sessions/user
- Month 3: 10 sessions/user
- Month 6: 15 sessions/user
- Month 12: 20+ sessions/user

---

### 7.2 Key Metrics (First 90 Days)

**Acquisition:**
- Signups: 50-100 (Month 1), 300-500 (Month 3)
- Signup → Activation: 70%+ (create first client + upload first transcript)
- Viral coefficient: 0.2+ (organic referrals)

**Engagement:**
- Weekly Active Users (WAU): 80%+
- Sessions uploaded per week: 4+
- Solis queries per week: 10+
- Time to first value: <5 min

**Retention:**
- Month 1 retention: 85%+
- Month 3 retention: 75%+
- Month 6 retention: 70%+

**Revenue:**
- Free → Pro conversion: 20%+
- MRR growth rate: 15-20%/month (early stage)
- Churn rate: <5%/month
- NRR (Net Revenue Retention): 95%+ (low churn)

**Product:**
- AI summary accuracy: 95%+ (validated by users)
- Solis response time: <5 seconds average
- Uptime: 99.9%+
- Support response time: <24 hours

---

## 8. Risks & Mitigation

### 8.1 Market Risks

**Risk 1: AI Commoditization**
- **Threat:** OpenAI/Google adds meeting memory to ChatGPT/Gemini for free
- **Mitigation:** 
  - Build coach-specific workflows they can't easily replicate
  - Own ICF compliance narrative
  - Build two-sided network (client portal in Year 2)
  - Focus on vertical depth (coaching-specific features)

**Risk 2: Low Willingness to Pay**
- **Threat:** Coaches won't pay $99/month
- **Mitigation:** 
  - Validate with 10 coach interviews before building
  - Beta test at $79/month, then raise to $99
  - Show clear ROI (5 hours saved = $1,500 value)

**Risk 3: Slow Adoption**
- **Threat:** Coaches are slow to adopt new tools
- **Mitigation:**
  - Community-led growth (trust > ads)
  - Referral program (coaches influence each other)
  - ICF partnerships (official certification)
  - 14-day free trial (no credit card)

---

### 8.2 Product Risks

**Risk 4: AI Inaccuracy**
- **Threat:** Summaries get client details wrong → trust destroyed
- **Mitigation:**
  - Allow manual editing of summaries
  - 95%+ accuracy target (extensive testing)
  - Clear disclaimers ("AI-generated, please verify")
  - Option to regenerate summary

**Risk 5: Slow AI Response Times**
- **Threat:** Solis takes >10 seconds → frustration
- **Mitigation:**
  - Optimize prompts for conciseness
  - Use prompt caching (90% cost reduction + faster)
  - Monitor latency metrics
  - Show progress indicators

**Risk 6: Cost Overruns**
- **Threat:** AI costs exceed revenue
- **Mitigation:**
  - Usage limits enforced (2,000 queries/month)
  - Batch API for summaries (50% cost savings)
  - Prompt caching for queries (90% savings)
  - Monitor unit economics weekly

---

### 8.3 Execution Risks

**Risk 7: Can't Ship in 30 Days**
- **Threat:** MVP takes longer than expected
- **Mitigation:**
  - Ruthless scope control (only features in this PRD)
  - Use Claude Code for faster development
  - Cut features if needed (e.g., skip onboarding if tight)

**Risk 8: Can't Reach Coaches**
- **Threat:** Marketing doesn't work
- **Mitigation:**
  - Start with personal network (LinkedIn outreach)
  - Join ICF communities early
  - Content marketing (blog on coaching)
  - Partner with ICF trainers

---

## 9. Post-MVP Roadmap (Year 1)

### Q2 2026 (Months 4-6)
- Zoom integration (auto-import transcripts)
- Session preparation briefs (enhanced Solis feature)
- ICF-compliant PDF export
- Email notifications (session reminders)

### Q3 2026 (Months 7-9)
- Enhanced transcription (additional providers, calendar auto-import)
- Client-facing portal (Phase 1 - clients see their progress)
- Transformation tracking visualization
- Mobile app (responsive web → native)

### Q4 2026 (Months 10-12)
- Fractional CFO vertical launch
- Team features (coaching agencies, 5-10 coaches)
- Marketplace (3rd-party integrations)
- Advanced analytics

---

## 10. Long-Term Vision

**Year 2:** Multi-vertical SaaS ($1M+ ARR)
- Executive coaches (core)
- Fractional CFOs
- Fractional CMOs/CTOs
- Team collaboration features

**Year 3:** Platform Play ($5-10M ARR)
- API for developers
- White-label for enterprise coaching programs
- International expansion (Europe, Asia)
- Acquisition target ($15-30M)

**Year 5+:** Category Leader
- Own "client intelligence" category
- 10,000+ paying customers
- $20-50M ARR
- IPO or major acquisition ($100M+)

---

## 11. Team & Resources

### MVP Team (Month 1)
- **Founder (You):** Product, strategy, coding (with Claude Code)
- **Budget:** $20/month (Claude Code)

### Post-Launch (Months 2-6)
- Founder: Product, sales, support
- **Optional:** Part-time designer (contract) for marketing assets
- **Budget:** $100-500/month (AI API costs + tools)

### Year 1 (6-12 months)
- 1 Full-stack engineer (hire after $10K MRR)
- 1 Customer success / support (hire after 100 customers)
- **Budget:** $10K-20K/month (salaries + infrastructure)

---

## 12. Appendices

### Appendix A: Competitive Intelligence

**Direct Competitors:**
- Fireflies.ai ($19M raised)
- Otter.ai ($63M raised)
- Fathom (free, venture-backed)

**Adjacent Competitors:**
- Practice Better (all-in-one coaching platform)
- Simply.Coach (coach-specific software)
- CoachAccountable (legacy coaching tools)

**Our Differentiation:**
- Coach-specific (not generic)
- Client memory layer (not single meetings)
- AI-first (not bolt-on AI)
- Post-meeting focus (no bots)

---

### Appendix B: Market Research Summary

**Executive Coaching Market:**
- Size: $103.6B (2025), growing 9.11% CAGR
- Coaches: 87,900 globally
- Average coach earnings: $49K/year (global), much higher in US
- ICF certification: 50,000+ certified coaches

**Coach Pain Points (Validated):**
1. Forgetting client context (9/10 severity)
2. Session preparation time (8/10)
3. Mixing up clients (8/10)
4. Inconsistent notes (7/10)

**Willingness to Pay:**
- Coaches charge $200-500/hour
- Current SaaS spend: $50-100/month
- $99/month = 0.3-0.5% of monthly revenue
- ROI: 60:1 (saves 5 hours/week)

---

### Appendix C: User Personas

**Primary Persona: Sarah (Executive Coach)**
- Age: 45
- Experience: 8 years coaching
- Clients: 18 active
- Revenue: $18K/month
- Tech: Medium (uses Zoom, Notion, not "power user")
- Pain: Forgets client context, wastes time on notes
- Goal: Save 5 hours/week, never forget client details

**Secondary Persona: Michael (Fractional CFO)** (Future)
- Age: 52
- Experience: 15 years finance, 5 years fractional
- Clients: 4 companies
- Revenue: $25K/month
- Tech: High (uses many tools)
- Pain: Needs audit trails, can't mix up client financials
- Goal: Meticulous documentation, compliance

---

### Appendix D: Glossary

**Terms:**
- **Client Card:** Persistent container for all client data and sessions
- **Session:** A single coaching conversation (60-90 minutes)
- **Solis Intelligence:** AI-powered Q&A system
- **Action Item:** Commitment made during a session
- **ICF:** International Coaching Federation (certification body)
- **Transcript:** Written record of coaching session conversation

---

## 13. Final Notes & Next Steps

### This PRD is LOCKED for MVP Development

**What's Final:**
- ✅ ICP: Executive coaches
- ✅ Pricing: $99/month or $948/year
- ✅ MVP Scope: 11 features (no more, no less)
- ✅ Tech Stack: Next.js + Clerk + Supabase + Vercel
- ✅ Timeline: 30 days (launch March 10, 2026)
- ✅ Strategy: Bootstrap, manual + auto-transcription (Deepgram Nova-2)

**What's Flexible (Post-Launch):**
- Feature prioritization (based on user feedback)
- Pricing adjustments (if needed)
- Go-to-market tactics (test and iterate)

### Immediate Next Steps

**Tomorrow (Feb 11):**
1. Run database schema in Supabase
2. Test Claude API connection
3. Start Week 1 development tasks

**This Week (Week 1):**
- Foundation + basic UI
- Client CRUD operations
- Landing page

**Next 3 Weeks:**
- Week 2: Core features (upload, AI summaries)
- Week 3: Solis Intelligence + polish
- Week 4: Billing + final testing

**Launch Day (March 10):**
- Go live
- Announce to coaching community
- Start user interviews

### Success Criteria (First 30 Days)

If we achieve:
- ✅ 50+ signups
- ✅ 10+ paying customers ($990+ MRR)
- ✅ 70%+ say "I would pay for this"
- ✅ <5 critical bugs

**→ We have product-market fit signal. Keep building.**

Otherwise:
- Interview users deeply
- Pivot pricing, ICP, or features
- Iterate rapidly

---

## Document Approval

**Prepared By:** Product Team
**Approved By:** Founder
**Date:** February 10, 2026 (v3.0) · March 8, 2026 (v3.1)
**Version:** 3.1

**Status:** ✅ LOCKED FOR DEVELOPMENT

---

**This is the final PRD. No further changes unless critical market shift occurs.**

**Now go build.**

---

## Recent Changes (v3.1 — March 8, 2026)

The following architecture decisions were finalized after the original v3.0 lock and are now reflected throughout this document:

**1. Auto-Transcription added to MVP (Feature 3)**
Deepgram Nova-2 is now included as a second upload mode alongside manual upload. Coaches can upload audio/video files (.mp3, .mp4, .m4a, .wav, .webm) and get a transcript automatically with speaker diarization (coach vs. client speech labeled). Manual upload (.txt, .docx, paste) remains fully supported.

**2. AI provider made provider-agnostic (Features 4, 5)**
The AI model is no longer hardcoded to Claude Sonnet 4.5. It is abstracted behind a provider interface switchable via the `AI_PROVIDER` environment variable. Default: Claude Sonnet 4.5. Alternative: OpenAI GPT-4o-mini. A placeholder stub is used during development (zero API cost).

**3. Transcription provider abstracted**
Deepgram is the default but the transcription layer is switchable via `TRANSCRIPTION_PROVIDER` env var. Alternatives: OpenAI Whisper, or a dev placeholder stub.

**4. Payment processor abstracted**
Stripe is the default but the billing layer is switchable via `BILLING_PROVIDER` env var without code changes.

**5. Solis Intelligence upgraded to hybrid RAG (Feature 5)**
Context building now uses a hybrid approach: pgvector semantic search (top 3 relevant sessions by embedding similarity) combined with always including the 3 most recent sessions (deduplicated). Maximum 6 sessions passed per query. Session embeddings are generated automatically on upload and stored in `sessions.embedding`.

**6. Database schema updates (Section 5.2)**
- `sessions` table: added `transcript_audio_url`, `embedding vector(1536)`, `status`
- `solis_queries` table: added `citations JSONB` column
- `usage_tracking` table: revised from month-based design to lifetime counters with reset timestamps (cleaner for free-tier lifetime limits vs. pro-tier monthly resets)
- pgvector extension enabled

**7. Q3 2026 roadmap updated**
"Automated transcription (Whisper API)" removed from Q3 since Deepgram is now in MVP. Replaced with "Enhanced transcription (additional providers, calendar auto-import)".
