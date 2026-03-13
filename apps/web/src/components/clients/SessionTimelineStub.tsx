'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SessionUploadModal } from '@/components/sessions/SessionUploadModal';

interface SessionTimelineStubProps {
  clientId: string;
  onSessionUploaded?: () => void;
}

export function SessionTimelineStub({
  clientId,
  onSessionUploaded,
}: SessionTimelineStubProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-base font-semibold text-[#1A1A1A]">Sessions</h2>
      </div>
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

      <SessionUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientId={clientId}
        onSuccess={() => {
          onSessionUploaded?.();
        }}
      />
    </section>
  );
}
