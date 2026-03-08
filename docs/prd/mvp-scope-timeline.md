# MVP Scope and Timeline

**Version:** 3.0
**Launch Target:** March 10, 2026 (soft) / March 31, 2026 (hard deadline)
**Last Updated:** March 8, 2026

---

## MVP Definition

**Minimum feature set to prove executive coaches will pay $99/month for client memory intelligence.**

### In Scope (11 Features — Locked)

1. Authentication & user management (Clerk)
2. Client Cards (CRUD, coaching-specific fields: goal, start_date)
3. Manual transcript upload (.txt, .docx, paste)
4. Auto-transcription (Deepgram Nova-2, audio/video)
5. AI summaries — provider-agnostic (Claude Sonnet 4.5 default)
6. Solis Intelligence Q&A with hybrid RAG
7. Action item tracking (extract + manual)
8. Usage limits enforcement (free: 1 client, 3 lifetime sessions, 50 lifetime queries)
9. Stripe billing & subscriptions ($99/mo Pro)
10. 5-step onboarding flow with sample transcript
11. Landing page (executive coach positioning)

### Explicitly Out of Scope (Post-MVP)

- Client-facing portal (coaches only for MVP)
- Team collaboration (solo coaches only)
- Calendar integration / Zoom auto-import
- Client tagging/categories
- Action item due dates and email reminders
- Action item dashboard (cross-client view)
- ICF-compliant PDF export
- Automated email notifications
- Therapist/HIPAA support
- Enterprise accounts, SSO, 2FA
- Mobile app (responsive web only)
- Bulk client import/export
- Client research via web scraping
- Meeting prep briefs (replaced by Solis Q&A)
- Suggested talking points
- Chat history persistence (Solis is stateless per query)

---

## Provider Abstraction Architecture

All three external service integrations are provider-agnostic. Switch providers via env var, zero code changes.

### AI Provider (`AI_PROVIDER`)
- `placeholder` — dev stub, instant mock (default for local dev)
- `claude` — Claude Sonnet 4.5 with prompt caching (production default)
- `openai` — GPT-4o-mini (alternative)

### Transcription Provider (`TRANSCRIPTION_PROVIDER`)
- `placeholder` — dev stub, instant mock
- `deepgram` — Deepgram Nova-2 (production default: 36% lower WER, speaker diarization)
- `openai-whisper` — OpenAI Whisper (alternative)

### Billing Provider (`BILLING_PROVIDER`)
- `placeholder` — simulates upgrade, no real payment (dev default)
- `stripe` — Stripe Checkout + webhooks (production)

---

## 4-Week Sprint Timeline

### Week 1 (March 1–7): Foundation + Client Cards

**Goal:** Coaches can create/view/edit/delete clients.

- [ ] Run DB migration 015 in Supabase (sessions, action_items, solis_queries, usage_tracking, subscriptions tables + alter clients)
- [ ] Update shared schemas (goal, start_date on client; new session/actionItem schemas)
- [ ] Update clients API: free limit 1 (not 3), check via subscriptions table
- [ ] Update ClientForm: add goal/start_date, remove phone/email/linkedin/tags
- [ ] Update ClientCard: show goal, "Last session", pending actions count
- [ ] Update ClientSearch: remove tag filtering
- [ ] Create Client Detail page (v3 layout: session timeline + pending actions)

**Deliverable:** Coach can manage clients with coaching-specific fields.

---

### Week 2 (March 8–14): Session Upload + AI Summaries

**Goal:** Coaches can upload transcripts and see AI-generated summaries.

- [ ] Sessions API (GET/POST/PUT/DELETE)
- [ ] File parsing utility (parseTranscript.ts): .txt, .docx (mammoth), paste text
- [ ] AI abstraction layer (provider.ts + claude/openai/placeholder providers)
- [ ] Transcription abstraction layer (provider.ts + deepgram/placeholder)
- [ ] Session summarization (prompts.ts ICF-compliant, summarize.ts parser)
- [ ] Embedding generation (embeddings.ts, sessions.embedding column)
- [ ] SessionUploadModal (2-tab: Manual / Auto-Transcribe)
- [ ] SessionTimeline + SessionCard components
- [ ] ActionItemList component

**Deliverable:** Coach can upload transcript → see AI summary → see action items.

---

### Week 3 (March 15–21): Solis Intelligence + Billing

**Goal:** Coaches can query client history; payment flow works.

- [ ] Solis Q&A API (hybrid RAG: pgvector top-3 + 3 most recent, max 6)
- [ ] SolisPanel component (client-specific + global mode)
- [ ] Intelligence page (/dashboard/intelligence)
- [ ] Usage enforcement (checkUsage.ts)
- [ ] Billing abstraction layer (provider.ts + stripe/placeholder)
- [ ] Stripe Checkout ($99/mo + $948/yr)
- [ ] Stripe webhook handling
- [ ] Settings page (billing section)
- [ ] Upgrade CTA modals

**Deliverable:** Solis works; payment flow completes end-to-end.

---

### Week 4 (March 22–31): Onboarding + Landing Page + Testing

**Goal:** Polished onboarding; production ready.

- [ ] 5-step onboarding flow rewrite
- [ ] Sample demo transcript (coaching scenario, ~2,000 words)
- [ ] Left sidebar nav (LeftSidebar.tsx) + layout update
- [ ] Landing page rewrite (executive coach positioning, $99 pricing)
- [ ] End-to-end test: signup → add client → upload → summary → Solis → upgrade
- [ ] RLS verification (no data leakage)
- [ ] Mobile responsive check
- [ ] Production deploy to Vercel
- [ ] Soft launch (March 10) → Hard launch (March 31)

**Deliverable:** Ready for beta coaches.

---

## Success Criteria (MVP Launch)

- [ ] 70%+ of beta users say "I would pay $99/month for this"
- [ ] 50+ signups in first 2 weeks
- [ ] 10+ paying customers ($990+ MRR)
- [ ] Solis response time <5 seconds
- [ ] AI summary generation <15 seconds
- [ ] <5 critical bugs

---

## Cost Structure (Production)

| Service | Cost |
|---------|------|
| Vercel hosting | $0 (free tier) |
| Supabase DB + Storage | $0 (free tier) |
| Clerk auth | $0 (free: 10,000 MAU) |
| Claude API (AI summaries) | ~$0.50/user/month |
| Deepgram (auto-transcription) | ~$0.19/session |
| Stripe | 2.9% + $0.30/transaction |
| **Total COGS/user** | **~$2.50/month** |

Monthly infra cost during development: $20 (Claude Code subscription only).
