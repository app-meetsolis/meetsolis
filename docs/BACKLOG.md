# MeetSolis Backlog

**Version:** 3.0
**Last Updated:** March 8, 2026
**Sprint Target:** March 31, 2026 (MVP Launch)

---

## Completed Stories

### Epic 1: Foundation & Authentication Infrastructure ✅ Complete

| Story | Title | Status |
|-------|-------|--------|
| 1.0 | External Service Setup & Risk Mitigation | ✅ Done |
| 1.1 | Project Setup and Development Environment | ✅ Done |
| 1.2 | Security Headers and Basic Protection | ✅ Done |
| 1.3 | User Authentication with Clerk Integration | ✅ Done |
| 1.4 | Supabase Database Schema and RLS | ✅ Done |
| 1.5 | Basic Dashboard with Meeting Management | ✅ Done |
| 1.6 | Basic Analytics and Monitoring Setup | ✅ Done |
| 1.7 | Landing Page with Professional Design | ✅ Done (v1 — will be replaced by Story 5.6) |
| 1.8 | User Onboarding & Experience | ✅ Done (v1 — will be replaced by Story 5.5) |
| 1.9 | Validation Improvements | ✅ Done |

### Epic 2: Client Card System ✅ Partially Complete

| Story | Title | Status | Notes |
|-------|-------|--------|-------|
| 2.1 | Client CRUD & Database Schema | ✅ Done | ⚠️ Schema updated by migration 015 (goal, start_date added; phone/email/linkedin/tags dropped) |
| 2.2 | Client Dashboard UI (Grid View) | ✅ Done | ⚠️ Top nav → sidebar refactor in Story 2.9 |
| 2.3 | Add/Edit Client Modal | ✅ Done | ⚠️ Form fields changed by ClientForm v3 update |
| 2.4 | Client Search & Filter | ✅ Done | ⚠️ Tag filter removed in v3 |
| 2.5 | Client Tags & Labels | ✅ Done | ❌ DEPRECATED in v3 — tags removed from product per ICP pivot. Code disabled. |

---

## Active Backlog (Ordered by Priority)

### Sprint 1: Finish Epic 2 (Client Card Updates)

| Story | Title | Priority | Effort | Dependencies |
|-------|-------|----------|--------|--------------|
| **2.6** | Client Detail View (v3 — Session Timeline) | P0 | 1.5 days | 2.1 done, 3.1 in progress |
| **2.7** | Manual Notes (Rich Text) | P1 | 1 day | 2.6 |
| **2.8** | Client Deletion & Cascading | P0 | 0.5 days | 2.1 done |
| **2.9** | Navigation Refactor (Left Sidebar) | P0 | 1 day | 1.5 done |

**Sprint 1 prerequisite:** Run migration 015 in Supabase (sessions, action_items, solis_queries, usage_tracking, subscriptions tables).

---

### Sprint 2: Epic 3 — Session Memory (Week 2: March 8–14)

| Story | Title | Priority | Effort | Dependencies |
|-------|-------|----------|--------|--------------|
| **3.1** | Session DB Schema & API | P0 | 0.5 days | Migration 015 |
| **3.2** | Manual Transcript Upload | P0 | 1 day | 3.1 |
| **3.3** | Auto-Transcription (Deepgram) | P0 | 1 day | 3.1 |
| **3.4** | AI Summary Generation | P0 | 1 day | 3.2 or 3.3 |
| **3.5** | Session Timeline UI | ✅ Done | — | — |
| **3.6** | Action Item Tracking UI | P0 | 0.5 days | 3.4, 3.5 |

**Sprint 2 total:** ~5 days

---

### Sprint 3: Epic 4 — Solis Intelligence (Week 3: March 15–21)

| Story | Title | Priority | Effort | Dependencies |
|-------|-------|----------|--------|--------------|
| **4.1** | Embeddings & Vector Index | P0 | 0.5 days | 3.4 (summaries exist) |
| **4.2** | Solis Q&A API — Hybrid RAG | P0 | 1.5 days | 4.1 |
| **4.3** | Solis UI | P0 | 1 day | 4.2 |
| **4.4** | Usage Enforcement | P0 | 0.5 days | 4.2 |

**Sprint 3 total:** ~3.5 days

---

### Sprint 4: Epic 5 — Billing & Launch (Week 3–4: March 15–31)

| Story | Title | Priority | Effort | Dependencies |
|-------|-------|----------|--------|--------------|
| **5.1** | Stripe Integration ($99/mo, $948/yr) | P0 | 1 day | 4.4 (usage tracking exists) |
| **5.2** | Tier Enforcement Middleware | P0 | 0.5 days | 5.1 |
| **5.3** | Pricing Page ($99/$948) | P1 | 0.5 days | — |
| **5.4** | Settings Page (Profile & Billing) | P1 | 1 day | 5.1 |
| **5.5** | Onboarding Flow (5-step rewrite) | P0 | 1 day | 3.4, 4.2 |
| **5.6** | Landing Page (Executive Coach Positioning) | P0 | 1 day | — |
| **5.7** | Upgrade Prompts & Upsell Modals | P0 | 0.5 days | 4.4 |
| **5.8** | Email Notifications (Transactional) | P2 | 0.5 days | 5.1 |
| **5.9** | Data Export (GDPR Compliance) | P1 | 1 day | — |
| **5.10** | Account Deletion (GDPR Right to Erasure) | P1 | 0.5 days | — |
| **5.11** | Performance Optimization & Polish | P1 | 1 day | All features done |
| **5.12** | Error Tracking & Monitoring | P1 | 0.5 days | — |
| **5.13** | Launch Checklist & Production Deploy | P0 | 1 day | All stories done |

**Sprint 4 total:** ~9.5 days

---

## Technical Debt

| ID | Issue | Introduced | Priority | Effort |
|----|-------|------------|----------|--------|
| TECH-001 | Jest test failures — OpenAI runtime shim crashes in Node.js | Story 3.4 | Medium | 1–2h |

### TECH-001 Detail
**Symptom:** 40 of 84 test suites fail. `openai/_shims/web-runtime.ts` initializes browser APIs on import; Jest/Node has no browser runtime.
**Impact:** 667/872 tests still pass. Production unaffected.
**Fix:** Add `jest.mock('openai', () => ({ OpenAI: jest.fn() }))` in `jest.setup.js` or per affected test file.
**Files:** `jest.setup.js`, any test importing `summarize-session.ts` / `openai-ai-service.ts`

---

## Story Naming Convention

- Main stories: `2.6`, `3.1`, `4.2`, etc. (epic.story)
- Technical debt: Use decimal sub-numbers in `docs/backlog/` subfolder (e.g., `2.6.1`)
- Story files: `docs/stories/[story-number].story.md`

---

## Definition of Done (All Stories)

- [ ] Feature implemented per Acceptance Criteria
- [ ] API routes return correct status codes and error formats
- [ ] RLS enforced — no cross-user data access
- [ ] Mobile responsive
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Tested manually (happy path + error states)

---

## Launch Target: March 31, 2026

**Soft launch March 10:** Internal testing + first beta coaches
**Hard launch March 31:** Public announcement — LinkedIn, ICF forums, Reddit r/coaching
**Goal:** 50+ signups, 10+ paying customers ($990+ MRR) by April 30

---

## Post-MVP Backlog (Q2 2026+)

| Feature | Quarter |
|---------|---------|
| Calendar integration (Google Cal, Calendly) | Q2 2026 |
| Zoom/Google Meet auto-import | Q2 2026 |
| ICF-compliant PDF export | Q2 2026 |
| Action item due dates + reminders | Q2 2026 |
| Cross-client action item dashboard | Q3 2026 |
| Client tagging (v2) | Q3 2026 |
| Enhanced transcription providers | Q3 2026 |
| Mobile native app | Year 2 |
| Team/agency accounts | Year 2 |
| Client-facing portal | Year 2 |
