# Epic 5: Advanced Features & Monetization

**Version:** 3.0
**Status:** Not Started
**Priority:** P0 (Critical - MVP Revenue)
**Target Timeline:** Week 3–4 (March 15–31, 2026)
**Dependencies:** Epic 1, 2, 3, 4
**Previous Version:** 2.0 (generic meeting assistant) - See git history

---

## Epic Overview

Build billing infrastructure (Dodo Payments), free vs pro tier enforcement, settings, onboarding, and polish features required for MVP launch.

**Goal:** Enable coaches to sign up for free, experience value, and upgrade to Pro ($99/mo or $948/yr).

---

## User Stories

### Story 5.1: Dodo Payments Integration & Subscription Management

**As a** user
**I want to** subscribe to Pro tier via Dodo Payments
**So that** I can access unlimited features

**Acceptance Criteria:**
- [ ] Dodo Payments account created and configured
- [ ] Products created in Dodo Payments dashboard:
  - Pro Monthly: $99/month
  - Pro Annual: $948/year
- [ ] Dodo Payments Checkout integration:
  - User clicks "Upgrade to Pro" → Redirect to Dodo Payments checkout
  - After payment → Redirect back with payment confirmation
  - Webhook handles payment.succeeded
- [ ] Subscription status stored in subscriptions table (tier: 'free' | 'pro', dodo_customer_id, dodo_subscription_id)
- [ ] Webhook endpoint: POST /api/billing/webhook
- [ ] Handle webhook events:
  - payment.succeeded → Create/activate subscription
  - subscription.active → Confirm pro access
  - subscription.cancelled → Downgrade to free
  - subscription.failed → Send notification
- [ ] Cancel subscription: Users can cancel via billing portal or settings page
- [ ] `BILLING_PROVIDER` env var abstraction: `dodo` (production) | `placeholder` (local dev, skips all payment calls)

**Estimated Effort:** 1 day

---

### Story 5.2: Tier Enforcement Middleware

**As a** system
**I need to** enforce free vs pro limits
**So that** free users can't exceed limits

**Acceptance Criteria:**
- [ ] Middleware function: `checkTierLimit(feature, userId)`
- [ ] Limits to enforce:
  - Clients: Free=3, Pro=unlimited
  - AI sessions (transcripts): Free=5 lifetime, Pro=25/month
  - Solis queries: Free=75 lifetime, Pro=2,000/month
- [ ] Check before allowing action
- [ ] If limit exceeded: Return 403 error with upgrade message
- [ ] Frontend: Show upgrade modal/toast
- [ ] Admin override (for testing)

**Estimated Effort:** 0.5 days

---

### Story 5.3: Pricing Page

**As a** potential user
**I want to** see pricing clearly
**So that** I can decide to sign up

**Acceptance Criteria:**
- [ ] Pricing page: `/pricing`
- [ ] Two tiers: Free, Pro (as per PRD)
- [ ] Feature comparison table (detailed)
- [ ] Monthly/Annual toggle (show savings)
- [ ] FAQ section (no trial FAQ item)
- [ ] "Start Free (No Credit Card)" and "Upgrade to Pro" CTAs
- [ ] Prices: $99/month or $948/year
- [ ] Mobile responsive

**Estimated Effort:** 0.5 days

---

### Story 5.4: Settings Page (Profile & Billing)

**As a** user
**I want to** manage my profile and billing
**So that** I can update my info and payment method

**Acceptance Criteria:**
- [ ] Settings page: `/settings`
- [ ] Tabs: Profile, Billing, Preferences
- [ ] Profile: Name, email, avatar, timezone, delete account
- [ ] Billing: Current plan ($99/mo or $948/yr), usage, upgrade/cancel buttons
- [ ] Preferences: Email notifications, theme

**Estimated Effort:** 1 day

---

### Story 5.5: Onboarding Flow

**As a** new user
**I want** a simple onboarding that shows me MeetSolis's core value
**So that** I reach my first aha moment in under 5 minutes

**Acceptance Criteria:**
- [ ] 5 steps:
  - Step 1: Welcome — "Welcome to MeetSolis — your AI memory for coaching sessions"
  - Step 2: Add First Client — coached form: name, goal, start date
  - Step 3: Upload First Transcript — offer sample demo transcript download; file upload or paste
  - Step 4: View Summary — highlight the AI-generated summary, key topics, action items
  - Step 5: Try Solis — "Ask Solis something about this session" — pre-filled suggested question
- [ ] Goal: <5 minutes to first aha moment
- [ ] Skip button on each step
- [ ] Onboarding completion stored

**Estimated Effort:** 1 day

---

> **Story 5.6 (Free Trial) — Removed in v3.** Free tier provides genuine value with 3 clients, 5 sessions, 75 queries. No trial needed.

---

### Story 5.6: Landing Page (Executive Coach Positioning)

**Status:** Not Started
**Priority:** P1
**Effort:** 1 day

**As a potential customer (executive coach), I want the landing page to immediately speak to my specific situation, so I know this tool is built for me.**

#### Page Structure

**Hero:**
- H1: "Never forget a client's breakthrough moment again."
- Subheadline: "Solis Intelligence gives executive coaches perfect recall across every client's journey — so you walk into every session fully prepared."
- CTA: "Start Free — No Credit Card Required"
- Secondary CTA: "See How It Works"

**How It Works (3 steps):**
1. Upload your session transcript (text, docx, or audio)
2. AI generates your structured summary and action items in seconds
3. Ask Solis anything about any client — get cited answers instantly

**Features Section:**
- Session Memory (every session, searchable forever)
- Solis Intelligence (Q&A with citation)
- Action Item Tracking (coach and client commitments)
- Auto-Transcription (Deepgram Nova-2 speaker diarization)

**Pricing Section:**
- Free: 3 clients, 5 sessions, 75 queries
- Pro: $99/month — unlimited clients, 25 sessions/month, 2,000 queries/month

**Trust Signals:**
- "ICF-aligned documentation standards"
- "Your data is never used to train AI models"
- "Built exclusively for executive coaches"

#### Acceptance Criteria
- [ ] All 4 sections render correctly
- [ ] "Start Free" CTA links to sign-up
- [ ] Pricing section matches current pricing exactly
- [ ] Mobile responsive
- [ ] Page load <2 seconds

---

### Story 5.7: Upgrade Prompts & Upsell

**As a** system
**I need to** prompt free users to upgrade
**So that** conversion rate increases

**Acceptance Criteria:**
- [ ] Prompts when hitting limits
- [ ] Upgrade modals with clear CTAs
- [ ] Pro pricing: $99/month
- [ ] Track conversion from prompts

**Estimated Effort:** 0.5 days

---

### Story 5.8: Email Notifications (Transactional)

**As a** user
**I want** email notifications for important events
**So that** I stay informed

**Acceptance Criteria:**
- [ ] Welcome email
- [ ] Payment receipts
- [ ] Payment failed alerts

**Estimated Effort:** 0.5 days

---

### Story 5.9: Data Export (GDPR Compliance)

**As a** user
**I want to** export all my data
**So that** I comply with GDPR

**Acceptance Criteria:**
- [ ] Export all data as ZIP (CSV + PDF)
- [ ] Download link expires after 7 days
- [ ] Includes all sessions and action items

**Estimated Effort:** 1 day

---

### Story 5.10: Account Deletion (GDPR Right to Erasure)

**As a** user
**I want to** delete my account permanently
**So that** my data is removed

**Acceptance Criteria:**
- [ ] Confirmation dialog with "DELETE" input
- [ ] Cascade delete all user data
- [ ] Cancel Dodo Payments subscription

**Estimated Effort:** 0.5 days

---

### Story 5.11: Performance Optimization & Polish

**As a** user
**I want** the app to feel fast
**So that** I enjoy using it

**Acceptance Criteria:**
- [ ] Lighthouse score >90
- [ ] Code splitting, lazy loading
- [ ] Error boundaries, loading skeletons

**Estimated Effort:** 1 day

---

### Story 5.12: Error Tracking & Monitoring

**As a** developer
**I need** error tracking
**So that** I can fix bugs quickly

**Acceptance Criteria:**
- [ ] Sentry integrated
- [ ] All errors logged
- [ ] Alerts configured

**Estimated Effort:** 0.5 days

---

### Story 5.13: Launch Checklist & Deployment

**As a** team
**We need** a launch checklist
**So that** we don't miss critical steps

**Acceptance Criteria:**
- [ ] All epics complete
- [ ] No P0/P1 bugs
- [ ] Smoke testing passed
- [ ] Privacy policy published
- [ ] Anthropic/OpenAI DPA signed
- [ ] Pro pricing confirmed: $99/month, $948/year

**Estimated Effort:** 1 day

---

## Epic Success Criteria

- [ ] Users can upgrade to Pro via Dodo Payments ($99/mo or $948/yr)
- [ ] Free/Pro tier limits enforced
- [ ] GDPR compliant (export + delete)
- [ ] Performance >90 Lighthouse
- [ ] 10+ beta coaches, 5+ upgrades

---

## Definition of Done

- [ ] Dodo Payments integration working (live mode)
- [ ] Free/Pro tiers enforced
- [ ] Onboarding smooth (<5 min to first aha moment)
- [ ] Performance acceptable
- [ ] Ready for MVP launch (March 31, 2026)

---

**Epic Complete → MVP Launch Ready!**
