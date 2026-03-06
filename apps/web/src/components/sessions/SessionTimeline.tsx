'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Session } from '@meetsolis/shared';
import { SessionCard } from './SessionCard';
import { toast } from 'sonner';

interface SessionTimelineProps {
  sessions: Session[];
  clientId: string;
}

export function SessionTimeline({ sessions, clientId }: SessionTimelineProps) {
  const queryClient = useQueryClient();

  const summarizeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`/api/sessions/${sessionId}/summarize`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to summarize');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', clientId] });
      toast.success('Session summarized successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to summarize session');
    },
  });

  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
        <p className="text-[#6B7280]">No sessions yet.</p>
        <p className="mt-1 text-sm text-gray-400">
          Upload a transcript to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map(session => (
        <SessionCard
          key={session.id}
          session={session}
          onSummarize={summarizeMutation.mutate}
          isSummarizing={
            summarizeMutation.isPending &&
            summarizeMutation.variables === session.id
          }
        />
      ))}
    </div>
  );
}
