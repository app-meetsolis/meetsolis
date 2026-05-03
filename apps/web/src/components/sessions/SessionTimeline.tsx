'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Session } from '@meetsolis/shared';
import { SessionCard } from '@/components/sessions/SessionCard';
import { SessionUploadModal } from '@/components/sessions/SessionUploadModal';

interface SessionTimelineProps {
  clientId: string;
}

async function fetchSessions(clientId: string): Promise<Session[]> {
  const res = await fetch(`/api/sessions?client_id=${clientId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.sessions ?? [];
}

function TimelineSkeletons() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="skeleton rounded-md h-20 w-full rounded-[12px]"
        />
      ))}
    </div>
  );
}

export function SessionTimeline({ clientId }: SessionTimelineProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ['sessions', clientId],
    queryFn: () => fetchSessions(clientId),
    refetchInterval: query =>
      query.state.data?.some(s => s.status === 'processing') ? 5000 : false,
  });

  async function onRetry(sessionId: string) {
    const session = sessions?.find(s => s.id === sessionId);
    const endpoint =
      session?.transcript_audio_url && !session?.transcript_text
        ? `/api/sessions/${sessionId}/transcribe`
        : `/api/sessions/${sessionId}/summarize`;
    try {
      await fetch(endpoint, { method: 'POST' });
    } catch {
      // silent — query will still refresh
    }
    queryClient.invalidateQueries({ queryKey: ['sessions', clientId] });
  }

  function handleUploadSuccess() {
    queryClient.invalidateQueries({ queryKey: ['sessions', clientId] });
  }

  return (
    <section className="rounded-[12px] border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold text-foreground">Sessions</h2>
        {(sessions?.length ?? 0) > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            Upload Transcript
          </Button>
        )}
      </div>

      <div className="p-4">
        {isLoading ? (
          <TimelineSkeletons />
        ) : !sessions?.length ? (
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No sessions yet. Upload your first session transcript to get
              started.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              Upload Session Transcript
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                clientId={clientId}
                onRetry={onRetry}
              />
            ))}
          </div>
        )}
      </div>

      <SessionUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientId={clientId}
        onSuccess={handleUploadSuccess}
      />
    </section>
  );
}
