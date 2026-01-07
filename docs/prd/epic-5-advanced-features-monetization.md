# Epic 5: Advanced Features & Monetization

**Version:** 2.0
**Status:** Not Started
**Priority:** P0 (Critical - MVP Revenue)
**Target Timeline:** Week 4 (Jan 27-31, 2026)
**Dependencies:** Epic 1, 2, 3, 4
**Previous Version:** 1.0 (Video conferencing monetization) - See git history

---

## Epic Overview

Build billing infrastructure (Stripe), free vs pro tier enforcement, settings, onboarding, and polish features required for MVP launch.

**Goal:** Enable users to sign up for free, experience value, and upgrade to Pro ($29/mo or $249/yr).

---

## User Stories

### Story 5.1: Stripe Integration & Subscription Management

**As a** user
**I want to** subscribe to Pro tier via Stripe
**So that** I can access unlimited features

**Acceptance Criteria:**
- [ ] Stripe account created and configured
- [ ] Products created in Stripe:
  - Pro Monthly: $29/month
  - Pro Annual: $249/year
- [ ] Stripe Checkout integration:
  - User clicks "Upgrade to Pro" → Redirect to Stripe Checkout
  - After payment → Redirect back with session_id
  - Webhook handles checkout.session.completed
- [ ] Subscription status stored in users table (tier: 'free' | 'pro', stripe_customer_id, stripe_subscription_id)
- [ ] Webhook endpoint: POST /api/webhooks/stripe
- [ ] Handle webhook events:
  - checkout.session.completed → Create subscription
  - customer.subscription.updated → Update status
  - customer.subscription.deleted → Downgrade to free
  - invoice.payment_failed → Send notification
- [ ] Cancel subscription: Users can cancel via Stripe portal
- [ ] Stripe Customer Portal integration (manage billing)

**Estimated Effort:** 1 day

---

### Story 5.2: Tier Enforcement Middleware

**As a** system
**I need to** enforce free vs pro limits
**So that** free users can't exceed limits

**Acceptance Criteria:**
- [ ] Middleware function: `checkTierLimit(feature, userId)`
- [ ] Features to enforce:
  - Clients: Free=3, Pro=50
  - AI transcriptions: Free=3/month, Pro=20/month
  - AI queries: Free=100/month, Pro=1000/month
  - Client research: Free=3/month, Pro=20/month
  - Tags: Free=3 per client, Pro=unlimited
  - Storage: Free=100MB, Pro=5GB
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
- [ ] FAQ section
- [ ] "Start Free" and "Start 14-Day Trial" CTAs
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
- [ ] Billing: Current plan, usage, upgrade/cancel buttons
- [ ] Preferences: Email notifications, theme

**Estimated Effort:** 1 day

---

### Story 5.5: Onboarding Flow (New Design)

**As a** new user
**I want** a simple onboarding
**So that** I get started quickly

**Acceptance Criteria:**
- [ ] 3 steps: Welcome → Add First Client → Quick Tour
- [ ] Skip button on each step
- [ ] Onboarding completion stored

**Estimated Effort:** 0.5 days

---

### Story 5.6: Free Trial Implementation (14 Days)

**As a** user
**I want to** try Pro for 14 days free
**So that** I can test before paying

**Acceptance Criteria:**
- [ ] Stripe Checkout with trial_period_days=14
- [ ] Email reminders (day 7, 13, 14)
- [ ] Cancel anytime during trial

**Estimated Effort:** 0.5 days

---

### Story 5.7: Upgrade Prompts & Upsell

**As a** system
**I need to** prompt free users to upgrade
**So that** conversion rate increases

**Acceptance Criteria:**
- [ ] Prompts when hitting limits
- [ ] Upgrade modals with clear CTAs
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
- [ ] Trial reminders
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

**Estimated Effort:** 1 day

---

### Story 5.10: Account Deletion (GDPR Right to Erasure)

**As a** user
**I want to** delete my account permanently
**So that** my data is removed

**Acceptance Criteria:**
- [ ] Confirmation dialog with "DELETE" input
- [ ] Cascade delete all user data
- [ ] Cancel Stripe subscription

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
- [ ] OpenAI DPA signed

**Estimated Effort:** 1 day

---

## Epic Success Criteria

- [ ] Users can upgrade to Pro via Stripe
- [ ] Free/Pro tier limits enforced
- [ ] GDPR compliant (export + delete)
- [ ] Performance >90 Lighthouse
- [ ] 10+ beta users, 5+ upgrades

---

## Definition of Done

- [ ] Stripe integration working (live mode)
- [ ] Free/Pro tiers enforced
- [ ] Onboarding smooth
- [ ] Performance acceptable
- [ ] Ready for MVP launch (Jan 31, 2026)

---

**Epic Complete → MVP Launch Ready! 🚀**
