# Pricing and Business Model

## Pricing Tiers

### Free (Forever)
**$0/month**

- 3 active clients
- 5 AI-processed sessions (lifetime — never resets)
- 75 Solis Intelligence queries (lifetime — never resets)
- Unlimited manual transcript uploads (text/docx paste — AI processing counted toward limit)
- Basic session timeline
- Action item tracking

**Purpose:** Let coaches experience the full value loop with one client before committing.

### Pro
**$99/month** or **$948/year** ($79/month effective — save $240/year)

- Unlimited clients
- 25 AI-processed sessions/month (resets monthly)
- 2,000 Solis Intelligence queries/month (resets monthly)
- All session upload types (manual + auto-transcription)
- Hybrid RAG Solis Intelligence with full citation history
- ICF-aligned session documentation
- Priority support (24-hour response)

## Pricing Rationale

- **$99/month:** Less than 30 minutes of a coach's billable time ($200/hr = $3.33/min). ROI is immediate.
- **No free trial:** Free tier provides real value with one client. No credit card required. Converts on genuine value, not trial pressure.
- **Annual discount:** $240 savings incentivizes commitment. Annual subscribers have higher LTV and lower churn.

## Usage Limit Design

| Feature | Free | Pro |
|---------|------|-----|
| Active clients | 3 | Unlimited |
| AI sessions | 5 lifetime | 25/month |
| Solis queries | 75 lifetime | 2,000/month |
| Manual uploads | Unlimited | Unlimited |
| Reset schedule | Never (lifetime) | Monthly |

**Free tier is lifetime-based** (not monthly) to create genuine urgency to upgrade without frustrating new users.

**Pro resets monthly** via `transcript_reset_at` and `query_reset_at` timestamps in `usage_tracking` table.

## Unit Economics

| Metric | Value |
|--------|-------|
| Monthly revenue per customer | $99 |
| COGS (AI summaries) | $0.50/month |
| COGS (Deepgram transcription) | $6.50/month |
| COGS (Solis queries + infra) | $2.00/month |
| Total COGS | ~$9.00/month |
| Gross profit | $90.00/month |
| Gross margin | **90.9%** |
| CAC target | $250 |
| Average LTV (24 months × 75% retention) | $1,782 |
| LTV:CAC ratio | **7.1:1** |
| Payback period | **2.8 months** |

## Revenue Projections

| Month | Signups | Paying | MRR |
|-------|---------|--------|-----|
| 1 | 15–30 | 2–5 | $198–495 |
| 3 | 40–80 | 8–16 | $792–1,584 |
| 6 | 100–200 | 30–60 | $2,970–5,940 |
| 12 | 250–500 | 100–300 | $9,900–29,700 |

**Year 1 ARR target:** $120K–300K
**Exit target:** $15–30M acquisition (Year 3–4)

## Payment Infrastructure

Payment processing is abstracted via `BILLING_PROVIDER` environment variable:
- `dodo` (production): Dodo Payments Checkout + webhooks
- `placeholder` (dev): Simulates upgrade, no real payment

This allows switching payment processors without code changes if needed.

### Dodo Payments Configuration
- Pro Monthly: `DODO_PRODUCT_ID_MONTHLY` (Dodo Product ID, $99)
- Pro Annual: `DODO_PRODUCT_ID_ANNUAL` (Dodo Product ID, $948)
- Webhooks handled: `payment.succeeded`, `subscription.active`, `subscription.cancelled`, `subscription.failed`

## Launch Strategy

**Channel:** Founder-led outreach
- LinkedIn direct outreach to ICF-certified coaches
- ICF chapter communities and forums
- Reddit r/coaching
- Coaching Facebook groups
- Personal email network

**Month 1 target:** 15–30 signups, 2–5 paying customers ($198–495 MRR)

**Note:** All growth is cold outreach (no existing coaching connections). Founder-led: LinkedIn direct outreach, ICF chapter communities, Reddit r/coaching. Expect 15–20 hrs/week of sales effort.
