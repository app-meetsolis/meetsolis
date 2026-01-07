# Requirements

**Version:** 2.0 (Major Pivot)
**Last Updated:** January 5, 2026
**Previous Version:** 1.0 (Video Conferencing Requirements) - See git history

---

## Functional Requirements

### Client Management (FR1-FR5)

**FR1: Client Card Creation & Management**
- System shall allow users to create client profiles in <30 seconds
- Fields: Name, company, role, email, phone (optional), website, LinkedIn (optional)
- Support manual info entry OR automated research via public website scraping
- Maximum 50 clients per Pro user, 3 clients per Free user

**FR2: AI-Powered Client Overview**
- System shall generate AI summary of client from provided data (website, social links, manual notes)
- AI overview shall include: Company description, likely priorities, suggested talking points
- Users can manually edit/override AI-generated content
- Generation time: <30 seconds per client

**FR3: Client Search & Filtering**
- System shall provide search by: client name, company name, tags
- Filter by: tags (VIP, High Priority, On Hold), recent activity, upcoming meetings
- Sort by: name (A-Z), last meeting date, next meeting date, date added

**FR4: Client Data Export**
- Users can export individual client data (PDF format)
- Export includes: overview, meeting history, notes, action items
- Pro users can bulk export all clients (CSV format)

**FR5: Client Tags & Labels**
- Users can add custom tags to clients (e.g., "VIP", "High Priority", "On Hold")
- Free plan: 3 tags max, Pro plan: unlimited tags
- Tag-based filtering and organization

---

### Meeting Memory (FR6-FR10)

**FR6: Manual Meeting Logging**
- Users can log meetings with: date, client, title, meeting platform (Google Meet, Zoom, Other)
- Support manual notes entry (unlimited length)
- Upload transcript files (TXT, SRT, VTT formats, max 10MB)
- Upload recording files (MP3, MP4, M4A, WAV, max 100MB)
- Tag meetings with custom labels

**FR7: Meeting Link Integration**
- Users can paste meeting links (Google Meet, Zoom URLs)
- OR system can auto-generate Google Meet/Zoom links via OAuth (Pro only)
- Meeting links stored with meeting record
- One-click launch to meeting platform

**FR8: AI Meeting Summaries**
- System shall transcribe uploaded recordings using Gladia API (<$0.04/hour)
- AI generates structured summary: key discussion points, decisions made, questions raised
- Summary generation time: <60 seconds for 1-hour meeting
- Users can edit/regenerate summaries
- Free: 3 AI summaries/month, Pro: 20 AI summaries/month

**FR9: Action Item Extraction**
- AI automatically extracts action items from meeting transcripts
- Action items include: task description, owner (user/client), due date (if mentioned)
- Users can manually add/edit action items
- Status tracking: To Prepare, Promised (to client), Done
- Email/in-app notifications for overdue items (Pro only)

**FR10: Meeting History**
- Client card displays chronological meeting history
- Meeting cards show: date, title, platform, summary snippet, # action items (open/total)
- Free users: 30-day history retention, Pro users: unlimited history
- Search within meeting notes and summaries

---

### Meeting Preparation (FR11-FR13)

**FR11: Meeting Prep Intelligence**
- "Prepare for Meeting" button on client card
- AI generates prep brief using past meeting context
- Prep brief includes: client overview, last meeting summary, open action items, suggested talking points, things to avoid
- If no past meetings: prep uses client overview only
- Generation time: <10 seconds

**FR12: Private Meeting Assist Panel**
- During-meeting panel (web interface, not visible to client)
- Displays: client summary, talking points from prep, open action items, live note field
- Notes auto-save every 30 seconds
- Panel accessible on mobile (responsive design)

**FR13: Suggested Talking Points**
- AI analyzes past meetings and client context
- Generates 3-5 talking points based on: unresolved topics, follow-ups needed, recent client activity
- Manual "Suggest" button (not automatic)
- Pro users: unlimited suggestions, Free users: 1 suggestion per client

---

### AI Assistant (FR14-FR16)

**FR14: RAG-Powered Q&A**
- Chat interface for asking questions about clients
- AI searches user's client data using vector embeddings (Supabase pgvector)
- Answers questions like: "What did I promise Client X?", "Summarize last meeting with Y", "What's the status of Z project?"
- Multi-turn conversations with context preserved
- Pro: 1000 queries/month, Free: 100 queries/month

**FR15: Chat History & Pinning**
- Chat history auto-deleted after 30 days
- Users can "pin" important conversations → saved permanently
- Search within chat history
- Export chat conversation (TXT format)

**FR16: Pre-built Question Templates**
- System provides common question templates:
  - "What did I promise [client]?"
  - "Summarize all meetings with [client]"
  - "What action items are overdue for [client]?"
  - "What should I prepare for next meeting?"
- Free: 5 templates, Pro: 20+ templates

---

### Client Research (FR17-FR18)

**FR18: Public Website Scraping (MVP)**
- "Research" button on client card
- System scrapes public website URL provided by user
- Extracts: company description, services, team info, blog/news
- AI generates client overview from scraped data
- Processing time: <30 seconds per website
- Free plan: 3 research requests/month, Pro plan: 20 requests/month

**FR18: Manual Data Entry**
- Users can manually add any client information
- Fields: company description, key contacts, project details, preferences, notes
- Rich text editor for notes (bold, italic, lists, links)

---

### Data Management (FR19-FR22)

**FR19: Data Storage Limits**
- Free plan: 100MB total storage (transcripts + recordings)
- Pro plan: 5GB total storage
- System warns at 80% capacity
- Auto-delete oldest recordings when limit reached (with user confirmation)

**FR20: Data Export (GDPR)**
- Users can request full data export (PDF + CSV bundle)
- Export includes: all clients, meetings, notes, action items, chat history
- Export generation time: <5 minutes
- Download link expires after 7 days

**FR21: Data Deletion**
- Users can delete individual clients/meetings
- "Delete Account" option removes all data within 30 days
- Hard delete from database (not soft delete for user data)
- Confirmation required for destructive actions

**FR22: Data Backup**
- System auto-backs up user data daily
- Point-in-time recovery within 30 days (admin function)
- Pro users can manually trigger backup (1x per week)

---

## Non-Functional Requirements

### Performance (NFR1-NFR4)

**NFR1: API Response Times**
- Client list load: <500ms
- Meeting summary generation: <60 seconds (1-hour meeting)
- AI Q&A response: <3 seconds
- Client research (web scraping): <30 seconds

**NFR2: Transcription Accuracy**
- Gladia transcription accuracy: >90% for clear audio
- Support for accents (US, UK, Indian English)
- Fallback to manual upload if transcription fails

**NFR3: Application Load Time**
- Initial page load: <2 seconds (on 10Mbps connection)
- Dashboard render: <1 second
- Lazy load meeting history (paginated, 20 items per page)

**NFR4: Scalability**
- Support 500 concurrent users on free tier infrastructure
- Database query time: <200ms for 95th percentile
- Vector search (RAG): <500ms for semantic queries

---

### Security & Privacy (NFR5-NFR9)

**NFR5: Data Encryption**
- Encryption at rest: AES-256 (Supabase handles)
- Encryption in transit: TLS 1.3 (HTTPS everywhere)
- Environment variables: never committed to git, use Vercel env vars

**NFR6: Authentication & Authorization**
- Clerk JWT validation on all protected routes
- Row-Level Security (RLS) enforced in Supabase
- Users can only access their own data (no cross-user leakage)
- Session timeout: 30 minutes of inactivity

**NFR7: AI Data Privacy**
- User data NEVER used for AI model training
- OpenAI API: zero_data_retention flag enabled
- 30-day retention window (then deleted from OpenAI)
- Sign Data Processing Agreement (DPA) with OpenAI

**NFR8: GDPR Compliance**
- Privacy policy clearly states data usage
- Cookie consent banner (if using analytics)
- Right to export data (FR20)
- Right to deletion (FR21)
- Data residency: multi-region (US, EU support)

**NFR9: Input Validation**
- All user inputs sanitized with `sanitize-html`
- Zod schema validation on API inputs
- File upload validation: type, size, malware scanning (ClamAV)
- Rate limiting: 100 requests/minute per user (Upstash Redis)

---

### Reliability (NFR10-NFR12)

**NFR10: Uptime & Availability**
- Target uptime: 99.5% (excluding planned maintenance)
- Planned maintenance: <2 hours/month, off-peak hours
- Health check endpoint: `/api/health` (monitored by UptimeRobot)

**NFR11: Error Handling**
- All errors logged to Sentry
- User-friendly error messages (no stack traces exposed)
- Graceful degradation: if AI fails, allow manual entry
- Circuit breaker pattern for external APIs (OpenAI, Gladia)

**NFR12: Data Integrity**
- Database transactions for multi-step operations
- Optimistic locking for concurrent edits
- Automatic retry for transient failures (3 attempts, exponential backoff)

---

### Usability (NFR13-NFR15)

**NFR13: User Experience**
- New users can add first client in <1 minute
- Dashboard loading state: skeleton screens (no blank pages)
- Inline help tooltips for complex features
- Keyboard shortcuts for power users (e.g., "C" to create client)

**NFR14: Mobile Responsiveness**
- Fully responsive design (mobile-first approach)
- Touch-friendly UI elements (min 44px tap targets)
- Mobile-optimized meeting assist panel
- Offline support: none (MVP requires internet)

**NFR15: Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly (ARIA labels)
- Color contrast ratio: 4.5:1 minimum

---

### Cost Efficiency (NFR16-NFR17)

**NFR16: Infrastructure Costs**
- Free tier infrastructure for 0-100 users (Supabase, Vercel, Clerk)
- Target cost: <$1/user/month at scale (500+ users)
- Monitor AI costs: alert if monthly OpenAI bill > $500

**NFR17: AI Cost Optimization**
- Use GPT-4o-mini (4x cheaper than GPT-4)
- Fallback to GPT-3.5-turbo if user exceeds quota
- Cache AI responses for repeated queries (Redis, 1-hour TTL)
- Limit free tier AI usage to prevent abuse

---

## Success Metrics

### Engagement Metrics
- **Daily Active Users (DAU):** 40%+ of paid users
- **Weekly Active Users (WAU):** 70%+ of paid users
- **Sessions per week:** 3+ (users prep before meetings)

### Retention Metrics
- **Free-to-Paid Conversion:** 3-5%
- **Monthly Churn:** <5%
- **90-Day Retention:** >60%

### Quality Metrics
- **AI Summary NPS:** >7/10 (users find summaries useful)
- **Overall NPS:** >50
- **Support tickets:** <2% of users/month

### Revenue Metrics
- **MRR Growth:** 20%+ month-over-month (first 6 months)
- **Average Revenue Per User (ARPU):** $29 (Pro plan)
- **Customer Acquisition Cost (CAC):** <$50 (organic + paid)
- **Lifetime Value (LTV):** >$300 (12+ month retention)

---

**Next:** [Technical Requirements →](./technical-requirements.md)
