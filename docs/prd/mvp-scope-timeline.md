# MVP Scope & Timeline

**Version:** 2.0
**Last Updated:** January 5, 2026
**MVP Target:** End of January 2026 (25 days remaining)

---

## MVP Definition

**Minimum Viable Product (MVP)** = The smallest feature set that delivers core value and validates product-market fit.

**Core Value:**
> "Users can manage clients, log meetings, get AI summaries, and prepare for future meetings—all without changing their existing meeting tools."

---

## MVP Feature Scope

### ✅ Phase 1: MVP (Launch by Jan 31, 2026)

| Feature Category | Features Included | Features Excluded (Post-MVP) |
|------------------|-------------------|------------------------------|
| **Client Management** | - Create/edit/delete clients<br>- Client cards (name, company, website)<br>- Manual info entry<br>- Basic search & filter<br>- 3 tags per client | - LinkedIn scraping<br>- Apollo.io enrichment<br>- Bulk import<br>- Custom fields |
| **Meeting Memory** | - Manual meeting logging<br>- Upload transcripts (TXT, SRT)<br>- Upload recordings (MP3, MP4)<br>- Manual notes entry<br>- Meeting history (chronological) | - Meeting bot (auto-transcription)<br>- Calendar sync<br>- Auto-create meeting links<br>- Real-time transcription |
| **AI Features** | - AI summaries (Gladia + GPT-4o-mini)<br>- Action item extraction<br>- Basic AI assistant (RAG Q&A)<br>- Meeting prep brief<br>- Public website scraping | - Client research (LinkedIn)<br>- Advanced talking points<br>- Sentiment analysis<br>- Auto-suggestions |
| **UI/UX** | - Dashboard (client list)<br>- Client card detail view<br>- Meeting log form<br>- AI assistant chat<br>- Simple onboarding (3 steps)<br>- Mobile responsive | - Advanced dashboard widgets<br>- Keyboard shortcuts<br>- Drag-and-drop UI<br>- Dark mode<br>- Customizable themes |
| **Auth & Billing** | - Clerk auth (sign-up/login)<br>- Free tier (3 clients, 3 AI meetings)<br>- Pro tier ($29/mo or $249/yr)<br>- Stripe integration<br>- Usage tracking | - Team plans<br>- Enterprise SSO<br>- Custom billing cycles<br>- Invoicing |

---

## Development Timeline (25 Days)

### Week 1 (Jan 6-12): Foundation & Database

**Goal:** Set up new data model, archive old code

| Day | Tasks | Owner | Status |
|-----|-------|-------|--------|
| **Mon Jan 6** | - Archive Epic 2 code (move to `/archive`)<br>- Database schema design (clients, meetings, embeddings)<br>- Migration scripts (drop old tables, create new) | Dev | 🔄 |
| **Tue Jan 7** | - Run migrations (dev environment)<br>- Set up Supabase pgvector extension<br>- Create RLS policies for new tables | Dev | 🔄 |
| **Wed Jan 8** | - Client API routes (`/api/clients` CRUD)<br>- Meeting API routes (`/api/meetings` CRUD)<br>- Action items API routes (`/api/action-items`) | Dev | 🔄 |
| **Thu Jan 9** | - Set up Gladia API integration<br>- Test transcription (upload MP3 → get transcript)<br>- Error handling for failed transcriptions | Dev | 🔄 |
| **Fri Jan 10** | - Set up OpenAI API (GPT-4o-mini)<br>- AI summary generation (transcript → summary)<br>- Action item extraction (transcript → tasks) | Dev | 🔄 |
| **Sat-Sun** | Buffer / catch-up | - | - |

---

### Week 2 (Jan 13-19): Core UI & Client Cards

**Goal:** Build client management interface

| Day | Tasks | Owner | Status |
|-----|-------|-------|--------|
| **Mon Jan 13** | - Dashboard layout (new design from reference images)<br>- Client list component<br>- Add client modal | Dev | 🔄 |
| **Tue Jan 14** | - Client card detail view<br>- Edit client form<br>- Delete client (with confirmation) | Dev | 🔄 |
| **Wed Jan 15** | - Client search & filter<br>- Tag management<br>- Client card sections (Overview, Meetings, Notes, Actions) | Dev | 🔄 |
| **Thu Jan 16** | - Public website scraping (Puppeteer)<br>- AI client overview generation<br>- "Research" button integration | Dev | 🔄 |
| **Fri Jan 17** | - Client management testing<br>- Bug fixes<br>- UI polish | Dev | 🔄 |
| **Sat-Sun** | Buffer / catch-up | - | - |

---

### Week 3 (Jan 20-26): Meetings & AI

**Goal:** Meeting logging, summaries, AI assistant

| Day | Tasks | Owner | Status |
|-----|-------|-------|--------|
| **Mon Jan 20** | - Meeting log form (date, client, notes)<br>- File upload (transcript, recording)<br>- Meeting detail view | Dev | 🔄 |
| **Tue Jan 21** | - Integrate Gladia (upload → transcribe → store)<br>- AI summary generation flow<br>- Action item extraction flow | Dev | 🔄 |
| **Wed Jan 22** | - RAG setup (embed transcripts with pgvector)<br>- AI assistant chat UI<br>- Q&A endpoint (`/api/assistant/chat`) | Dev | 🔄 |
| **Thu Jan 23** | - Meeting prep feature ("Prepare" button)<br>- Prep brief generation (past context → talking points)<br>- Private assist panel (basic version) | Dev | 🔄 |
| **Fri Jan 24** | - Action items UI (list, add, edit, mark done)<br>- Due dates & status tracking<br>- Link action items to meetings | Dev | 🔄 |
| **Sat-Sun** | Buffer / catch-up | - | - |

---

### Week 4 (Jan 27-31): Billing, Testing, Launch

**Goal:** Stripe integration, testing, MVP launch

| Day | Tasks | Owner | Status |
|-----|-------|-------|--------|
| **Mon Jan 27** | - Stripe integration (checkout, webhooks)<br>- Free vs Pro tier enforcement<br>- Usage tracking (meetings, queries) | Dev | 🔄 |
| **Tue Jan 28** | - Onboarding flow (new design, 3 steps)<br>- Pricing page<br>- Settings page (profile, billing) | Dev | 🔄 |
| **Wed Jan 29** | - End-to-end testing (user flows)<br>- Bug fixes<br>- Performance optimization | Dev + QA | 🔄 |
| **Thu Jan 30** | - Deploy to production (Vercel)<br>- Smoke testing<br>- Final bug fixes | Dev | 🔄 |
| **Fri Jan 31** | - **MVP LAUNCH** 🚀<br>- Soft launch (friends & family)<br>- Monitor errors (Sentry) | All | 🔄 |

---

## MVP Success Criteria

### Technical Criteria (Must Pass Before Launch)

- [ ] **All core user flows work end-to-end:**
  - [ ] Sign up → Add client → Log meeting → View summary
  - [ ] Upload recording → AI transcription → Action items extracted
  - [ ] Ask AI question → Get relevant answer
  - [ ] Prepare for meeting → See past context
- [ ] **Free vs Pro tier limits enforced correctly**
- [ ] **No critical bugs** (P0/P1 issues resolved)
- [ ] **Performance acceptable:**
  - [ ] Dashboard loads <2 seconds
  - [ ] AI summary generates <60 seconds
  - [ ] AI Q&A responds <3 seconds
- [ ] **Security hardened:**
  - [ ] RLS policies tested
  - [ ] No data leakage between users
  - [ ] Input validation on all forms

### Business Criteria (Validate Post-Launch)

- [ ] **10+ beta users signed up** (friends & family)
- [ ] **5+ users upgrade to Pro** (validate pricing)
- [ ] **NPS > 7/10** (users find it valuable)
- [ ] **No major usability blockers** (users can complete tasks)

---

## Assumptions & Risks

### Assumptions

1. **Epic 1 code is stable** (auth, database, infrastructure work)
2. **Dashboard redesign can reuse existing UI components** (Shadcn)
3. **Gladia transcription accuracy is good enough** (>90%)
4. **Supabase pgvector can handle MVP scale** (<100 users)
5. **OpenAI API costs stay predictable** (<$100/month MVP phase)

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Timeline too aggressive (25 days)** | High | Medium | - Cut non-essential features<br>- Extend to mid-Feb if needed<br>- Prioritize core flows |
| **Gladia transcription quality issues** | Medium | Low | - Fallback: manual transcript upload<br>- Test with multiple audio samples<br>- Allow user to edit transcripts |
| **RAG (pgvector) performance slow** | Medium | Low | - Cache common queries<br>- Limit free tier usage<br>- Optimize vector search |
| **User adoption low** | High | Medium | - Free tier reduces friction<br>- Target early adopters directly<br>- Iterate based on feedback |
| **AI costs exceed budget** | Medium | Low | - Monitor usage daily<br>- Implement hard limits<br>- Use GPT-3.5-turbo fallback |

---

## Post-MVP Roadmap (Feb-Jun 2026)

### Phase 2: Intelligence Enhancements (Feb-Mar)

**Goal:** Reduce friction, improve AI quality

- [ ] Meeting bot integration (Fireflies.ai or custom)
- [ ] Calendar sync (Google Calendar, Outlook)
- [ ] Auto-create meeting links (OAuth with Google Meet/Zoom)
- [ ] LinkedIn scraping (via Apollo.io API)
- [ ] Improved talking points (more context-aware)
- [ ] Sentiment analysis in summaries

**Target:** 50 paying users, $1,450 MRR

---

### Phase 3: Advanced Features (Apr-May)

**Goal:** Power user features, team plans

- [ ] Team collaboration (share client cards)
- [ ] Advanced dashboard (widgets, metrics)
- [ ] Keyboard shortcuts
- [ ] Dark mode
- [ ] Mobile app (React Native or PWA)
- [ ] Export data (PDF, CSV)
- [ ] Integrations (Notion, Trello, Zapier)

**Target:** 100 paying users, $2,900 MRR

---

### Phase 4: Monetization & Scale (Jun 2026)

**Goal:** Hit revenue targets, prepare for scale

- [ ] Team plans ($49/mo for 3 users)
- [ ] Add-on marketplace (extra features)
- [ ] API access for developers
- [ ] White-label licensing for agencies
- [ ] SEO optimization (rank for keywords)
- [ ] Paid advertising (Google, LinkedIn)

**Target:** 200 paying users, $5,800 MRR (Goal achieved!)

---

## Development Best Practices

### Code Quality

- [ ] **TypeScript strict mode** throughout
- [ ] **Zod validation** on all API inputs
- [ ] **Error boundaries** on React components
- [ ] **Loading states** everywhere (no blank screens)
- [ ] **Responsive design** (mobile-first)

### Testing

- [ ] **Unit tests** for critical functions (AI extraction, summarization)
- [ ] **API tests** for all endpoints
- [ ] **E2E tests** for core user flows (Playwright)
- [ ] **Manual testing** before each deployment

### Deployment

- [ ] **Staging environment** for pre-production testing
- [ ] **Feature flags** for gradual rollout (PostHog)
- [ ] **Monitoring** (Sentry for errors, Vercel Analytics for performance)
- [ ] **Rollback plan** (can revert deployment in <5 min)

---

## Launch Checklist

### Pre-Launch (Jan 29-30)

- [ ] All core user flows tested and working
- [ ] Stripe webhooks tested (subscription created, canceled, payment failed)
- [ ] Free vs Pro tier limits enforced correctly
- [ ] Onboarding flow smooth (users can sign up in <2 min)
- [ ] Pricing page clear and compelling
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (PostHog, Vercel)
- [ ] Email templates ready (welcome, upgrade prompt, receipt)

### Launch Day (Jan 31)

- [ ] Deploy to production (Vercel)
- [ ] Smoke testing (sign up, add client, log meeting)
- [ ] Send invites to beta users (friends & family)
- [ ] Monitor Sentry for errors
- [ ] Monitor Vercel for performance issues
- [ ] Be ready to fix critical bugs immediately

### Post-Launch (Feb 1-7)

- [ ] Collect user feedback (surveys, interviews)
- [ ] Fix bugs based on feedback
- [ ] Optimize onboarding (reduce drop-off)
- [ ] Prepare for public launch (Product Hunt, social media)

---

**Next:** [Non-Goals →](./non-goals.md)
