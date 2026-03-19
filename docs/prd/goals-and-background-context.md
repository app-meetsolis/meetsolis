# Goals and Background Context

## Product Vision

MeetSolis is a post-meeting intelligence platform built exclusively for executive coaches. It solves one critical problem: **coaches forget client context between sessions**, leading to unprofessional interactions and wasted preparation time.

**Tagline:** "Never forget a client's breakthrough moment again."

## Background

### Evolution of MeetSolis

- **v1.0 (Dec 2025):** Custom video conferencing platform (WebRTC, whiteboard, real-time translation) — abandoned because coaches trust Zoom/Google Meet and won't switch.
- **v2.0 (Jan 2026):** Generic AI memory assistant for freelancers/consultants/coaches — too broad, weak positioning, no clear differentiation.
- **v3.0 (Mar 2026 — Current):** Narrow ICP pivot to executive coaches exclusively. Vertical SaaS advantage: deep coach-specific UX, ICF compliance, coaching vocabulary, longitudinal client intelligence.

### Strategic Shift (v2 → v3)

| Old (v2) | New (v3) |
|----------|----------|
| Generic freelancers/consultants/coaches | Executive coaches exclusively |
| "AI memory for every client relationship" | "Never forget a client's breakthrough moment again" |
| Broad positioning | Narrow vertical SaaS |
| Basic session logging | Longitudinal transformation tracking |
| Generic AI assistant | Solis Intelligence (coaching-specific) |

## Ideal Customer Profile (ICP)

### Primary ICP: Independent Executive Coach

- **Role:** Independent executive/leadership coach (solo, not agency)
- **Experience:** 3–10+ years coaching
- **Certification:** ICF-certified (ACC, PCC, MCC preferred, not required)
- **Location:** US, Canada, UK, Australia (English-speaking markets)
- **Client load:** 10–25 active clients simultaneously
- **Session frequency:** 25–50 coaching sessions/month
- **Revenue:** $15,000–30,000/month ($180K–360K/year)
- **Pricing:** $200–500/hour or $3,000–15,000/month retainers
- **Tech sophistication:** Medium — uses Zoom, Calendly, Notion. Not a power user.
- **Current SaaS spend:** $50–100/month on productivity tools
- **Pain points (severity 1–10):**
  - Forgetting client context between sessions: **9/10**
  - Session prep time (20–30 min per session): **8/10**
  - Mixing up clients/commitments: **8/10**
  - Manual note organization: **7/10**

### Secondary ICP (Year 2)
Fractional CFOs and fractional executives managing 3–4 company clients with recurring touchpoints.

### NOT Targeting
- Therapists and mental health counselors (HIPAA compliance required — out of scope)
- Life coaches and wellness coaches (lower price sensitivity, smaller budgets)
- Teams and agencies (multi-seat complexity — post-MVP)
- Generic freelancers and consultants (v2 mistake — too broad)
- Enterprise corporate coaching teams (procurement complexity)

## Market Opportunity

- **Global coaching market:** $103.6B (2025), growing 9.11% CAGR → $161.1B (2030)
- **Executive coaching specifically:** Fastest-growing segment, highest price point
- **Total Addressable Market (TAM):** 87,900 executive coaches globally
- **Serviceable Addressable Market (SAM):** ~30,000 in English-speaking markets
- **Target Year 1:** 100–300 paying customers = $120K–300K ARR
- **Long-term exit target:** $15–30M acquisition by Notion, Calendly, or HubSpot (Year 3–4)

## Business Goals

- **Month 1:** 15–30 signups, 2–5 paying → $198–495 MRR
- **Month 3:** 40–80 signups, 8–16 paying → $792–1,584 MRR
- **Month 6:** 100–200 signups, 30–60 paying → **$2,970–5,940 MRR**
- **Month 12:** 250–500 signups, 100–300 paying → $9,900–29,700 MRR ($120K–300K ARR)

**Growth channel:** Cold outreach only (no existing coaching network). Founder-led: 15–20 hrs/week via LinkedIn, ICF chapters, Reddit r/coaching, coaching Facebook groups. Launch markets: US + UK.
- **Free-to-paid conversion:** 3–5% (vertical SaaS benchmark)
- **Monthly churn:** <3%
- **NPS target:** >50

## Product Goals

1. **Zero forgotten context:** Coaches recall every breakthrough, commitment, and pattern across all clients and sessions.
2. **Sub-5-minute prep:** Replace 20–30 min manual prep with instant Solis Intelligence query.
3. **ICF compliance:** Documentation standards aligned with International Coaching Federation requirements.
4. **Longitudinal intelligence:** Track client transformation over months/years, not just individual sessions.
5. **Non-disruptive:** Works alongside existing tools (Zoom, Calendly) — no workflow change required.

## Technical Goals (MVP)

- Client CRUD with coaching-specific fields (goal, start_date)
- Session transcript upload (manual + auto-transcription)
- Provider-agnostic AI summaries (Claude Sonnet 4.5 default)
- Solis Intelligence hybrid RAG (pgvector + recency)
- Stripe billing abstraction ($99/mo Pro tier)
- Launch by March 31, 2026

## Competitive Context

| Competitor | Weakness | Our Advantage |
|-----------|----------|---------------|
| Fireflies.ai | Generic meeting tool, not coach-specific | Coach-specific UX, coaching vocabulary, ICF compliance |
| Otter.ai | Transcription only, no intelligence | Client memory across ALL sessions + Solis Q&A |
| Fathom | Single-meeting focus | Longitudinal transformation tracking |
| Practice Better | Heavy CRM for therapists | Lightweight, coaching-focused, AI-native |
| Simply.Coach | Complex, expensive | Simple, affordable, faster time-to-value |

**Positioning:** We don't compete on price ($99 vs Fireflies $10) or transcription quality. We win on coach-specific intelligence, simplicity, and community trust.
