# Non-Goals

**Version:** 2.0
**Last Updated:** January 5, 2026

---

## What We Are NOT Building

This document clarifies what MeetSolis is **NOT** to prevent scope creep and maintain focus on core value.

---

## ❌ NOT a Video Conferencing Platform

### What This Means

**We will NOT build:**
- Custom video calling infrastructure
- WebRTC peer-to-peer connections
- Screen sharing technology
- Virtual backgrounds or filters
- Meeting recording infrastructure
- Whiteboard collaboration tools
- In-meeting chat systems
- Waiting rooms or meeting controls
- Video quality optimization
- Audio processing (noise cancellation, echo reduction)

**Why:**
- Users already trust Google Meet, Zoom, Microsoft Teams
- High friction to switch meeting platforms
- Massive technical complexity (SFU infrastructure, TURN servers)
- Commodity feature with low differentiation
- Not the core problem we're solving

**What we DO instead:**
- Integrate with existing platforms (Google Meet, Zoom)
- Allow users to paste meeting links
- Provide auto-create links via OAuth (Post-MVP)
- Focus on BEFORE and AFTER meeting intelligence

---

## ❌ NOT a Full-Featured CRM

### What This Means

**We will NOT build:**
- Sales pipelines with stages (Lead → Qualified → Proposal → Closed)
- Deal tracking with revenue forecasting
- Email campaigns or bulk emailing
- Lead scoring or qualification workflows
- Opportunity management
- Sales team dashboards
- Territory management
- Commission tracking
- Contract management
- Customer onboarding workflows (for SaaS companies)

**Why:**
- CRMs (Salesforce, HubSpot, Pipedrive) solve a different problem
- Target users (freelancers, consultants) don't need sales pipelines
- They need **ongoing relationship management**, not deal flow
- CRM feature bloat = complexity users don't want

**What we DO instead:**
- Client cards for ongoing relationships (not deals)
- Meeting history and context (not sales stages)
- Action item tracking (not opportunity tracking)
- Lightweight, relationship-focused data model

---

## ❌ NOT Heavy Project Management

### What This Means

**We will NOT build:**
- Kanban boards (like Trello, Asana)
- Gantt charts or timelines
- Sprint planning tools
- Agile workflow management
- Task dependencies
- Time tracking or billing integration
- Resource allocation
- Burndown charts
- Project templates
- Multi-project dashboards

**Why:**
- Project management tools (Asana, Jira, Monday.com) already exist
- Target users need **meeting-specific action items**, not full PM
- Scope creep risk (PM tools are massive undertakings)
- Not differentiating value

**What we DO instead:**
- Lightweight action items extracted from meetings
- Status tracking (To Prepare, Promised, Done)
- Due dates and basic prioritization
- Link action items to meetings and clients
- Focus on promises made in meetings, not project plans

---

## ❌ NOT Enterprise Collaboration

### What This Means

**We will NOT build (MVP):**
- Team workspaces with shared access
- Permissions and role management
- Audit logs for compliance
- SSO (Single Sign-On) integration
- SCIM provisioning
- Multi-tenancy with org structures
- Admin dashboards for team leads
- Usage analytics per team member
- Centralized billing for teams

**Why:**
- MVP targets individual freelancers/consultants (single-user)
- Enterprise features = complexity + compliance burden
- Need to validate individual user PMF first
- Enterprise sales cycle is long (6-12 months)

**What we DO instead:**
- Single-user accounts (MVP)
- Simple Pro tier ($29/mo per user)
- Add team plans Post-MVP (Phase 3)
- Focus on individual productivity first

---

## ❌ NOT Auto-Recording Bots (MVP)

### What This Means

**We will NOT build in MVP:**
- Meeting bots that auto-join calls
- Real-time transcription during meetings
- Auto-recording without user action
- Live captions or subtitles
- Meeting analytics during calls
- Auto-sharing summaries to attendees

**Why:**
- High technical complexity (OAuth, meeting APIs, bot infrastructure)
- Privacy concerns (clients may not want bot recording)
- Delays MVP launch by 4-6 weeks
- Manual upload is sufficient for validation

**What we DO instead (MVP):**
- Manual transcript/recording uploads
- Post-meeting AI processing
- User controls when to transcribe
- Add auto-bot Post-MVP (Phase 2)

---

## ❌ NOT AI-Powered Automation Platform

### What This Means

**We will NOT build:**
- Zapier-style workflow automation
- "If this, then that" logic builders
- Auto-send emails to clients
- Auto-schedule meetings
- AI agents that act on behalf of users
- Auto-create tasks in other tools
- Auto-post to Slack/Teams
- AI-generated client responses

**Why:**
- Automation = complexity + edge cases
- Users want **intelligence**, not full automation
- Risk of AI making mistakes on user's behalf
- Not core to meeting memory/prep value

**What we DO instead:**
- AI suggestions (user approves before action)
- Manual triggers for AI features (user in control)
- Integrations read data (don't auto-act)
- Focus on intelligence, not automation

---

## ❌ NOT Social Networking or Collaboration Hub

### What This Means

**We will NOT build:**
- Client-facing portals (where clients log in)
- Shared workspaces with clients
- Real-time collaboration on documents
- Social feeds or activity streams
- @mentions or threaded discussions
- Client communities or forums
- Public profiles for users

**Why:**
- Client portal = different product (like client.io)
- Adds complexity (client logins, permissions)
- Not solving core problem (memory for user)
- Scope creep risk

**What we DO instead:**
- User-private data (clients never see app)
- User-centric intelligence (all data for user, not shared)
- Export data to share with clients (PDF, CSV)
- Focus on user's memory, not client access

---

## ❌ NOT Industry-Specific Solutions

### What This Means

**We will NOT build:**
- Healthcare-specific features (HIPAA compliance, patient portals)
- Legal-specific features (case management, legal billing)
- Real estate-specific features (property listings, MLS integration)
- Financial advisor-specific features (portfolio tracking, compliance)
- Education-specific features (student rosters, grading)

**Why:**
- Vertical SaaS = niche market, complex requirements
- Need horizontal solution first (all consultants/freelancers)
- Compliance burden (HIPAA, SOC 2) delays launch
- Can add verticals Post-MVP after validation

**What we DO instead:**
- Horizontal platform for all client-facing professionals
- Generic client cards (not patient records, not legal cases)
- Customizable fields (users add what they need)
- Focus on universal meeting memory problem

---

## ❌ NOT Mobile-First (MVP)

### What This Means

**We will NOT build in MVP:**
- Native iOS app
- Native Android app
- Offline-first mobile experience
- Push notifications on mobile
- Mobile-optimized video upload
- Mobile-specific gestures

**Why:**
- Mobile app = 2-3x dev time (iOS + Android)
- Desktop-first use case (prep before calls on laptop)
- MVP validates web-first, add mobile later
- Responsive web works for basic mobile use

**What we DO instead (MVP):**
- Responsive web design (works on mobile browser)
- Mobile-accessible UI (meeting assist panel)
- Add native mobile app Post-MVP (Phase 3)
- Focus on desktop experience first

---

## ❌ NOT Free Forever for Power Users

### What This Means

**We will NOT offer:**
- Unlimited clients on free tier
- Unlimited AI summaries on free tier
- Unlimited storage on free tier
- All Pro features for free
- Education/nonprofit discounts (MVP)

**Why:**
- Free tier is for trial/validation only
- Power users must pay (that's the business model)
- Free tier costs money (AI, storage, bandwidth)
- Need revenue to sustain product

**What we DO instead:**
- Free tier with strict limits (3 clients, 3 AI meetings)
- Generous enough to prove value
- Upgrade prompts when limits reached
- Clear value exchange (pay for more)

---

## ❌ NOT White-Label or API Platform (MVP)

### What This Means

**We will NOT build in MVP:**
- White-label branding for agencies
- Public API for developers
- Webhooks for integrations
- Embeddable widgets
- API rate limits and tiers
- Developer documentation portal

**Why:**
- API platform = different product (infrastructure, docs, support)
- Delays MVP by months
- Need core product PMF first
- API is monetization strategy for Year 2+

**What we DO instead (MVP):**
- Focus on end-user product
- Add API Post-MVP (Phase 4)
- Target: $99/mo API tier after 500 users
- Validate core product first

---

## Scope Creep Warning Signs

### If Someone Suggests...

| Suggestion | Response |
|------------|----------|
| "Can we add video calling?" | ❌ Not our core value. Users have Google Meet/Zoom. |
| "Can we add a CRM pipeline?" | ❌ We're not a CRM. Focus on meeting memory, not sales. |
| "Can we add Kanban boards?" | ❌ We're not a PM tool. Just meeting-related action items. |
| "Can clients log in to see their data?" | ❌ User-private tool. Clients never see app. |
| "Can we auto-send emails to clients?" | ❌ AI suggests, user controls. No automation MVP. |
| "Can we add team collaboration?" | ❌ Post-MVP. Individual users first. |
| "Can we build native mobile apps?" | ❌ Post-MVP. Responsive web first. |
| "Can we add industry-specific fields?" | ❌ Horizontal first. Customizable fields instead. |

### How to Say No

**Template:**
> "Great idea! However, that's not core to our MVP goal (client memory & meeting prep). Let's revisit Post-MVP after we validate PMF. For now, let's focus on [core feature]."

---

## What We ARE Building (Summary)

**Core Focus:**
- Client cards as permanent memory hubs
- Meeting logging (manual, platform-agnostic)
- AI summaries and action items
- Meeting prep intelligence (before meetings)
- Private assist panel (during meetings)
- AI assistant Q&A (context-aware)

**Target User:**
- Individual freelancers, consultants, coaches
- 0-50 active clients
- Use Google Meet/Zoom already
- Need memory and prep help

**Core Value:**
> "Your AI memory for every client relationship—works with any meeting tool, remembers everything, so you don't have to."

---

**Stick to this. Ship fast. Validate PMF. Then expand.**

---

**Next:** [Success Metrics →](./success-metrics.md)
