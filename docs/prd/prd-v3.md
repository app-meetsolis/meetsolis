# MeetSolis Product Requirements Document (PRD)

**Version:** 3.0
**Date:** March 8, 2026
**Status:** Active Development - MVP Phase
**Previous Versions:** v1.0 (Video Conferencing), v2.0 (Generic Freelancers/Consultants) - See archive/

---

## 🎯 Product Vision

**MeetSolis is an AI-powered client memory and session intelligence tool built exclusively for executive coaches — helping them remember every client's context, track coaching progress, and walk into every session prepared.**

---

## 📋 Table of Contents

1. [Goals and Background Context](./goals-and-background-context.md)
2. [Requirements](./requirements.md)
3. [UI Design Principles](./ui-design-principles.md)
4. [UI Components & Pages](./ui-components.md)
5. [Pricing & Business Model](./pricing-business-model.md)
6. [Epic List](./epic-list.md)
   - [Epic 1: Foundation & Authentication Infrastructure](./epic-1-foundation-authentication-infrastructure.md) ✅ COMPLETE
   - [Epic 2: Client Card System & Management](./epic-2-client-card-system.md) 🔄 IN PROGRESS
   - [Epic 3: Meeting Memory & Logging](./epic-3-meeting-memory.md) 🔄 NEXT
   - [Epic 4: AI Intelligence & Automation](./epic-4-ai-intelligence.md) 🔄 PLANNED
   - [Epic 5: Advanced Features & Monetization](./epic-5-advanced-features-monetization.md) 🔄 PLANNED
7. [MVP Scope & Timeline](./mvp-scope-timeline.md)
8. [Non-Goals](./non-goals.md)

---

## 🚨 Version History

### v1.0 → v2.0 (January 5, 2026)

| Aspect | v1.0 | v2.0 |
|--------|------|------|
| Core Product | Custom video conferencing platform | Client memory & meeting assistant |
| Value Prop | "Zoom alternative with features" | "Never forget client context" |
| Video Strategy | Build custom WebRTC platform | Integrate with existing platforms |
| Tech Stack | Stream SDK, simple-peer, WebRTC | AI/RAG, transcription, Supabase |

**Why:** Users already trust Google Meet/Zoom. High risk asking them to switch. Low adoption for high-stakes calls.

### v2.0 → v3.0 (March 8, 2026)

| Aspect | v2.0 | v3.0 |
|--------|------|------|
| ICP | Generic freelancers, consultants, coaches | Executive coaches exclusively (solo, 10–25 clients) |
| Value Prop | "Never forget client context" | "AI memory for executive coaching" |
| Transcription | Gladia | Deepgram Nova-2 |
| AI Model | OpenAI GPT-4 | Claude Sonnet 4.5 |
| Pricing | $29/mo, $249/yr | $99/mo, $948/yr |
| Free Tier | 3 clients, 3 AI meetings/mo, 100 queries | 1 client, 3 transcripts lifetime, 50 queries lifetime |

**Why:** Narrow ICP = sharper positioning, better retention, premium pricing justified. Executive coaches have recurring 1:1 clients (10–25), need session memory acutely, and can afford $99/mo.

---

## 👤 Target User (ICP)

**Executive coaches (solo practitioners)**
- 10–25 active coaching clients
- Sessions: 1:1, 45–60 min, recurring (bi-weekly or monthly)
- Tools: Google Meet or Zoom (not changing this)
- Pain: Can't remember context across clients without heavy note-taking
- Budget: $99–$300/mo for productivity tools
- ICF-certified or pursuing certification

---

## 💰 Pricing

| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 1 client, 3 session transcripts (lifetime), 50 Solis queries (lifetime) |
| Pro | $99/mo or $948/yr | Unlimited clients, unlimited sessions, unlimited Solis queries |

---

## 🎯 11 MVP Features

1. **Client Card System** — Permanent memory hub per coaching client (goal, start date, session history)
2. **Session Transcript Upload** — Manual upload of coaching session transcripts/recordings
3. **Auto-Transcription (Deepgram)** — Upload audio → Deepgram Nova-2 → text
4. **AI Session Summary** — Claude Sonnet 4.5 generates summary, key topics, action items
5. **Session Timeline** — Reverse-chronological session history per client
6. **Action Item Tracking** — AI-extracted + manual; status: To Prepare / Promised / Done
7. **Solis AI Assistant** — RAG-powered Q&A over all client sessions ("What did I promise Sarah?")
8. **Usage Enforcement** — Free tier gates enforced on transcripts and Solis queries
9. **Stripe Billing** — Pro subscription ($99/mo, $948/yr) with upgrade flow
10. **5-Step Onboarding** — Tailored to executive coaches with sample coaching transcript
11. **Executive Coach Landing Page** — Positioned for ICF forums, coaching communities

---

## 🚫 Non-Goals (MVP)

- ❌ Custom video conferencing (never building this)
- ❌ Full CRM with pipelines/deals
- ❌ Auto-recording bots (post-MVP)
- ❌ Team/agency accounts (Year 2)
- ❌ Client-facing portal
- ❌ Calendar integration (Q2 2026)

---

## 🔧 Tech Stack (v3)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI |
| Backend | Vercel Edge Functions, Supabase PostgreSQL |
| Auth | Clerk |
| Transcription | Deepgram Nova-2 |
| AI | Claude Sonnet 4.5 (Anthropic) |
| Vector Search | Supabase pgvector (RAG) |
| Billing | Stripe |
| Email | Resend |
| Monitoring | Sentry |

**Removed from v1/v2:** Stream SDK, simple-peer, WebRTC, Gladia, OpenAI GPT-4, Excalidraw

---

## 📈 Success Metrics

**Primary:**
- Executive coaches return before every session (engagement)
- "I can't manage my clients without this" (retention)
- 50 signups + 10 paying by April 30, 2026 ($990+ MRR)

**Secondary:**
- 3–5% free-to-paid conversion
- <5% monthly churn
- NPS > 50

---

## 🗓️ Timeline

**March 10:** Internal testing + first beta coaches
**March 31:** Public launch — LinkedIn, ICF forums, Reddit r/coaching

See [MVP Scope & Timeline](./mvp-scope-timeline.md) for sprint breakdown.

---

**Last Updated:** March 8, 2026
**Document Owner:** Product Owner
**Status:** Active — MVP in development
