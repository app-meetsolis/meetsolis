'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { SessionUploadModal } from '@/components/sessions/SessionUploadModal';

interface Session {
  id: string;
  title: string;
  session_date: string;
  status: string;
  summary: string | null;
}

interface SessionTimelineStubProps {
  clientId: string;
  onSessionUploaded?: () => void;
}

export function SessionTimelineStub({
  clientId,
  onSessionUploaded,
}: SessionTimelineStubProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ['sessions', clientId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions?client_id=${clientId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.sessions ?? [];
    },
  });

  function handleSuccess() {
    queryClient.invalidateQueries({ queryKey: ['sessions', clientId] });
    onSessionUploaded?.();
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-base font-semibold text-[#1A1A1A]">Sessions</h2>
        {sessions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            Upload Transcript
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center px-8 py-10 text-center">
          <p className="text-sm text-[#6B7280]">No sessions yet.</p>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Upload your first session transcript to get started.
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
        <ul className="divide-y divide-gray-100">
          {sessions.map(session => (
            <li key={session.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {session.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    {new Date(session.session_date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    session.status === 'complete'
                      ? 'bg-green-100 text-green-700'
                      : session.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-700'
                        : session.status === 'error'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {session.status}
                </span>
              </div>
              {session.summary && (
                <p className="mt-1 text-xs text-[#6B7280] line-clamp-2">
                  {session.summary}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <SessionUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientId={clientId}
        onSuccess={handleSuccess}
      />
    </section>
  );
}
