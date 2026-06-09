/**
 * Story 7.4 — Read-only Coach Brief preview for Step 2B demo tour.
 *
 * Mirrors the visual structure of Story 6.4's BriefScreen but takes static
 * content directly so it renders for Free coaches during onboarding (the real
 * BriefScreen + /api/brief are Pro-gated). The same content is also seeded
 * into `coach_briefs` so a coach who upgrades to Pro sees the identical brief
 * at /brief/manual/{alexClientId}.
 */

'use client';

import { Sparkles, Calendar, CheckCircle2, Circle } from 'lucide-react';
import type { CoachBriefContent } from '@meetsolis/shared';

export function DemoBriefPreview({ content }: { content: CoachBriefContent }) {
  const last = content.last_session;
  const breakthrough = content.past_breakthroughs[0] ?? null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
          Coach Brief
        </p>
        <span className="text-[11px] text-foreground/40">·</span>
        <p className="text-[11px] text-foreground/50">
          for your session with {content.client_name}
        </p>
      </div>

      {/* AI Prep Note */}
      <section className="rounded-[10px] bg-card px-5 py-4 shadow-card">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-primary" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/40">
            AI Prep Note
          </h2>
        </div>
        <p className="whitespace-pre-line text-[13px] leading-[1.7] text-foreground/85">
          {content.ai_prep_note}
        </p>
      </section>

      {/* Last session */}
      {last && (
        <section className="rounded-[10px] bg-card px-5 py-4 shadow-card">
          <div className="mb-2 flex items-center gap-2">
            <Calendar className="h-3 w-3 text-foreground/45" />
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/40">
              Last session · {last.weeks_ago} weeks ago
            </h2>
          </div>
          <p className="mb-3 text-[13px] font-medium text-foreground/85">
            {last.key_theme}
          </p>
          <ul className="space-y-1.5">
            {last.action_items.map(item => (
              <li
                key={item.id}
                className="flex items-start gap-2 text-[12.5px] text-foreground/75"
              >
                {item.status === 'done' ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                ) : (
                  <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/35" />
                )}
                <span
                  className={
                    item.status === 'done'
                      ? 'text-foreground/40 line-through'
                      : ''
                  }
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Past breakthrough */}
      {breakthrough && (
        <section className="rounded-[10px] border border-primary/15 bg-primary/[0.04] px-5 py-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-primary" />
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-primary/70">
              Past breakthrough
            </h2>
          </div>
          <p className="text-[12.5px] leading-[1.65] text-foreground/80">
            {breakthrough.summary}
          </p>
        </section>
      )}
    </div>
  );
}
