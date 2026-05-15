'use client';

/**
 * LiveTranscriptPanel (Story 6.2b)
 * Polls /api/sessions/[id]/transcript-live every 3s and renders streamed
 * transcript chunks. Stops polling once the meeting transcript is complete.
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import type { TranscriptChunk } from '@meetsolis/shared';

interface LiveTranscriptResponse {
  chunks: TranscriptChunk[];
  complete: boolean;
  started_at: string | null;
}

function speakerLabel(c: TranscriptChunk): string {
  return c.speaker_name ?? `Speaker ${c.speaker}`;
}

export function LiveTranscriptPanel({ sessionId }: { sessionId: string }) {
  const { data } = useQuery<LiveTranscriptResponse>({
    queryKey: ['transcript-live', sessionId],
    queryFn: async () => {
      const r = await fetch(`/api/sessions/${sessionId}/transcript-live`);
      if (!r.ok) throw new Error('FETCH_ERROR');
      return r.json();
    },
    // Poll every 3s while streaming; stop once the transcript is complete.
    refetchInterval: query => (query.state.data?.complete ? false : 3000),
  });

  const endRef = useRef<HTMLLIElement>(null);
  const chunks = data?.chunks ?? [];
  const complete = data?.complete ?? false;
  const started = data?.started_at ?? null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chunks.length]);

  // Nothing to show until streaming has actually started.
  if (!started) return null;

  return (
    <div className="rounded-[12px] bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h3 className="text-[13px] font-semibold text-foreground">
          Live Transcript
        </h3>
        {complete ? (
          <span className="text-[11px] text-foreground/35">Ended</span>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto px-5 py-4">
        {chunks.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-foreground/30">
            Waiting for first words…
          </p>
        ) : (
          <ul className="space-y-2.5">
            {chunks.map((c, i) => (
              <li
                key={`${c.start_ms}-${c.speaker}-${i}`}
                ref={i === chunks.length - 1 ? endRef : undefined}
                className="text-[12px] leading-relaxed"
              >
                <span
                  className={
                    c.speaker === 0
                      ? 'font-semibold text-primary'
                      : 'font-semibold text-foreground/55'
                  }
                >
                  {speakerLabel(c)}:
                </span>{' '}
                <span className="text-muted-foreground">{c.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
