# Sprint Change Proposal: Product Pivot to Client Memory Assistant

**Date:** January 6, 2026
**Proposal Version:** 1.0
**Status:** Pending Approval
**Impact Level:** CRITICAL - Major Product Pivot
**Timeline:** 25 days (Jan 6 - Jan 31, 2026)

---

## Executive Summary

**Issue:** MeetSolis v1.0 (custom video conferencing platform) faces fundamental market adoption challenges:
- High friction switching costs for users already on Google Meet/Zoom
- Commodity feature (video calling) with low differentiation
- Massive technical complexity with limited competitive advantage
- Real user pain ≠ video quality, it's **forgetting client context**

**Proposed Change:** Pivot to MeetSolis v2.0 (AI-powered client memory assistant):
- Integrate with existing meeting platforms (Google Meet/Zoom)
- Focus on client relationship intelligence, meeting preparation, AI-powered memory
- Build unique value: RAG-powered assistant, meeting summaries, context recall

**Impact:** Complete rewrite of Epic 2-5, archive video code, new database schema, new UI, new revenue model

**Rationale:** Build what users actually need (memory/prep) vs. what exists everywhere (video calling)

**Outcome:** Maintainable MVP within January 2026, sustainable unit economics (97%+ profit margin), unique market positioning

---

## 1. Change Analysis

### 1.1 Core Product Shift

| Aspect | v1.0 (Old) | v2.0 (New) | Change Type |
|--------|------------|------------|-------------|
| **Core Product** | Custom video platform | Client memory assistant | FUNDAMENTAL |
| **Video Strategy** | Build custom WebRTC | Integrate existing platforms | ARCHITECTURE |
| **Data Model** | Meeting-centric | Client-centric | DATABASE |
| **Primary Value** | HD video calls | AI memory & prep | POSITIONING |
| **Tech Stack** | Stream SDK, simple-peer | Gladia, pgvector, GPT-4o-mini | DEPENDENCIES |
| **Revenue Model** | Subscription for video features | Subscription for AI intelligence | BUSINESS MODEL |

### 1.2 Impact Assessment

**Epic 1 (Foundation):** ✅ **KEEP**
- Auth (Clerk), database infrastructure (Supabase), Next.js 14 setup
- No changes required, foundation remains solid

**Epic 2 (Video Infrastructure):** ❌ **ARCHIVE & REPLACE**
- Old: WebRTC, Stream SDK, peer connections, video controls
- New: Client card system, client management CRUD, dashboard UI
- Impact: Complete rewrite, archive existing code

**Epic 3 (Collaboration Tools):** ❌ **ARCHIVE & REPLACE**
- Old: Whiteboard, chat, reactions, screen sharing
- New: Meeting memory, Gladia transcription, AI summaries, action items
- Impact: Complete rewrite, new features

**Epic 4 (Advanced Video):** ❌ **ARCHIVE & REPLACE**
- Old: Recording, backgrounds, breakout rooms, live translation
- New: RAG-powered AI assistant, vector embeddings, meeting prep, client research
- Impact: Complete rewrite, new AI infrastructure

**Epic 5 (Monetization):** 🔄 **PARTIAL REWRITE**
- Keep: Stripe integration, tier enforcement, settings, billing
- Change: Pricing tiers (Free: 3 clients, Pro: 50 clients), usage limits (AI features)
- Impact: Moderate changes

### 1.3 Artifact Changes

**Database Schema:**

**DROP (from Epic 2-4 v1.0):**
```sql
DROP TABLE IF EXISTS meetings_v1;  -- Old video meeting structure
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS waiting_room;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS whiteboard_data;
DROP TABLE IF EXISTS recordings;
```

**CREATE (for v2.0):**
```sql
-- Epic 2: Client Cards
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  email TEXT,
  tags JSONB DEFAULT '[]',
  notes TEXT,
  ai_overview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Epic 3: Meetings v2.0
CREATE TABLE meetings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  platform TEXT,  -- 'google_meet', 'zoom', 'other'
  meeting_url TEXT,
  notes TEXT,
  transcript TEXT,
  summary JSONB,
  ai_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE action_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES clients(id),
  meeting_id UUID REFERENCES meetings(id),
  description TEXT NOT NULL,
  owner TEXT,  -- 'user', 'client', 'unknown'
  status TEXT DEFAULT 'to_prepare',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Epic 4: AI Intelligence
CREATE TABLE embeddings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES clients(id),
  meeting_id UUID REFERENCES meetings(id),
  content TEXT NOT NULL,
  embedding VECTOR(1536),  -- pgvector
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  messages JSONB,  -- [{role, content, timestamp, sources}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_usage_tracking (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  feature TEXT,  -- 'transcription', 'summary', 'chat', 'research'
  cost_usd NUMERIC(10,6),
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

**API Routes:**

**REMOVE:**
```
/api/meetings/[id]/video          ❌ DELETE
/api/meetings/[id]/participants   ❌ DELETE
/api/meetings/[id]/chat           ❌ DELETE
/api/meetings/[id]/whiteboard     ❌ DELETE
/api/meetings/[id]/recording      ❌ DELETE
/api/stream/token                 ❌ DELETE
```

**ADD:**
```
/api/clients                      ✅ CREATE (CRUD)
/api/clients/[id]/notes           ✅ CREATE (auto-save)
/api/meetings                     ✅ CREATE (v2.0 structure)
/api/meetings/[id]/transcribe     ✅ CREATE (Gladia)
/api/meetings/[id]/generate-summary ✅ CREATE (GPT-4o-mini)
/api/action-items                 ✅ CREATE (CRUD)
/api/chat                         ✅ CREATE (RAG-powered)
/api/chat/[id]/message            ✅ CREATE (streaming)
/api/clients/[id]/research        ✅ CREATE (web scraping)
/api/clients/[id]/prep-brief      ✅ CREATE (AI prep)
```

**Components:**

**REMOVE:**
```
/components/video/VideoPlayer.tsx           ❌ ARCHIVE
/components/video/VideoControls.tsx         ❌ ARCHIVE
/components/video/ParticipantGrid.tsx       ❌ ARCHIVE
/components/whiteboard/Whiteboard.tsx       ❌ ARCHIVE
/components/chat/ChatPanel.tsx              ❌ ARCHIVE (video chat)
/components/meeting/WaitingRoom.tsx         ❌ ARCHIVE
```

**ADD:**
```
/components/clients/ClientCard.tsx          ✅ CREATE
/components/clients/ClientGrid.tsx          ✅ CREATE
/components/clients/ClientAddModal.tsx      ✅ CREATE
/components/clients/ClientDetail.tsx        ✅ CREATE
/components/clients/ClientNotes.tsx         ✅ CREATE (rich text)
/components/meetings/MeetingCard.tsx        ✅ CREATE
/components/meetings/MeetingLogModal.tsx    ✅ CREATE
/components/meetings/MeetingDetail.tsx      ✅ CREATE
/components/ai/ChatInterface.tsx            ✅ CREATE
/components/ai/PrepBrief.tsx                ✅ CREATE
/components/ai/ActionItemList.tsx           ✅ CREATE
```

---

## 2. Proposed Edits

### 2.1 File Operations

**Archive (DO NOT DELETE):**
```bash
# Move Epic 2 v1.0 video code to archive
mkdir -p archive/epic-2-video-v1.0
git mv apps/web/src/components/video archive/epic-2-video-v1.0/
git mv apps/web/src/components/whiteboard archive/epic-2-video-v1.0/
git mv apps/web/src/hooks/useWebRTC.ts archive/epic-2-video-v1.0/
git commit -m "archive: Epic 2 v1.0 video infrastructure"
```

**Delete (Safe to Remove):**
```bash
# Old onboarding flow (will rebuild from scratch)
rm -rf apps/web/src/components/onboarding
```

**Keep (No Changes):**
```bash
# Epic 1 foundation
apps/web/src/lib/clerk.ts                    ✅ KEEP
apps/web/src/lib/supabase.ts                 ✅ KEEP
apps/web/src/middleware.ts                   ✅ KEEP
apps/web/src/app/layout.tsx                  ✅ KEEP
```

### 2.2 Database Migrations

**Migration Plan:**

**Step 1: Backup**
```bash
# Create backup of current database
npm run db:backup
```

**Step 2: Drop Old Tables**
```sql
-- migrations/20260106_drop_video_tables.sql
DROP TABLE IF EXISTS recordings CASCADE;
DROP TABLE IF EXISTS whiteboard_data CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS waiting_room CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;  -- v1.0 structure
```

**Step 3: Create New Schema**
```bash
# Run migrations in order
npm run db:migrate -- migrations/20260106_create_clients.sql
npm run db:migrate -- migrations/20260106_create_meetings_v2.sql
npm run db:migrate -- migrations/20260106_create_action_items.sql
npm run db:migrate -- migrations/20260106_enable_pgvector.sql
npm run db:migrate -- migrations/20260106_create_embeddings.sql
npm run db:migrate -- migrations/20260106_create_conversations.sql
npm run db:migrate -- migrations/20260106_create_usage_tracking.sql
```

**Step 4: Verify**
```bash
# Verify schema
npm run db:verify
# Run seed data (test clients)
npm run db:seed
```

### 2.3 Dependencies

**Remove:**
```json
{
  "dependencies": {
    "@stream-io/video-react-sdk": "REMOVE",
    "simple-peer": "REMOVE",
    "excalidraw": "REMOVE",
    "@livekit/components-react": "REMOVE"
  }
}
```

**Add:**
```json
{
  "dependencies": {
    "gladia": "^1.0.0",
    "pgvector": "^0.1.8",
    "cheerio": "^1.0.0",  // Web scraping
    "sanitize-html": "^2.11.0",  // XSS prevention
    "@tiptap/react": "^2.1.0",  // Rich text editor
    "@tiptap/starter-kit": "^2.1.0"
  }
}
```

### 2.4 Environment Variables

**Remove:**
```env
STREAM_API_KEY=xxx          # DELETE
STREAM_API_SECRET=xxx       # DELETE
LIVEKIT_API_KEY=xxx         # DELETE
LIVEKIT_API_SECRET=xxx      # DELETE
```

**Add:**
```env
# Gladia (transcription)
GLADIA_API_KEY=xxx

# OpenAI (AI features)
OPENAI_API_KEY=xxx

# Existing (keep)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=xxx
CLERK_SECRET_KEY=xxx
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
```

---

## 3. Implementation Path Forward

### Week 1 (Jan 6-12): Foundation & Database
**Owner:** @dev (Full Stack Developer)

**Mon (Jan 6):**
- [ ] Archive Epic 2 v1.0 code (git mv to archive/)
- [ ] Create database migration files
- [ ] Backup current database

**Tue (Jan 7):**
- [ ] Drop old video tables
- [ ] Run new schema migrations (clients, meetings v2.0, action_items)
- [ ] Enable pgvector extension
- [ ] Verify schema with test data

**Wed (Jan 8):**
- [ ] Client API routes: POST/GET/PUT/DELETE /api/clients
- [ ] Client validation schemas (Zod)
- [ ] RLS policies for clients table
- [ ] Unit tests for client CRUD

**Thu (Jan 9):**
- [ ] Gladia API integration setup
- [ ] Meeting API routes: POST/GET/PUT/DELETE /api/meetings
- [ ] File upload to Supabase Storage (transcripts, recordings)
- [ ] Gladia transcription endpoint: POST /api/meetings/[id]/transcribe

**Fri (Jan 10):**
- [ ] OpenAI API setup (GPT-4o-mini)
- [ ] AI summary endpoint: POST /api/meetings/[id]/generate-summary
- [ ] Action item extraction logic
- [ ] Test full pipeline: Upload → Transcribe → Summarize

### Week 2 (Jan 13-19): Core UI & Client Cards
**Owner:** @dev

**Mon (Jan 13):**
- [ ] Dashboard layout (sidebar + main content area)
- [ ] Sidebar navigation component
- [ ] Main content header (matching reference design)
- [ ] Background color (#E8E4DD), typography (Inter font)

**Tue (Jan 14):**
- [ ] ClientCard component (name, role, last meeting, badges)
- [ ] ClientGrid component (3-col responsive grid)
- [ ] Hover states (lift effect, shadow increase)
- [ ] Loading state (skeleton cards)

**Wed (Jan 15):**
- [ ] Add Client modal (form with validation)
- [ ] Client search & filter bar
- [ ] Tag management component
- [ ] Empty state ("No clients yet...")

**Thu (Jan 16):**
- [ ] Client detail page (/clients/[id])
- [ ] Tabbed interface (Overview, Meetings, Notes, Actions)
- [ ] Back button, Edit button, Delete button
- [ ] Client info display (name, company, role, tags)

**Fri (Jan 17):**
- [ ] Rich text notes editor (Tiptap)
- [ ] Auto-save notes (5-second debounce)
- [ ] Client deletion with confirmation
- [ ] Free tier limit enforcement (3 clients)

### Week 3 (Jan 20-26): Meetings & AI
**Owner:** @dev + @architect (AI infrastructure)

**Mon (Jan 20):**
- [ ] Meeting log form (title, date, platform, URL, file uploads)
- [ ] Drag-and-drop file upload UI
- [ ] Upload progress indicators
- [ ] File upload to Supabase Storage

**Tue (Jan 21):**
- [ ] Gladia transcription flow (async processing)
- [ ] Polling UI (transcription status)
- [ ] Error handling (retry logic)
- [ ] Free/Pro tier transcription limits (3/20 per month)

**Wed (Jan 22):**
- [ ] pgvector setup (embedding generation pipeline)
- [ ] RAG ingestion (embed transcripts after AI summary)
- [ ] Vector similarity search function
- [ ] Embeddings API: POST /api/embeddings

**Thu (Jan 23):**
- [ ] AI chat UI (ChatGPT-style interface)
- [ ] RAG query endpoint: POST /api/chat
- [ ] Streaming responses (SSE)
- [ ] Source citations (links to meetings)

**Fri (Jan 24):**
- [ ] Meeting prep brief generation
- [ ] Client research (public website scraping)
- [ ] Suggested talking points
- [ ] Usage tracking (ai_usage_tracking table)

### Week 4 (Jan 27-31): Billing, Testing, Launch
**Owner:** @dev + @qa

**Mon (Jan 27):**
- [ ] Stripe product setup (Pro Monthly $29, Pro Annual $249)
- [ ] Checkout integration (redirect flow)
- [ ] Webhook endpoint: POST /api/webhooks/stripe
- [ ] Webhook handlers (checkout.session.completed, subscription.deleted)

**Tue (Jan 28):**
- [ ] Tier enforcement middleware (checkTierLimit function)
- [ ] Upgrade modals & prompts
- [ ] Pricing page (/pricing)
- [ ] Settings page (/settings - Profile, Billing, Preferences)

**Wed (Jan 29):**
- [ ] 14-day free trial implementation
- [ ] Email notifications (welcome, trial reminders, payment failed)
- [ ] Data export (GDPR compliance)
- [ ] Account deletion (GDPR right to erasure)

**Thu (Jan 30):**
- [ ] E2E testing (Playwright): Full user journeys
- [ ] Performance optimization (Lighthouse >90)
- [ ] Error tracking (Sentry integration)
- [ ] Final QA pass (no P0/P1 bugs)

**Fri (Jan 31):**
- [ ] Production deployment checklist
- [ ] Privacy policy published
- [ ] OpenAI DPA signed
- [ ] Smoke testing (prod environment)
- [ ] **🚀 MVP LAUNCH**

---

## 4. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Database migration fails** | CRITICAL | Full backup before migration, rollback plan, test in staging first |
| **Gladia transcription inaccurate** | MEDIUM | Allow manual transcript upload, allow editing, use Gladia's "accuracy" model |
| **GPT summary too generic** | MEDIUM | Refine prompts with examples, allow manual edits, add regenerate button |
| **Timeline too aggressive (25 days)** | HIGH | Prioritize MVP scope, cut non-essential features (defer to post-MVP), parallel workstreams |
| **Free tier abuse (AI costs)** | MEDIUM | Strict rate limiting, usage tracking, auto-downgrade if exceeded |
| **User confusion during pivot** | LOW | Clear messaging, changelog, migration guide for existing users (if any) |

---

## 5. Success Criteria

**Technical:**
- [ ] All new database tables created with RLS policies
- [ ] All Epic 2-5 v1.0 code archived (not deleted)
- [ ] Zero data loss during migration
- [ ] All API routes tested (unit + integration tests)
- [ ] Lighthouse performance score >90
- [ ] No P0/P1 bugs in production

**Functional:**
- [ ] User can create 3 clients (Free) or 50 clients (Pro)
- [ ] User can log meeting + upload recording → AI summary in <2 min
- [ ] User can ask AI questions → RAG retrieves relevant context
- [ ] User can upgrade to Pro via Stripe → Access unlocked
- [ ] Free tier limits enforced (3 AI meetings/month)

**Business:**
- [ ] 10+ beta users signed up
- [ ] 5+ Pro upgrades ($29/mo)
- [ ] Unit economics validated (97%+ margin)
- [ ] MVP launched by Jan 31, 2026

---

## 6. Agent Handoff Plan

**Current Agent:** @po (Product Owner - Sarah)
**Next Agent:** @dev (Full Stack Developer)

**Handoff Checklist:**
- [x] PRD v2.0 created (7 documents, ~2,400 lines)
- [x] Epic 2-5 rewritten (4 epics, 39 stories, ~3,500 lines)
- [x] Sprint Change Proposal created (this document)
- [ ] **PENDING USER APPROVAL** ⬅️ YOU ARE HERE
- [ ] After approval: @dev begins Week 1 implementation

**Files to Hand Off:**
```
docs/prd/
  ├── prd-v2.md                               ✅ CREATED
  ├── goals-and-background-context.md         ✅ CREATED
  ├── requirements.md                         ✅ CREATED
  ├── pricing-business-model.md               ✅ CREATED
  ├── mvp-scope-timeline.md                   ✅ CREATED
  ├── non-goals.md                            ✅ CREATED
  ├── user-interface-design-goals.md          ✅ CREATED
  ├── epic-2-client-card-system.md            ✅ CREATED
  ├── epic-3-meeting-memory.md                ✅ CREATED
  ├── epic-4-ai-intelligence.md               ✅ CREATED
  └── epic-5-advanced-features-monetization.md ✅ CREATED

docs/
  └── sprint-change-proposal.md               ✅ THIS DOCUMENT
```

---

## 7. Final Review & Approval

**This proposal requires explicit approval before proceeding.**

### Approval Checklist

**Strategic Alignment:**
- [ ] Pivot aligns with market insights (users don't need another video platform)
- [ ] New positioning is defensible (AI memory assistant, not commodity video)
- [ ] Timeline is realistic (25 days, aggressive but achievable)

**Technical Feasibility:**
- [ ] Database migration plan is safe (backup, rollback, staging test)
- [ ] New tech stack is proven (Gladia, pgvector, GPT-4o-mini)
- [ ] Epic 1 foundation remains solid (no breaking changes)

**Business Viability:**
- [ ] Unit economics validated (97%+ profit margin at $29/mo)
- [ ] Free tier sustainable (limited AI usage prevents runaway costs)
- [ ] Revenue model scalable (Stripe, tiered pricing)

### Approval Decision

**OPTIONS:**

**A. ✅ APPROVE - Proceed with Implementation**
- Start Week 1 (Jan 6-12): Database migration, API routes
- Archive Epic 2 v1.0 code (no deletion)
- Full speed ahead to Jan 31 launch

**B. 🔄 APPROVE WITH MODIFICATIONS**
- List specific changes required
- Update PRD/Epic files accordingly
- Re-submit for approval

**C. ❌ REJECT - Do Not Proceed**
- Revert to v1.0 video platform strategy
- Continue Epic 2 video infrastructure work
- Re-evaluate pivot at later date

---

**Next Step:** USER APPROVAL REQUIRED ⬅️

**After Approval:**
```bash
# Agent handoff
@po → @dev

# Dev starts Week 1 implementation
cd meetsolis
npm run db:backup
npm run db:migrate:drop-video-tables
npm run db:migrate:create-v2-schema
```

**End of Sprint Change Proposal**
