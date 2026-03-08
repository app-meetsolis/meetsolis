# Epic 4: AI Intelligence & Automation

**Version:** 2.0
**Status:** Not Started
**Priority:** P0 (Critical - MVP Differentiator)
**Target Timeline:** Week 3 (Jan 20-26, 2026) - Parallel with Epic 3
**Dependencies:** Epic 2 (Clients), Epic 3 (Meetings & Transcripts)

---

## Epic Overview

Build AI-powered intelligence features that differentiate MeetSolis: RAG-powered AI assistant, meeting preparation briefs, client research, and suggested talking points.

**Goal:** Enable users to ask AI questions about their clients and prepare confidently for meetings using AI-generated context.

---

## User Stories

### Story 4.1: Vector Embeddings Setup (RAG Foundation)

**As a** system
**I need** to convert meeting transcripts into vector embeddings
**So that** AI can perform semantic search over user data

**Acceptance Criteria:**
- [ ] Supabase pgvector extension enabled
- [ ] Embeddings table created:
  ```sql
  CREATE TABLE embeddings (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    client_id UUID REFERENCES clients(id),
    meeting_id UUID REFERENCES meetings(id),
    content TEXT NOT NULL,
    embedding VECTOR(1536),  -- OpenAI text-embedding-3-small
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] Embedding generation function (OpenAI API)
- [ ] Embed meeting transcripts automatically after summary generation
- [ ] Chunk long transcripts (500-word chunks) for better search
- [ ] Index on embedding column for fast similarity search
- [ ] RLS policies: Users can only query their own embeddings

**Embedding Strategy:**
- Use OpenAI `text-embedding-3-small` (1536 dimensions, $0.02/1M tokens)
- Embed: Meeting transcript (chunked), Client overview, Manual notes
- Store with metadata (client_id, meeting_id)

**Estimated Effort:** 1 day

---

### Story 4.2: AI Assistant Chat Interface

**As a** user
**I want to** ask questions about my clients via chat
**So that** I can quickly find information without searching manually

**Acceptance Criteria:**
- [ ] Assistant page: `/assistant`
- [ ] ChatGPT-style interface (message bubbles)
- [ ] Chat history sidebar (left) - list of past conversations
- [ ] Main chat window (right) - active conversation
- [ ] Input box at bottom with "Send" button
- [ ] Typing indicator while AI responds
- [ ] Message format:
  - User messages: Right-aligned, blue background
  - AI messages: Left-aligned, gray background
  - Timestamp on each message
- [ ] Pre-built question templates (buttons):
  - "What did I promise [client]?"
  - "Summarize last meeting with [client]"
  - "What action items are overdue?"
  - "What should I prepare for next meeting?"
- [ ] Empty state: "Ask me anything about your clients and meetings."
- [ ] Error handling: If AI fails, show error + retry

**Design:**
- ChatGPT-inspired layout
- Clean, minimal
- Source citations below AI responses (links to meetings)

**Estimated Effort:** 1 day

---

### Story 4.3: RAG Query Engine

**As a** system
**I need to** retrieve relevant context before sending to GPT
**So that** AI responses are grounded in user data

**Acceptance Criteria:**
- [ ] RAG query endpoint: POST /api/assistant/query
- [ ] Process:
  1. Convert user question to embedding
  2. Similarity search in embeddings table (cosine similarity)
  3. Retrieve top 5 most relevant chunks
  4. Build context: client info + meeting summaries + retrieved chunks
  5. Send to GPT-4o-mini with context
  6. GPT generates response
  7. Include source citations (meeting IDs)
- [ ] Response format:
  ```json
  {
    "answer": "In your last meeting with Marcus Thorne...",
    "sources": [
      {"meeting_id": "uuid", "title": "Q1 Strategy", "relevance": 0.92}
    ]
  }
  ```
- [ ] If no relevant context found: "I don't have enough information to answer that. Try asking about specific clients or meetings."
- [ ] Query time: <3 seconds

**Vector Search SQL:**
```sql
SELECT content, client_id, meeting_id,
       1 - (embedding <=> query_embedding) as similarity
FROM embeddings
WHERE user_id = $1
ORDER BY embedding <=> query_embedding
LIMIT 5;
```

**Estimated Effort:** 1 day

---

### Story 4.4: Chat History & Persistence

**As a** user
**I want** my chat conversations saved
**So that** I can refer back to previous questions

**Acceptance Criteria:**
- [ ] Chat conversations table:
  ```sql
  CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title TEXT,  -- Auto-generated from first message
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,  -- 'user' or 'assistant'
    content TEXT NOT NULL,
    sources JSONB,  -- [{meeting_id, title, relevance}, ...]
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] New conversation created on first message
- [ ] Auto-generate conversation title from first user message (using GPT)
- [ ] Chat history sidebar shows: Title, date, message count
- [ ] Click conversation → Load messages
- [ ] Pin conversation → Stays at top (pinned: true)
- [ ] Delete conversation (with confirmation)
- [ ] Auto-delete unpinned conversations after 30 days
- [ ] Search within conversation (client-side)

**Conversation Title Generation:**
- First message: "What did I promise Marcus Thorne?"
- Generated title: "Promises to Marcus Thorne"

**Estimated Effort:** 1 day

---

### Story 4.5: Meeting Prep Intelligence

**As a** user
**I want** AI to prepare me for meetings
**So that** I walk in confident and informed

**Acceptance Criteria:**
- [ ] "Prepare for Meeting" button on client detail page
- [ ] Modal opens with AI-generated prep brief
- [ ] Brief includes:
  - [ ] Client overview (from client card + AI)
  - [ ] Last meeting summary (if exists)
  - [ ] Open action items
  - [ ] Suggested talking points (3-5 bullets)
  - [ ] Things to avoid / sensitivities (if noted)
- [ ] If no past meetings: Brief uses client overview only
- [ ] Generation time: <10 seconds
- [ ] Allow manual edit before meeting
- [ ] Save prep brief to meeting (when logged)
- [ ] Print/export prep brief (PDF)

**Prep Brief Template:**
```
┌─────────────────────────────────────────┐
│ Meeting Prep: Sarah Chen               │
│ Product Director at Nexus Design        │
├─────────────────────────────────────────┤
│ CLIENT OVERVIEW                         │
│ Leading product at Nexus Design...     │
├─────────────────────────────────────────┤
│ LAST MEETING (2 days ago)               │
│ · Discussed Q1 product roadmap          │
│ · Decided to prioritize mobile app      │
│ · Sarah raised concerns about timeline  │
├─────────────────────────────────────────┤
│ OPEN ACTION ITEMS (2)                   │
│ [ ] Send pricing proposal by Jan 10    │
│ [ ] Schedule follow-up with CEO         │
├─────────────────────────────────────────┤
│ SUGGESTED TALKING POINTS                │
│ 1. Address timeline concerns raised     │
│ 2. Present pricing options              │
│ 3. Discuss mobile app MVP scope         │
│ 4. Clarify CEO meeting expectations     │
├─────────────────────────────────────────┤
│ CONTEXT & SENSITIVITIES                 │
│ · Budget-conscious, needs clear ROI     │
│ · Values transparency and honesty       │
└─────────────────────────────────────────┘
```

**Estimated Effort:** 1 day

---

### Story 4.6: Client Research (Public Website Scraping)

**As a** user
**I want** AI to research clients from their website
**So that** I can add context without manual research

**Acceptance Criteria:**
- [ ] "Research" button on client detail page (Overview tab)
- [ ] Input: Website URL (required)
- [ ] Scraping logic (Puppeteer):
  - Visit URL
  - Extract: Page title, meta description, main content, About page, Team page
  - Timeout after 30 seconds
- [ ] AI processing (GPT-4o-mini):
  - Analyze scraped content
  - Generate client overview (2-3 paragraphs)
  - Suggest talking points
  - Identify company priorities/values
- [ ] Save AI overview to clients.ai_overview
- [ ] Display on Overview tab
- [ ] Free tier: 3 research requests/month
- [ ] Pro tier: 20 research requests/month
- [ ] Error handling: If scraping fails, allow manual overview entry

**Website Scraper:**
```typescript
async function scrapeWebsite(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  const data = await page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || '',
    content: document.body.innerText.slice(0, 5000)  // First 5000 chars
  }));

  await browser.close();
  return data;
}
```

**AI Analysis Prompt:**
```
Analyze this company website and generate a professional client overview.

Website: {url}
Title: {title}
Description: {description}
Content: {content}

Provide:
1. Company Overview (2-3 paragraphs)
2. Industry & Focus
3. Likely Priorities
4. Suggested Talking Points (3-5 bullets)

Be concise, professional, and actionable.
```

**Estimated Effort:** 1 day

---

### Story 4.7: Suggested Talking Points

**As a** user
**I want** AI to suggest talking points for meetings
**So that** I don't forget important topics

**Acceptance Criteria:**
- [ ] "Suggest Talking Points" button on client detail page
- [ ] AI analyzes: Past meetings, open action items, client overview, notes
- [ ] Generates 3-5 talking points:
  - Follow-ups from last meeting
  - Unresolved questions
  - Open action items
  - New topics based on client context
- [ ] Displayed in bulleted list
- [ ] Editable (user can add/remove/reorder)
- [ ] Save to client notes (optional)
- [ ] Free tier: 1 suggestion per client
- [ ] Pro tier: Unlimited suggestions

**Example Output:**
```
SUGGESTED TALKING POINTS:

1. Follow up on pricing proposal
   (Promised in last meeting, due Jan 10)

2. Address timeline concerns for Q1 roadmap
   (Sarah raised this as a blocker)

3. Discuss mobile app MVP scope
   (Next phase after current project)

4. Clarify expectations for CEO meeting
   (Need to understand decision-making process)

5. Explore additional services we can provide
   (Upsell opportunity based on positive feedback)
```

**Estimated Effort:** 0.5 days

---

### Story 4.8: AI Usage Tracking & Limits

**As a** system
**I need to** track AI usage per user
**So that** free/pro tier limits are enforced

**Acceptance Criteria:**
- [ ] ai_usage_tracking table:
  ```sql
  CREATE TABLE ai_usage_tracking (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    feature TEXT NOT NULL,  -- 'transcription', 'summary', 'query', 'research'
    tokens_used INTEGER,
    cost_usd DECIMAL(10,4),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] Track every AI API call (Gladia, OpenAI)
- [ ] Calculate costs:
  - Gladia: $0.000612/min
  - GPT-4o-mini: $0.15/1M input tokens, $0.60/1M output tokens
  - Embeddings: $0.02/1M tokens
- [ ] Enforce limits:
  - Free: 3 transcriptions, 100 queries, 3 research/month
  - Pro: 20 transcriptions, 1000 queries, 20 research/month
- [ ] Usage dashboard (Settings page):
  - This month's usage (transcriptions, queries, research)
  - Progress bars (e.g., "15/20 transcriptions used")
  - Estimated cost
- [ ] Upgrade prompt when limit reached

**Limit Enforcement:**
```typescript
async function checkUsageLimit(userId: string, feature: string) {
  const userTier = await getUserTier(userId);  // 'free' or 'pro'
  const limits = { free: { transcription: 3, query: 100, research: 3 }, pro: { ... } };

  const usage = await countUsageThisMonth(userId, feature);
  if (usage >= limits[userTier][feature]) {
    throw new Error(`You've reached your ${feature} limit. Upgrade to Pro for more.`);
  }
}
```

**Estimated Effort:** 0.5 days

---

### Story 4.9: Private Meeting Assist Panel

**As a** user
**I want** a panel I can open during meetings
**So that** I have client context handy (client never sees this)

**Acceptance Criteria:**
- [ ] Assist Panel page: `/assist` (or modal overlay)
- [ ] Select client from dropdown
- [ ] Display:
  - Client summary
  - Last meeting summary
  - Open action items
  - Suggested talking points
  - Live note-taking field (auto-save)
- [ ] Auto-save notes every 30 seconds
- [ ] Notes linked to upcoming meeting (create placeholder meeting)
- [ ] Mobile-friendly (works on phone/tablet)
- [ ] Print view (no distractions)
- [ ] Privacy: Clear warning "This panel is for you only. Client cannot see this."

**Layout:**
```
┌────────────────────────────────────┐
│ Meeting Assist: Sarah Chen         │
├────────────────────────────────────┤
│ CLIENT SUMMARY                     │
│ Product Director, focused on...    │
├────────────────────────────────────┤
│ LAST MEETING (2 days ago)          │
│ · Discussed pricing options        │
│ · Sarah concerned about timeline   │
├────────────────────────────────────┤
│ OPEN ACTION ITEMS (2)              │
│ [ ] Send proposal by Jan 10        │
│ [ ] Schedule CEO meeting           │
├────────────────────────────────────┤
│ TALKING POINTS                     │
│ 1. Address timeline concerns       │
│ 2. Present pricing proposal        │
├────────────────────────────────────┤
│ LIVE NOTES                         │
│ [Text area - auto-saving...]       │
└────────────────────────────────────┘
```

**Estimated Effort:** 1 day

---

## Epic Success Criteria

**Functional:**
- [ ] AI assistant can answer questions about clients
- [ ] RAG search returns relevant meetings (<3 seconds)
- [ ] Meeting prep brief feels valuable (tested with beta users)
- [ ] Client research from websites works (>80% success rate)
- [ ] Free/Pro tier limits enforced (no abuse)

**Technical:**
- [ ] Vector embeddings working (Supabase pgvector)
- [ ] Semantic search fast (<500ms)
- [ ] AI responses grounded in user data (no hallucinations)
- [ ] Chat history persisted
- [ ] Usage tracking accurate

**User Experience:**
- [ ] AI feels intelligent (not generic)
- [ ] Prep brief saves time (users report 5-10 min saved)
- [ ] Clear when AI doesn't know something
- [ ] Sources cited for transparency

---

## Technical Architecture

### RAG Pipeline

```
User asks: "What did I promise Marcus?"
   ↓
1. Convert question to embedding (OpenAI)
   ↓
2. Vector similarity search (pgvector)
   ↓
3. Retrieve top 5 relevant chunks
   ↓
4. Build context:
   - Client: Marcus Thorne (Founder at Green Horizon)
   - Meetings: Q1 Strategy (Jan 3), Kickoff (Dec 15)
   - Relevant excerpts: "User promised to send proposal by Jan 10..."
   ↓
5. Send to GPT-4o-mini:
   System: "Answer based only on provided context."
   Context: [above]
   Question: "What did I promise Marcus?"
   ↓
6. GPT responds: "You promised to send a pricing proposal by Jan 10."
   ↓
7. Add sources: [Meeting: Q1 Strategy, Jan 3]
   ↓
8. Return to user
```

---

### API Routes

```
/api/assistant/query
  POST - Ask AI question (RAG query)

/api/conversations
  GET  - List chat history
  POST - Create new conversation

/api/conversations/[id]
  GET  - Get conversation messages
  DELETE - Delete conversation

/api/messages
  POST - Add message to conversation

/api/clients/[id]/prepare
  POST - Generate meeting prep brief

/api/clients/[id]/research
  POST - Research client from website

/api/clients/[id]/suggest-talking-points
  POST - Generate talking points

/api/usage
  GET - Get user's AI usage this month
```

---

## Testing Checklist

**Unit Tests:**
- [ ] Embedding generation (mock OpenAI API)
- [ ] Vector similarity search (test queries)
- [ ] Website scraper (mock Puppeteer)
- [ ] Usage limit enforcement

**Integration Tests:**
- [ ] RAG pipeline (embed → search → GPT → response)
- [ ] Chat history (create conversation → add messages → retrieve)
- [ ] Meeting prep (client + meetings → brief)
- [ ] Client research (URL → scrape → AI overview)

**E2E Tests:**
- [ ] User asks question → AI responds with sources
- [ ] User preps for meeting → Gets useful brief
- [ ] User researches client → Overview generated
- [ ] Free tier hits limit → Shown upgrade prompt

---

## Dependencies

**External:**
- OpenAI API (GPT-4o-mini, text-embedding-3-small)
- Puppeteer (website scraping)
- Supabase pgvector (vector search)

**Internal:**
- Epic 2 complete (clients)
- Epic 3 complete (meetings, transcripts)

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **AI hallucinates (makes up info)** | High | Strict prompt: "Only use provided context", cite sources |
| **Vector search returns irrelevant results** | Medium | Tune similarity threshold, improve chunking strategy |
| **Website scraping fails (anti-bot)** | Medium | Fallback to manual entry, handle errors gracefully |
| **AI costs exceed budget** | Medium | Enforce tier limits, monitor usage, alerts |
| **Prep brief feels generic** | Medium | Iterate on prompts with beta user feedback |

---

## Definition of Done

- [ ] All stories completed and tested
- [ ] AI assistant answers questions accurately (tested with 20+ queries)
- [ ] Meeting prep briefs feel valuable (NPS > 7/10 from beta users)
- [ ] Client research works for 80%+ of websites
- [ ] Free/Pro tier limits enforced and tested
- [ ] Usage tracking working (costs calculated correctly)
- [ ] No hallucinations (AI cites sources, says "I don't know" when appropriate)

---

**Next Epic:** [Epic 5: Advanced Features & Monetization →](./epic-5-advanced-features-monetization.md)
