'use client';

/**
 * TranscriptModal (Story 6.2c)
 * One modal, one trigger per session. While a meeting is still streaming it
 * shows the live transcript; once complete it shows a clean, readable final
 * transcript plus an Audio tab (player + click-to-seek synced transcript).
 * Self-contained — driven entirely by props, no page-layout coupling.
 */

import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LiveTranscriptPanel } from './LiveTranscriptPanel';
import { TranscriptAudioPlayer } from './TranscriptAudioPlayer';
import { SyncedTranscriptView } from './SyncedTranscriptView';
import { normalizeChunks } from '@/lib/services/recall/process-transcript-chunk';
import type { TranscriptChunk } from '@meetsolis/shared';

interface SessionDetail {
  id: string;
  title: string;
  transcript_text: string | null;
  transcript_chunks: TranscriptChunk[] | null;
  transcript_streaming_started_at: string | null;
  transcript_streaming_complete: boolean | null;
}

interface Props {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SpeakerGroup {
  key: string;
  label: string;
  speaker: number;
  text: string;
}

function groupBySpeaker(chunks: TranscriptChunk[]): SpeakerGroup[] {
  const groups: SpeakerGroup[] = [];
  for (const c of chunks) {
    const label = c.speaker_name ?? `Speaker ${c.speaker}`;
    const last = groups[groups.length - 1];
    if (last && last.speaker === c.speaker && last.label === label) {
      last.text += ` ${c.text}`;
    } else {
      groups.push({
        key: `${c.start_ms}-${c.speaker}`,
        label,
        speaker: c.speaker,
        text: c.text,
      });
    }
  }
  return groups;
}

function FinalTranscript({ session }: { session: SessionDetail }) {
  const chunks = normalizeChunks(session.transcript_chunks ?? []);

  if (chunks.length > 0) {
    return (
      <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
        {groupBySpeaker(chunks).map(g => (
          <div key={g.key}>
            <p
              className={`text-[12px] font-semibold ${
                g.speaker === 0 ? 'text-primary' : 'text-foreground/55'
              }`}
            >
              {g.label}
            </p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
              {g.text}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (session.transcript_text) {
    return (
      <pre className="max-h-[55vh] overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-4 font-sans text-[13px] leading-relaxed text-foreground/80">
        {session.transcript_text}
      </pre>
    );
  }

  return (
    <p className="py-8 text-center text-[12px] text-foreground/30">
      No transcript available for this session.
    </p>
  );
}

function AudioTab({
  sessionId,
  chunks,
}: {
  sessionId: string;
  chunks: TranscriptChunk[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentMs, setCurrentMs] = useState(0);
  const [mediaError, setMediaError] = useState(false);

  const { data, isLoading, isError } = useQuery<{ audio_url: string }>({
    queryKey: ['audio-url', sessionId],
    queryFn: async () => {
      const r = await fetch(`/api/sessions/${sessionId}/audio-url`);
      if (!r.ok) throw new Error('NO_AUDIO');
      return r.json();
    },
    retry: false,
    staleTime: 60_000,
  });

  const handleSeek = (ms: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = ms / 1000;
    setCurrentMs(ms);
    void el.play();
  };

  if (isLoading) {
    return (
      <p className="py-8 text-center text-[12px] text-foreground/30">
        Loading recording…
      </p>
    );
  }

  if (isError || !data?.audio_url) {
    return (
      <p className="py-8 text-center text-[12px] text-foreground/30">
        No recording available for this session.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <TranscriptAudioPlayer
        ref={videoRef}
        src={data.audio_url}
        onTimeUpdate={setCurrentMs}
        onError={() => setMediaError(true)}
      />
      {mediaError && (
        <p className="text-[12px] text-foreground/40">
          Couldn&rsquo;t play the recording here.{' '}
          <a
            href={data.audio_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Open it in a new tab
          </a>
          .
        </p>
      )}
      <div className="max-h-[45vh] overflow-y-auto pr-1">
        <SyncedTranscriptView
          chunks={chunks}
          currentMs={currentMs}
          onSeek={handleSeek}
        />
      </div>
    </div>
  );
}

export function TranscriptModal({ sessionId, open, onOpenChange }: Props) {
  const { data: session, isLoading } = useQuery<SessionDetail>({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const r = await fetch(`/api/sessions/${sessionId}`);
      if (!r.ok) throw new Error('FETCH_ERROR');
      return (await r.json()).session;
    },
    enabled: open,
    staleTime: 30_000,
  });

  const isLiveStreaming =
    !!session?.transcript_streaming_started_at &&
    !session?.transcript_streaming_complete;

  const chunks = normalizeChunks(session?.transcript_chunks ?? []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {session?.title ?? 'Transcript'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Session transcript and audio playback
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <p className="py-8 text-center text-[12px] text-foreground/30">
            Loading…
          </p>
        )}

        {!isLoading && session && isLiveStreaming && (
          <LiveTranscriptPanel sessionId={sessionId} />
        )}

        {!isLoading && session && !isLiveStreaming && (
          <Tabs defaultValue="transcript">
            <TabsList>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="audio">Recording</TabsTrigger>
            </TabsList>
            <TabsContent value="transcript">
              <FinalTranscript session={session} />
            </TabsContent>
            <TabsContent value="audio">
              <AudioTab sessionId={sessionId} chunks={chunks} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
