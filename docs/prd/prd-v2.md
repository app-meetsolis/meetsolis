# MeetSolis Product Requirements Document (PRD)

**Version:** 2.0 (Major Pivot)
**Date:** January 5, 2026
**Status:** Active Development - MVP Phase
**Previous Version:** 1.0 (Video Conferencing Platform) - See git history

---

## 🎯 Product Vision

**MeetSolis is an AI-powered client memory and meeting assistant that helps freelancers and small agencies prepare for meetings, remember client conversations, and maintain full client context—without changing how their clients meet.**

## 📋 Table of Contents

1. [Goals and Background Context](./goals-and-background-context.md)
2. [Requirements](./requirements.md)
3. [User Interface Design Goals](./user-interface-design-goals.md)
4. [Technical Requirements](./technical-requirements.md)
5. [Pricing & Business Model](./pricing-business-model.md)
6. [Epic List](./epic-list.md)
   - [Epic 1: Foundation & Authentication Infrastructure](./epic-1-foundation-authentication-infrastructure.md) ✅ COMPLETE
   - [Epic 2: Client Card System & Management](./epic-2-client-card-system.md) 🔄 NEW
   - [Epic 3: Meeting Memory & Logging](./epic-3-meeting-memory.md) 🔄 NEW
   - [Epic 4: AI Intelligence & Automation](./epic-4-ai-intelligence.md) 🔄 NEW
   - [Epic 5: Advanced Features & Monetization](./epic-5-advanced-features-monetization.md) 🔄 UPDATED
7. [MVP Scope & Timeline](./mvp-scope-timeline.md)
8. [Non-Goals](./non-goals.md)
9. [Success Metrics](./success-metrics.md)

---

## 🚨 Major Changes from v1.0

### What Changed?

| Aspect | v1.0 (Old) | v2.0 (New) |
|--------|------------|------------|
| **Core Product** | Custom video conferencing platform | Client memory & meeting assistant |
| **Value Prop** | "Zoom alternative with features" | "Never forget client context" |
| **Video Strategy** | Build custom WebRTC platform | Integrate with existing platforms |
| **Primary Feature** | HD video calling | Client card system with AI memory |
| **Target Use Case** | Replace Google Meet/Zoom | Work alongside existing tools |
| **Technical Focus** | WebRTC, Stream SDK, SFU infrastructure | AI/RAG, transcription, context intelligence |

### Why the Pivot?

**Problem with v1.0:**
- Users already trust Google Meet/Zoom
- High risk asking users to switch meeting tools
- Heavy technical complexity
- Low adoption for high-stakes client calls

**New Insight:**
Users don't want another meeting tool. They want **confidence, context, and memory** around meetings.

---

## 📊 Quick Reference

### Target Users
- Freelancers
- Consultants
- Coaches
- Small agency owners (2-10 person teams)
- **Client Volume:** 0-50 active clients per user

### Pricing (Updated)
- **Free:** $0 (3 clients, 3 AI meetings/month, 100 AI queries)
- **Pro:** $29/month (50 clients, 20 AI meetings/month, 1000 AI queries)
- **Annual:** $249/year (save $99 - equivalent to $20.75/month)

### MVP Timeline
**Target:** Complete MVP by end of January 2026 (this month)

### Tech Stack (Core Changes)
- ✅ **Keep:** Next.js 14, Supabase, Clerk, OpenAI, Vercel
- ❌ **Remove:** Stream SDK, simple-peer, Excalidraw (whiteboard)
- ➕ **Add:** Gladia (transcription), Supabase pgvector (RAG), meeting platform integrations

---

## 🎯 Core Features (New Direction)

### 1. Client Card System (Foundation)
Each client has a permanent memory hub storing:
- Overview (AI-generated or manual)
- Key information (company, role, social links)
- Meeting history
- Notes & decisions
- Action items
- Next steps guidance

### 2. Meeting Memory (Platform Agnostic)
- Manual meeting logging (Google Meet, Zoom, any platform)
- Upload transcripts/recordings
- AI-generated summaries
- Decision extraction
- Action item generation

### 3. Client Research & Prep
- Public website scraping (MVP)
- AI-generated client overview
- Meeting preparation brief
- Suggested talking points
- Context from past meetings

### 4. AI Assistant (RAG-Powered)
- Chat interface with full client context
- Answer questions: "What did I promise Client X?"
- Summarize past interactions
- Suggest next steps
- Private, user-specific data only

### 5. Private Meeting Assist Panel
- Contextual panel during meetings (not visible to client)
- Client summary
- Talking points
- Open action items
- Live note-taking

### 6. Action Items (Lightweight)
- AI-extracted from meetings
- Manual additions
- Due dates & priorities
- Status tracking (To Prepare, Promised, Done)

---

## 🚫 What We Are NOT Building

- ❌ Custom video conferencing
- ❌ Full CRM with pipelines/deals
- ❌ Enterprise workflow automation
- ❌ Heavy project management (Kanban, sprints)
- ❌ Team collaboration (MVP is single-user)
- ❌ Auto-recording bots (post-MVP feature)

---

## 📈 Success Metrics

**Primary:**
- Users return before every meeting (engagement)
- Users say "I can't manage clients without this" (retention)
- 200 paying users within 6 months ($5,800 MRR)

**Secondary:**
- 3-5% free-to-paid conversion
- <5% monthly churn
- NPS > 50

---

## 🗓️ Next Steps

1. ✅ PRD v2.0 created
2. 🔄 Rewrite affected epics (2-5)
3. 🔄 Create architecture v2.0
4. 🔄 Database schema migration plan
5. 🔄 Archive Epic 2 video code
6. 🔄 Begin Epic 2 (Client Cards) implementation

---

**Last Updated:** January 5, 2026
**Document Owner:** Product Owner (Sarah)
**Status:** Active - Ready for development
