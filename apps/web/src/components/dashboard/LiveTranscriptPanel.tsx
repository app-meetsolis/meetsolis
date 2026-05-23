'use client';

/**
 * Dashboard live transcript panel (Story 6.5).
 *
 * Renders one collapsible card per active session. Default state COLLAPSED —
 * coach clicks to expand. Polls /api/sessions/[id]/transcript-live every 3s
 * (reuses Story 6.2b infra). Auto-closes when status transitions to 'done'.
 *
 * Pro-only — caller (DashboardPage) gates by tier.
 */

import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { toast } from 'sonner';
import type { TranscriptChunk } from '@meetsolis/shared';
import {
  useActiveSessions,
  type ActiveSession,
} from '@/hooks/useActiveSessions';

interface LiveTranscriptResponse {
  chunks: TranscriptChunk[];
  complete: boolean;
  started_at: string | null;
}

/**
 * Render-time speaker label.
 * Order of preference: speaker_map[`speaker_${n}`] → chunk.speaker_name → `Speaker N`.
 */
function labelForSpeaker(
  chunk: TranscriptChunk,
  speakerMap: Record<string, string> | null
): string {
  const key = `speaker_${chunk.speaker}`;
  if (speakerMap && speakerMap[key]) return speakerMap[key];
  if (chunk.speaker_name) return chunk.speaker_name;
  return `Speaker ${chunk.speaker}`;
}

function msToClock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function ActiveSessionCard({ session }: { session: ActiveSession }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();
  const bodyRef = useRef<HTMLDivElement>(null);
  const wasAtBottomRef = useRef(true);
  const wasCompleteRef = useRef(false);

  const { data } = useQuery<LiveTranscriptResponse>({
    queryKey: ['transcript-live', session.session_id],
    queryFn: async () => {
      const r = await fetch(
        `/api/sessions/${session.session_id}/transcript-live`
      );
      if (!r.ok) throw new Error('FETCH_ERROR');
      return r.json();
    },
    refetchInterval: query => (query.state.data?.complete ? false : 3000),
  });

  const chunks = data?.chunks ?? [];
  const complete = data?.complete ?? false;

  // Auto-collapse + toast when streaming completes.
  useEffect(() => {
    if (complete && !wasCompleteRef.current) {
      wasCompleteRef.current = true;
      setExpanded(false);
      toast.info('Session ended. Transcript processing…', {
        action: session.client_id
          ? {
              label: 'View client',
              onClick: () =>
                window.location.assign(`/clients/${session.client_id}`),
            }
          : undefined,
      });
      // Invalidate active list so card disappears next refetch.
      void queryClient.invalidateQueries({ queryKey: ['sessions-active'] });
    }
  }, [complete, session.client_id, queryClient]);

  // Auto-scroll to bottom on new chunks unless coach scrolled up.
  useEffect(() => {
    if (!expanded) return;
    const el = bodyRef.current;
    if (!el) return;
    if (wasAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chunks.length, expanded]);

  function handleScroll() {
    const el = bodyRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    wasAtBottomRef.current = distanceFromBottom < 40;
  }

  const headerLabel = session.client_name ?? 'Active session';

  return (
    <div className="rounded-[12px] border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-red-500 font-medium text-[13px]">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            Recording
          </span>
          <span className="text-muted-foreground text-[13px]">·</span>
          <span className="text-[13px] font-medium text-foreground">
            {headerLabel}
          </span>
        </div>
        <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
          {expanded ? 'Hide transcript' : 'Live transcript'}
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </span>
      </button>

      {expanded && (
        <div
          ref={bodyRef}
          onScroll={handleScroll}
          aria-live="polite"
          className="border-t border-border max-h-72 overflow-y-auto px-5 py-4"
        >
          {chunks.length === 0 ? (
            <p className="py-4 text-center text-[12px] text-muted-foreground">
              Waiting for first words…
            </p>
          ) : (
            <ul className="space-y-2.5">
              {chunks.map((c, i) => (
                <li
                  key={`${c.start_ms}-${c.speaker}-${i}`}
                  className="text-[12px] leading-relaxed"
                >
                  <span className="font-semibold text-foreground/70">
                    [{labelForSpeaker(c, session.speaker_map)}{' '}
                    {msToClock(c.start_ms)}]
                  </span>{' '}
                  <span className="text-muted-foreground">{c.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  /** Caller (DashboardPage) gates this — only Pro coaches see the panel. */
  enabled: boolean;
}

export function LiveTranscriptPanel({ enabled }: Props) {
  const { data: active = [] } = useActiveSessions(enabled);

  if (!enabled || active.length === 0) return null;

  return (
    <div className="space-y-2">
      {active.map(s => (
        <ActiveSessionCard key={s.session_id} session={s} />
      ))}
    </div>
  );
}

// Re-export pure helpers for tests.
export const __test_only = { labelForSpeaker, msToClock };
