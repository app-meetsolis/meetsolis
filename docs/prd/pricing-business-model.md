# Pricing and Business Model

## Pricing Tiers

### Free (Forever)
**$0/month**

- 1 active client
- 3 AI-processed sessions (lifetime — never resets)
- 50 Solis Intelligence queries (lifetime — never resets)
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
- ICF-compliant session documentation
- Priority support (24-hour response)

## Pricing Rationale

- **$99/month:** Less than 30 minutes of a coach's billable time ($200/hr = $3.33/min). ROI is immediate.
- **No free trial:** Free tier provides real value with one client. No credit card required. Converts on genuine value, not trial pressure.
- **Annual discount:** $240 savings incentivizes commitment. Annual subscribers have higher LTV and lower churn.

## Usage Limit Design

| Feature | Free | Pro |
|---------|------|-----|
| Active clients | 1 | Unlimited |
| AI sessions | 3 lifetime | 25/month |
| Solis queries | 50 lifetime | 2,000/month |
| Manual uploads | Unlimited | Unlimited |
| Reset schedule | Never (lifetime) | Monthly |

**Free tier is lifetime-based** (not monthly) to create genuine urgency to upgrade without frustrating new users.

**Pro resets monthly** via `transcript_reset_at` and `query_reset_at` timestamps in `usage_tracking` table.

## Unit Economics

| Metric | Value |
|--------|-------|
| Monthly revenue per customer | $99 |
| COGS (AI summaries) | $0.50/month |
| COGS (Solis queries) | $2.00/month |
| Total COGS | ~$2.50/month |
| Gross profit | $96.50/month |
| Gross margin | **97.5%** |
| CAC target | $250 |
| Average LTV (36 months × 75% retention) | $2,673 |
| LTV:CAC ratio | **10.7:1** |
| Payback period | **2.6 months** |

## Revenue Projections

| Month | Signups | Paying | MRR |
|-------|---------|--------|-----|
| 1 | 50–100 | 10–20 | $990–1,980 |
| 3 | 150–250 | 30–50 | $2,970–4,950 |
| 6 | 300–500 | 100–150 | $9,900–14,850 |
| 12 | 600–1,000 | 200–400 | $19,800–39,600 |

**Year 1 ARR target:** $240K–475K
**Exit target:** $15–30M acquisition (Year 3–4)

## Payment Infrastructure

Payment processing is abstracted via `BILLING_PROVIDER` environment variable:
- `stripe` (default): Stripe Checkout + webhooks + customer portal
- `placeholder` (dev): Simulates upgrade, no real payment

This allows switching payment processors without code changes if needed.

### Stripe Configuration
- Pro Monthly: `STRIPE_PRICE_MONTHLY` (Stripe Price ID, $99)
- Pro Annual: `STRIPE_PRICE_ANNUAL` (Stripe Price ID, $948)
- Webhooks handled: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`

## Launch Strategy

**Channel:** Founder-led outreach
- LinkedIn direct outreach to ICF-certified coaches
- ICF chapter communities and forums
- Reddit r/coaching
- Coaching Facebook groups
- Personal email network

**Month 1 target:** 50–100 signups, 10+ paying customers ($990+ MRR)
