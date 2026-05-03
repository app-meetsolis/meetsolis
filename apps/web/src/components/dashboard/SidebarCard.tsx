'use client';

import Link from 'next/link';
import { X, Sparkles, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';

// TODO: wire up to real subscription API
const MOCK_PLAN: 'free' | 'pro' = 'free';
const MOCK_CLIENTS_USED = 2;
const MOCK_CLIENTS_LIMIT = 3;
const MOCK_TRANSCRIPTS_USED = 2;
const MOCK_TRANSCRIPTS_LIMIT = 5;

// TODO: wire up to real onboarding progress API
const MOCK_STEPS_DONE = 3;
const MOCK_STEPS_TOTAL = 5;

function RingProgress({ done, total }: { done: number; total: number }) {
  const r = 24;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - done / total);
  const pct = Math.round((done / total) * 100);

  return (
    <div className="relative flex items-center justify-center w-14 h-14">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="var(--ms-ring-track)"
          strokeWidth="4"
        />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="#E8E4DD"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[11px] font-semibold text-foreground">
        {pct}%
      </span>
    </div>
  );
}

function UsageBar({
  used,
  limit,
  color,
}: {
  used: number;
  limit: number;
  color: string;
}) {
  const pct = Math.min((used / limit) * 100, 100);
  return (
    <div
      className="h-[3px] w-full rounded-full"
      style={{ background: 'var(--ms-usage-track)' }}
    >
      <div
        className="h-[3px] rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function SidebarCard() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem('ms_onboarding_card_dismissed') === '1');
  }, []);

  const isPro = MOCK_PLAN === 'pro';
  const onboardingDone = MOCK_STEPS_DONE >= MOCK_STEPS_TOTAL;

  if (isPro && onboardingDone) return null;

  if (!onboardingDone && !dismissed) {
    return (
      <div className="mx-2 mb-2 rounded-lg border border-border bg-muted p-3 relative">
        <button
          onClick={() => {
            localStorage.setItem('ms_onboarding_card_dismissed', '1');
            setDismissed(true);
          }}
          className="absolute right-2 top-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X style={{ width: 11, height: 11 }} />
        </button>

        <div className="flex flex-col items-center gap-2.5">
          <RingProgress done={MOCK_STEPS_DONE} total={MOCK_STEPS_TOTAL} />
          <div className="text-center">
            <p className="text-xs font-semibold text-foreground leading-tight">
              Finish your setup
            </p>
            <p className="text-[10px] text-foreground/35 mt-0.5">
              {MOCK_STEPS_DONE} of {MOCK_STEPS_TOTAL} steps done
            </p>
          </div>
          <Link
            href="/onboarding"
            className="w-full text-center rounded-md bg-accent hover:brightness-90 px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Continue setup
          </Link>
        </div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="mx-2 mb-2 rounded-lg border border-border bg-muted p-3">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles
            style={{ width: 11, height: 11 }}
            className="text-primary shrink-0"
          />
          <span className="text-[11px] font-semibold text-foreground">
            Free plan
          </span>
        </div>

        <div className="space-y-2.5 mb-3">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Clients</span>
              <span>
                {MOCK_CLIENTS_USED} / {MOCK_CLIENTS_LIMIT}
              </span>
            </div>
            <UsageBar
              used={MOCK_CLIENTS_USED}
              limit={MOCK_CLIENTS_LIMIT}
              color="#E8E4DD"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Uploads</span>
              <span>
                {MOCK_TRANSCRIPTS_USED} / {MOCK_TRANSCRIPTS_LIMIT}
              </span>
            </div>
            <UsageBar
              used={MOCK_TRANSCRIPTS_USED}
              limit={MOCK_TRANSCRIPTS_LIMIT}
              color="#37ea9e"
            />
          </div>
        </div>

        <Link
          href="/pricing"
          className="flex items-center justify-center gap-1 w-full rounded-md border border-primary/20 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 text-[11px] font-medium text-primary transition-colors"
        >
          Upgrade to Pro
          <ArrowUpRight style={{ width: 10, height: 10 }} />
        </Link>
      </div>
    );
  }

  return null;
}
