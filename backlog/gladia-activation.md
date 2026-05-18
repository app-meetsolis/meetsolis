# Gladia — Built, Dormant, Activate When Needed

**Status:** Fully implemented in Story 6.3 (2026-05-18). **Not active.** MVP runs on Deepgram.
**This is not a backlog task** — there is no code work left. This is an activation runbook.

## What's already done

Story 6.3 shipped the complete Gladia transcription pipeline. Bot recordings are
re-transcribed into diarized transcripts (accurate "who said what"), speakers are
mapped to coach/client, and the AI summary is regenerated from the diarized text.

Bot transcription routes through a **3-way provider router** (`transcribeBotRecording`
in `apps/web/src/lib/services/transcription/gladia-service.ts`):

| Config | Provider used |
|--------|---------------|
| `USE_MOCK_SERVICES=true` | Fixture (dev/test only) |
| real services, **no** `GLADIA_API_KEY` | **Deepgram batch** ← current MVP setting |
| real services, `GLADIA_API_KEY` set | **Gladia** |

Everything downstream — speaker mapping, the speaker-reassignment UI, summary,
action items — is identical for both providers. They both produce the same
`DiarizedUtterance[]` shape.

## Current MVP behavior (Gladia OFF)

- `GLADIA_API_KEY` is intentionally left blank.
- Bot recordings are transcribed by **Deepgram** (diarized) — real transcription
  of the real meeting audio. No mock data.
- `/api/gladia/webhook` route exists but is dormant — never hit while Gladia is off.
- Migration `028_gladia_transcription.sql` is already applied to the database.

## How to activate Gladia later (no code changes)

When/if Deepgram's speaker separation isn't good enough:

1. Sign up at gladia.io → generate an API key (+ a webhook secret of your choice).
2. In Vercel project env vars, set:
   - `GLADIA_API_KEY` = the Gladia key
   - `GLADIA_WEBHOOK_SECRET` = any strong random string (used as the callback
     URL token — Gladia does not sign callbacks, so this is the auth check)
3. Redeploy (or it picks up on the next deploy).

That's it. The router automatically switches bot transcription to Gladia. No code
change, no PR.

### Notes
- Cost when activated: ~$0.61–0.75/hr of audio (~$17.50/coach/mo at 25 sessions),
  vs ~$6.50/coach/mo on Deepgram.
- Gladia is HIPAA/SOC2 — request a BAA from Gladia if a coach asks.
- The callback URL Gladia must reach is `https://<app-domain>/api/gladia/webhook`
  — it is registered automatically per job; no Gladia dashboard webhook setup needed.
- To turn Gladia back off: clear `GLADIA_API_KEY` → router falls back to Deepgram.
