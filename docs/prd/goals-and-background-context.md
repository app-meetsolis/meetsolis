# Goals and Background Context

**Version:** 2.0 (Major Pivot)
**Last Updated:** January 5, 2026
**Previous Version:** 1.1 (Video Conferencing) - See git history

---

## 🎯 Product Vision

**MeetSolis is an AI-powered client memory and meeting assistant that helps professionals prepare for meetings, remember conversations, and maintain full client context—without changing how their clients meet.**

---

## 📖 Background & Evolution

### Original Vision (v1.0 - December 2025)

MeetSolis began as a **custom video conferencing platform**—a Zoom alternative with built-in collaboration tools:
- Native video calling (WebRTC/Stream SDK)
- Collaborative whiteboard
- AI meeting summaries
- Real-time translation
- Professional features for freelancers

**Status:** Epic 1 complete (auth, infrastructure), Epic 2 partial (5/7 stories - video platform functional)

### The Pivot (v2.0 - January 2026)

**What we learned:**
1. Users already trust Google Meet/Zoom for client calls
2. Switching meeting platforms = **high friction, low adoption**
3. Real pain point ≠ video quality, it's **forgetting client context**
4. Building custom video = **heavy lift, commodity feature**

**New insight:**
> Users don't want another meeting tool. They want **confidence and memory** around meetings.

### Strategic Shift

| Old Thinking (v1.0) | New Thinking (v2.0) |
|---------------------|---------------------|
| Meetings are the product | **Client memory is the product** |
| Replace Google Meet | **Work alongside Google Meet** |
| Video + features | **Context + intelligence** |
| Heavy infrastructure | **Lightweight assistant** |
| Build everything | **Integrate smartly** |

---

## 🎯 Goals

### Business Goals

**Primary:**
- Achieve **$5,800 MRR** within 6 months (200 paying users @ $29/mo)
- Validate product-market fit with **3-5% free-to-paid conversion**
- Build sustainable SaaS with **<5% monthly churn**

**Secondary:**
- Launch MVP by **end of January 2026** (this month)
- Achieve **NPS > 50** (strong user love)
- Establish foundation for $10K+ MRR by month 12

### Product Goals

**Core Value Delivery:**
1. **Never forget client context** - Users always prepared
2. **Reduce pre-meeting anxiety** - AI provides talking points, history
3. **Capture meeting value** - Auto-generate summaries, action items
4. **Build client knowledge over time** - Every interaction improves AI

**User Experience:**
- **Invisible to clients** - Works behind the scenes
- **Zero workflow change** - Use existing meeting tools
- **Instant value** - Useful from first client added
- **Privacy-first** - User owns their data, never shared

### Technical Goals

**MVP (Month 1):**
- Client card CRUD with AI-generated overviews
- Manual meeting logging with transcript upload
- AI summaries and action item extraction
- Basic AI assistant (RAG Q&A)
- Free + Pro tier with Stripe billing

**Post-MVP (Months 2-6):**
- Meeting bot integration (auto-transcription)
- Calendar sync (Google Calendar, Outlook)
- Advanced client research (LinkedIn API, Apollo.io)
- Meeting prep automation (pre-meeting triggers)
- Team collaboration features
- Mobile app

---

## 🎭 Target Audience

### Primary Users

**Freelance Consultants**
- **Problem:** Juggling 10-30 clients, forgetting past promises
- **Use Case:** Prep before calls, remember project history
- **Willingness to Pay:** High ($29/mo justified by lost time)

**Coaches & Trainers**
- **Problem:** Back-to-back sessions, context switching
- **Use Case:** Remember client goals, track progress
- **Willingness to Pay:** Medium-High (productivity tool)

**Small Agency Owners**
- **Problem:** Managing 20-50 clients across team
- **Use Case:** Centralize client knowledge, onboard team
- **Willingness to Pay:** Very High (team efficiency)

### User Characteristics

- **Client Volume:** 0-50 active clients per user
- **Meeting Frequency:** 5-30 meetings/month
- **Tech Savviness:** Comfortable with SaaS tools
- **Current Tools:** Google Meet/Zoom, scattered notes (Notion, Google Docs, Evernote)
- **Pain:** Memory overload, unprofessional moments ("remind me what we discussed last time?")

### Exclusions (Not Target Users)

- ❌ Enterprise teams (100+ employees)
- ❌ Sales teams with full CRM needs (Salesforce, HubSpot)
- ❌ One-off meeting users (not managing ongoing relationships)
- ❌ Users who need custom video features (screen annotation, recording studio)

---

## 💡 Core Problem Statement

### The Problem

**Professionals managing multiple clients struggle with:**

1. **Forgetting past context**
   - "What did we agree on last call?"
   - "Did I send them that document?"
   - Embarrassing moments: "Remind me, what's your company called again?"

2. **Scattered information**
   - Notes in 5 different apps (Notion, Google Docs, Email, Slack)
   - Meeting recordings buried in Google Drive
   - Action items lost in email threads

3. **Pre-meeting stress**
   - Scrambling to review past notes 5 minutes before call
   - No structured prep workflow
   - Walking into meetings unprepared

4. **Post-meeting chaos**
   - Manually writing summaries takes 15-30 minutes
   - Forgetting to extract action items
   - No system for tracking promises

5. **Mental load**
   - Anxiety about forgetting something important
   - Cognitive overload managing 10-50 clients
   - Professionalism at risk

### Current Alternatives (Inadequate)

**Manual Note-Taking:**
- ❌ Time-consuming (30+ min/meeting)
- ❌ Inconsistent format
- ❌ Hard to search later

**Generic CRMs (Salesforce, HubSpot):**
- ❌ Overkill for freelancers
- ❌ Expensive ($50-100/mo)
- ❌ Built for sales pipelines, not ongoing relationships

**Meeting Transcription Tools (Otter.ai, Fireflies):**
- ❌ Just transcription, no client context
- ❌ No prep intelligence
- ❌ No action item tracking

**Notion/Docs:**
- ❌ Manual organization required
- ❌ No AI assistance
- ❌ Separate from meeting workflow

---

## 🏆 MeetSolis Solution

### How We Solve It

**Before Meeting:**
- Client card shows full history at a glance
- AI generates talking points from past meetings
- Prep panel with key decisions, open action items

**During Meeting:**
- Private assist panel (client never sees)
- Live note-taking with context
- Real-time access to past promises

**After Meeting:**
- Upload recording → AI generates summary
- Auto-extract action items
- Update client card automatically

### Unique Value Proposition

> **"Your AI memory for every client relationship—works with any meeting tool, remembers everything, so you don't have to."**

**What makes MeetSolis different:**
1. **Client-first, not meeting-first** - Organized around people, not events
2. **Works with existing tools** - No asking clients to switch platforms
3. **AI that knows your clients** - Context-aware, not generic
4. **Private by design** - Your data, your AI, never shared
5. **Lightweight** - Add clients in seconds, prep in one click

---

## 📊 Market Opportunity

### Market Size

**TAM (Total Addressable Market):**
- Freelancers in US/EU: ~60M
- Subset managing 5+ clients: ~20M
- Willing to pay $29/mo: ~2M ($60M+ market)

**SAM (Serviceable Addressable Market):**
- English-speaking freelance consultants/coaches: ~500K
- Realistic penetration (1%): 5,000 users
- Revenue potential: $1.7M ARR

**SOM (Serviceable Obtainable Market - Year 1):**
- Target: 200 paying users
- Revenue: $69,600 ARR ($5,800 MRR)

### Competition Analysis

| Competitor | Type | Price | Gaps |
|------------|------|-------|------|
| **Otter.ai** | Transcription | $17/mo | No client context, no prep |
| **Fireflies.ai** | Meeting notes | $10/mo | No client cards, CRM-lite only |
| **Folk CRM** | Simple CRM | $20/mo | No meeting intelligence, manual entry |
| **Notion AI** | Workspace | $10/mo add-on | Not meeting-specific, requires setup |
| **Grain** | Meeting clips | $19/mo | Video-focused, no client memory |

**MeetSolis Differentiation:**
- ✅ Client cards as central organizing principle
- ✅ Pre-meeting prep intelligence (proactive)
- ✅ Works with any meeting platform
- ✅ RAG-powered AI with full client context
- ✅ Action item tracking built-in

---

## 🎯 Success Criteria

### Must Achieve (MVP)

- ✅ Users can add clients in <30 seconds
- ✅ Users can log meetings manually and upload transcripts
- ✅ AI generates useful summaries (NPS for AI quality > 7/10)
- ✅ Users return to app before every meeting (engagement metric)
- ✅ Free users convert to paid at 3%+ rate

### Nice to Have (Post-MVP)

- Auto-transcription via bot (reduces friction)
- Calendar integration (auto-populate upcoming meetings)
- Client research automation (enrich profiles)
- Team collaboration (share client context)

---

## 🚨 Risks & Mitigation

### Key Risks

**1. AI quality not good enough**
- **Risk:** Summaries are generic, not actionable
- **Mitigation:** Use GPT-4o-mini (high quality), allow manual edits, collect feedback

**2. Manual upload friction too high**
- **Risk:** Users don't upload recordings (low engagement)
- **Mitigation:** Make upload dead simple, add bot post-MVP, show value immediately

**3. Pricing too high**
- **Risk:** $29/mo doesn't convert
- **Mitigation:** Free tier for trial, annual discount, testimonials

**4. Competitors copy fast**
- **Risk:** Otter/Fireflies add client cards
- **Mitigation:** Speed to market (MVP this month), tight user feedback loop

**5. Privacy concerns**
- **Risk:** Users worried about AI accessing client data
- **Mitigation:** Clear privacy policy, no training on user data, GDPR compliance

---

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-01-05 | 2.0 | Major pivot to client memory assistant | PO Agent (Sarah) |
| 2025-01-19 | 1.1 | Updated target audience to include small-medium agencies | PM Agent |
| 2025-12-01 | 1.0 | Initial PRD for video conferencing platform | PM Agent |

---

**Next:** [Requirements →](./requirements.md)
