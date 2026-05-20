/**
 * CoachBriefBanner — dashboard "COACH BRIEF READY" banner (Story 6.4).
 * Pro-only; surfaces the nearest active brief with a live countdown.
 * Renders nothing when there are no active briefs (incl. all Free coaches).
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight } from 'lucide-react';
import type { ActiveBriefSummary } from '@meetsolis/shared';
import { formatCountdown } from '@/lib/brief/format-countdown';

export function CoachBriefBanner() {
  const router = useRouter();

  const { data } = useQuery<{ briefs: ActiveBriefSummary[] }>({
    queryKey: ['active-briefs'],
    queryFn: async () => {
      const r = await fetch('/api/brief/active');
      if (!r.ok) return { briefs: [] };
      return r.json();
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const briefs = data?.briefs ?? [];
  if (briefs.length === 0) return null;

  const nearest = briefs[0];
  const extra = briefs.length - 1;

  return (
    <button
      type="button"
      onClick={() => router.push(`/brief/${nearest.calendar_event_id}`)}
      className="group flex w-full items-center gap-4 rounded-[12px] border border-amber-400/45 bg-amber-400/[0.12] px-5 py-4 text-left transition-colors hover:bg-amber-400/[0.18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/25">
        <Zap className="h-4.5 w-4.5 text-amber-500" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-amber-600 dark:text-amber-400">
          Coach Brief Ready
        </p>
        <p className="mt-0.5 truncate text-[13.5px] text-foreground">
          <span className="font-semibold">{nearest.client_name}</span>
          <span className="text-foreground/45">
            {' · '}
            {formatCountdown(new Date(nearest.start_time))}
          </span>
          {extra > 0 && (
            <span className="text-foreground/40">
              {'  +'}
              {extra} more
            </span>
          )}
        </p>
      </div>

      <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-2 text-[12.5px] font-semibold text-black transition-transform group-hover:translate-x-0.5">
        Open brief
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
