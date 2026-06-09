/**
 * Story 7.4 — Path B Step 2 — Demo Client Tour (AHA moment).
 *
 * Standalone component. Story 7.3 will mount this inside the onboarding shell.
 *
 * Flow:
 *  1. On mount → POST /api/onboarding/seed-demo (idempotent)
 *  2. Show three "what your card holds" previews — profile, AI Strip, Coach Brief
 *  3. Offer a Solis pre-filled question as a CTA
 *  4. "Now add your first real client" → onContinue() (Step 4)
 *
 * Tier note: the underlying Coach Brief route is Pro-gated, so this step
 * renders content from the static demo seed via DemoBriefPreview. The same
 * brief is also seeded into `coach_briefs` so a Pro coach later sees it at
 * /brief/manual/{clientId}.
 */

'use client';

import { useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, ArrowRight, MessageSquare, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DEMO_CLIENT_PROFILE,
  buildDemoAIStrip,
  buildDemoBriefContent,
} from '@/lib/onboarding/demo-client-data';
import { DemoBriefPreview } from './DemoBriefPreview';

export interface Step2BDemoTourProps {
  /** Called when coach clicks "Now add your first real client". */
  onContinue: () => void;
  /** Optional — link to the seeded demo client's full card. */
  onExploreCard?: (clientId: string) => void;
  /** Optional — open Solis with a pre-filled question against this client. */
  onAskSolis?: (clientId: string, question: string) => void;
}

interface SeedResponse {
  clientId: string;
  alreadySeeded: boolean;
}

const SOLIS_PREFILL = 'What is Alex struggling with?';

async function postSeedDemo(): Promise<SeedResponse> {
  const res = await fetch('/api/onboarding/seed-demo', { method: 'POST' });
  if (!res.ok) throw new Error(`Seed failed (${res.status})`);
  return res.json();
}

export function Step2BDemoTour({
  onContinue,
  onExploreCard,
  onAskSolis,
}: Step2BDemoTourProps) {
  const seedMutation = useMutation<SeedResponse, Error>({
    mutationFn: postSeedDemo,
  });

  // Fire the seed exactly once on mount. Server-side idempotency + the unique
  // partial index on (user_id) WHERE is_demo=TRUE handle any race.
  useEffect(() => {
    if (seedMutation.isIdle) seedMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientId = seedMutation.data?.clientId ?? null;
  const error = seedMutation.error;
  const loading = seedMutation.isPending;

  // Static demo content for the previews — same content the seed function
  // wrote to the database, rendered directly so Free coaches can see the
  // Coach Brief preview (the real /api/brief route is Pro-only). Memoized so
  // generated_at doesn't shift on every render.
  const aiStrip = useMemo(() => buildDemoAIStrip(), []);
  const briefContent = useMemo(() => buildDemoBriefContent(), []);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-8">
      {/* Intro */}
      <header className="space-y-2 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          Step 2 of {/* parent will swap in dynamic total */}7
        </p>
        <h1 className="text-[26px] font-bold tracking-[-0.02em] text-foreground">
          Meet your demo client
        </h1>
        <p className="text-[14px] text-foreground/55">
          We&apos;ve set up{' '}
          <strong className="text-foreground/80">
            {DEMO_CLIENT_PROFILE.name}
          </strong>{' '}
          so you can see what MeetSolis does for you before adding a real
          client.
        </p>
        {loading && (
          <p className="pt-1 text-[12px] text-foreground/40" role="status">
            Preparing your demo…
          </p>
        )}
        {error && (
          <p className="pt-1 text-[12px] text-amber-500" role="status">
            Could not set up the demo ({error.message}). You can still continue.
          </p>
        )}
      </header>

      {/* Client profile mini-card */}
      <section className="rounded-[12px] bg-card px-6 py-5 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[18px] font-bold text-primary">
            AR
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-bold tracking-[-0.01em] text-foreground">
                {DEMO_CLIENT_PROFILE.name}
              </h2>
              <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground/55">
                Demo
              </span>
            </div>
            <p className="mt-0.5 text-[12.5px] text-foreground/45">
              {DEMO_CLIENT_PROFILE.role} · {DEMO_CLIENT_PROFILE.company}
            </p>
            <p className="mt-2 text-[12.5px] leading-[1.55] text-foreground/70">
              <span className="text-foreground/45">Goal: </span>
              {DEMO_CLIENT_PROFILE.goal}
            </p>
          </div>
          {clientId && onExploreCard && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExploreCard(clientId)}
              className="h-8 shrink-0 gap-1.5 border-border bg-transparent text-[12px]"
            >
              <User2 className="h-3.5 w-3.5" />
              See full card
            </Button>
          )}
        </div>
      </section>

      {/* AI Intelligence Strip preview */}
      <section className="rounded-[12px] bg-card px-6 py-5 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/40">
            What your card knows after 4 sessions
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StripField
            label="Recurring theme"
            value={aiStrip.recurring_theme}
            chip={aiStrip.theme_frequency}
          />
          <StripField
            label="Recent breakthrough"
            value={aiStrip.recent_breakthrough}
          />
          <StripField label="Current focus" value={aiStrip.current_focus} />
          <StripField
            label="Coach note (private)"
            value="Yours to write. Never touched by AI."
            muted
          />
        </div>
      </section>

      {/* Coach Brief preview */}
      <section className="rounded-[12px] border border-border bg-muted/30 px-5 py-5">
        <p className="mb-3 text-[12px] text-foreground/45">
          Imagine your session with Alex is in 2 hours. Here&apos;s your brief —
          generated automatically before every session.
        </p>
        <DemoBriefPreview content={briefContent} />
      </section>

      {/* Solis prompt */}
      <section className="rounded-[12px] bg-card px-6 py-5 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/40">
            Try asking Solis
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-[8px] border border-border bg-muted/60 px-3 py-2">
          <span className="text-[13px] text-foreground/85">
            {SOLIS_PREFILL}
          </span>
          <div className="ml-auto">
            {clientId && onAskSolis && (
              <Button
                size="sm"
                onClick={() => onAskSolis(clientId, SOLIS_PREFILL)}
                className="h-8 gap-1.5 text-[12px]"
              >
                Ask Solis
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-foreground/40">
          Solis answers from Alex&apos;s session history — and will do the same
          for every real client you add.
        </p>
      </section>

      {/* Continue */}
      <div className="flex justify-center pt-2">
        <Button
          size="lg"
          onClick={onContinue}
          className="h-11 gap-2 px-6 text-[14px] font-semibold"
        >
          Now add your first real client
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StripField — small presentational helper, local to this file
// ---------------------------------------------------------------------------

function StripField({
  label,
  value,
  chip,
  muted,
}: {
  label: string;
  value: string;
  chip?: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-[8px] border border-border bg-muted/40 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/40">
        {label}
      </p>
      <p
        className={`mt-1.5 text-[13px] leading-[1.55] ${
          muted ? 'text-foreground/50 italic' : 'text-foreground/85'
        }`}
      >
        {value}
      </p>
      {chip && (
        <p className="mt-1.5 inline-block rounded-full border border-primary/20 bg-primary/[0.06] px-2 py-0.5 text-[10px] text-primary">
          {chip}
        </p>
      )}
    </div>
  );
}
