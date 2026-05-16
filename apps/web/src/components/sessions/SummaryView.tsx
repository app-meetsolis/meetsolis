'use client';

/**
 * SummaryView (Story 6.2c)
 * Read-only render of a session's AI summary + key topics (markdown).
 * Self-contained — fetches by sessionId, no layout coupling. Distinct from
 * the editable "Edit Summary" flow.
 */

import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';

interface SessionSummaryData {
  summary: string | null;
  key_topics: string[] | null;
  status: string;
}

export function SummaryView({ sessionId }: { sessionId: string }) {
  const { data, isLoading, isError } = useQuery<SessionSummaryData>({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const r = await fetch(`/api/sessions/${sessionId}`);
      if (!r.ok) throw new Error('FETCH_ERROR');
      return (await r.json()).session;
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="skeleton h-4 w-full rounded-md" />
        <div className="skeleton h-4 w-5/6 rounded-md" />
        <div className="skeleton h-4 w-2/3 rounded-md" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-[12px] text-foreground/35">Failed to load summary.</p>
    );
  }

  if (!data?.summary) {
    return (
      <p className="text-[12px] text-foreground/35">
        {data?.status === 'processing'
          ? 'Summary is still being generated…'
          : 'No summary available yet.'}
      </p>
    );
  }

  const topics = data.key_topics ?? [];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/30 mb-2">
          Session Summary
        </p>
        <div className="prose prose-sm max-w-none text-[13px] leading-relaxed text-foreground/75 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:text-foreground [&_li]:text-foreground/75">
          <ReactMarkdown>{data.summary}</ReactMarkdown>
        </div>
      </div>

      {topics.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/30 mb-2">
            Key Topics
          </p>
          <div className="flex flex-wrap gap-1.5">
            {topics.map(topic => (
              <span
                key={topic}
                className="rounded-full border border-border px-3 py-1 text-[12px] text-foreground/60"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
